// Actors API helper for sending game data with tracking control support

type Actor = {
  address: number;
  type: string;
  x: number;
  y: number;
  z: number;
  mapName?: string;
  seed?: string;
};

// Track disabled state per game
const disabledUntil: Record<string, number> = {};

/**
 * Check if tracking is currently disabled for a game
 */
function isTrackingDisabled(gameName: string): boolean {
  const disabledTime = disabledUntil[gameName];
  if (!disabledTime) {
    return false;
  }
  return Date.now() < disabledTime;
}

/**
 * Get current app version from Overwolf manifest
 */
async function getAppVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    overwolf.extensions.current.getManifest((result) => {
      if (result.success && result.meta.version) {
        resolve(result.meta.version);
      } else {
        reject(new Error("Failed to get app version"));
      }
    });
  });
}

/**
 * Handle API error responses (403 tracking disabled, 426 version too old)
 */
function handleErrorResponse(
  gameName: string,
  status: number,
  errorData: any,
): void {
  if (status === 403 && errorData.error === "tracking_disabled") {
    // Tracking is disabled
    const message = errorData.message || "Tracking is currently disabled";
    const retryAfter = errorData.retryAfter || 600; // Default 10 minutes

    // Set disabled until timestamp
    disabledUntil[gameName] = Date.now() + retryAfter * 1000;

    console.warn(
      `[ActorsAPI] Tracking disabled for ${gameName}: ${message} (retry in ${retryAfter}s)`,
    );
  } else if (status === 426 && errorData.error === "version_too_old") {
    // Version is too old
    const message = errorData.message || "Your app version is too old";
    const minVersion = errorData.minVersion || "unknown";
    const currentVersion = errorData.currentVersion || "unknown";

    console.error(
      `[ActorsAPI] Version too old for ${gameName}: ${message}`,
      `\nCurrent: ${currentVersion}, Minimum: ${minVersion}`,
      `\nPlease update your app from the Overwolf Appstore.`,
    );

    // TODO: Show in-app notification to user about version requirement
  } else {
    console.error(
      `[ActorsAPI] Server returned ${status} for ${gameName}:`,
      errorData,
    );
  }
}

/**
 * Send actors to the THGL Actors API
 * Handles tracking control (403) and version validation (426) errors
 *
 * @param gameName - Game identifier (e.g., "once-human", "palworld")
 * @param actors - Array of actor objects to send
 * @param seed - Optional world seed for seed-aware games
 * @returns Promise that resolves when actors are sent (or silently skipped)
 */
export async function sendActorsToAPI(
  gameName: string,
  actors: Actor[],
  seed?: string,
): Promise<void> {
  if (actors.length === 0) {
    return;
  }

  // Check if tracking is disabled
  if (isTrackingDisabled(gameName)) {
    return; // Silently skip - user has already been notified
  }

  try {
    // Get app version for validation
    const version = await getAppVersion();

    // Prepare request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-App-Version": version,
    };

    if (seed) {
      headers["seed"] = seed;
    }

    // Send request
    const response = await fetch(
      `https://actors-api.th.gl/actors/${gameName}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(actors),
      },
    );

    // Handle error responses
    if (!response.ok) {
      if (response.status === 403 || response.status === 426) {
        try {
          const errorData = await response.json();
          handleErrorResponse(gameName, response.status, errorData);
        } catch {
          console.error(
            `[ActorsAPI] Failed to parse error response (${response.status})`,
          );
        }
      } else {
        console.error(
          `[ActorsAPI] Failed to send actors: HTTP ${response.status}`,
        );
      }
    }
    // Success - silently continue (200/201)
  } catch (error) {
    // Network errors, etc. - log but don't block
    console.error(`[ActorsAPI] Error sending actors for ${gameName}:`, error);
  }
}
