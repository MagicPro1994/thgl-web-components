"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMap } from "./store";
import { PlayerMarker } from "./player-marker";
import leaflet from "leaflet";
import type { ActorPlayer } from "@repo/lib/overwolf";
import {
  getIconsUrl,
  MarkerOptions,
  TilesConfig,
  useUserStore,
} from "@repo/lib";
import { useSettingsStore } from "@repo/lib";
import { useT } from "../(providers)";
import { applyColorBlindTransform } from "./color-blind";
import type { ColorBlindMode } from "@repo/lib";
import { useThrottledEffect } from "../ui/useThrottleEffect";

export function Player({
  appName,
  player,
  markerOptions,
  iconsPath,
  tilesConfig,
}: {
  appName: string;
  player: ActorPlayer;
  markerOptions: MarkerOptions;
  iconsPath: string;
  tilesConfig: TilesConfig;
}): JSX.Element {
  const map = useMap();
  const marker = useRef<PlayerMarker | null>(null);
  const followPlayerPosition = true;
  const setMapName = useUserStore((state) => state.setMapName);
  const t = useT();
  const profileSettings = useSettingsStore((state) =>
    state.getCurrentProfileSettings(),
  );
  const baseIconSize = profileSettings.baseIconSize;
  const playerIconSize = profileSettings.playerIconSize;
  const colorBlindMode = profileSettings.colorBlindMode;
  const colorBlindSeverity = profileSettings.colorBlindSeverity;

  const iconCache = useRef<Map<string, string>>(new Map());

  // Memoize icon URL and size to avoid recalculating on every render
  const iconUrl = useMemo(() => {
    const iconName = markerOptions.playerIcon
      ? `/icons/${markerOptions.playerIcon}`
      : "https://th.gl/global_icons/player.png";
    return getIconsUrl(appName, iconName, iconsPath);
  }, [appName, markerOptions.playerIcon, iconsPath]);

  const iconSize = useMemo(
    () => [
      36 * baseIconSize * playerIconSize,
      36 * baseIconSize * playerIconSize,
    ],
    [baseIconSize, playerIconSize],
  );

  async function buildIcon(
    iconUrl: string,
    size: number[],
    mode: ColorBlindMode,
    severity: number,
  ) {
    const cacheKey = `${iconUrl}@${size[0]}x${size[1]}:${mode}:${severity.toFixed(2)}`;
    const cached = iconCache.current.get(cacheKey);
    if (cached) {
      return leaflet.icon({
        iconUrl: cached,
        className: "player",
        iconSize: size as any,
      });
    }
    if (mode === "none" || severity <= 0) {
      return leaflet.icon({
        iconUrl,
        className: "player",
        iconSize: size as any,
      });
    }
    try {
      // Load image once and reuse it for canvas drawing
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("player-icon-load"));
        image.src = iconUrl;
      });

      const canvas = document.createElement("canvas");
      const [w, h] = size;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      applyColorBlindTransform(
        imageData.data,
        mode as Exclude<ColorBlindMode, "none">,
        severity,
      );
      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL();
      iconCache.current.set(cacheKey, dataUrl);
      return leaflet.icon({
        iconUrl: dataUrl,
        className: "player",
        iconSize: size as any,
      });
    } catch (e) {
      // Fallback to unprocessed icon on error
      return leaflet.icon({
        iconUrl,
        className: "player",
        iconSize: size as any,
      });
    }
  }

  useEffect(() => {
    if (!map?.mapName) {
      return;
    }

    const isOnMap = !player.mapName || player.mapName === map.mapName;
    if (!isOnMap) {
      return;
    }

    const run = async () => {
      const icon = await buildIcon(
        iconUrl,
        iconSize,
        colorBlindMode,
        colorBlindSeverity,
      );

      if (!marker.current) {
        const tile = tilesConfig[map.mapName];
        const rotationOffset = tile?.rotation?.angle;
        marker.current = new PlayerMarker([player.x, player.y], {
          icon,
          interactive: false,
          rotation: player.r,
          pane: "tooltipPane",
          rotationOffset,
        });
      } else {
        marker.current.setIcon(icon);
        marker.current.updatePosition(player);
      }

      try {
        marker.current.addTo(map);
        map.panTo([player.x, player.y], {
          animate: false,
          duration: 0,
          easeLinearity: 1,
          noMoveStart: true,
        });
      } catch (e) {}
    };

    run();

    return () => {
      try {
        marker.current?.remove();
        marker.current = null;
      } catch (e) {}
    };
  }, [map?.mapName, player?.mapName]);

  // Update icon when size or color-blind mode changes
  useEffect(() => {
    if (!marker.current) return;
    const run = async () => {
      const newIcon = await buildIcon(
        iconUrl,
        iconSize,
        colorBlindMode,
        colorBlindSeverity,
      );
      try {
        marker.current?.setIcon(newIcon);
      } catch (e) {}
    };
    run();
  }, [iconUrl, iconSize, colorBlindMode, colorBlindSeverity]);

  useThrottledEffect(
    () => {
      if (!map?.mapName || !player || !marker.current) {
        return;
      }
      marker.current.updatePosition(player);

      const isOnMap = !player.mapName || player.mapName === map.mapName;
      if (!isOnMap) {
        return;
      }

      if (followPlayerPosition) {
        // Use Leaflet's built-in smooth panning
        // panTo() internally stops previous animations with proper canvas clearing
        // Duration of 0.5s provides smooth movement while allowing overlapping animations
        map.panTo([player.x, player.y], {
          animate: true,
          duration: 0.5,
          easeLinearity: 1,
          noMoveStart: true,
        });
      }
    },
    [map?.mapName, player, followPlayerPosition],
    50,
  );

  useEffect(() => {
    if (!player?.mapName || !map) {
      return;
    }
    // Use 'in' operator for efficient object property check instead of Object.keys
    if (!(player.mapName in tilesConfig)) {
      return;
    }
    if (player.mapName !== map.mapName) {
      console.log("Setting map name", player.mapName);
      setMapName(player.mapName, [player.x, player.y], map.getZoom());
      if (location.pathname.includes("/maps/")) {
        window.history.pushState({}, "", `/maps/${t(player.mapName)}`);
      }
    }
  }, [player?.mapName]);

  return <></>;
}
