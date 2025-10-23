"use client";

import { isOverwolf, useAccountStore } from "@repo/lib";
import Script from "next/script";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";
import { getNitroAds, NitroAds } from "./nitro-pay";
import { NITROPAY_SITE_ID } from "./constants";

type NitroState = "loading" | "validation" | "ready" | "error";

/**
 * Validates that NitroPay is fully loaded and not blocked/modified by ad blockers
 * AdGuard and other blockers often leave the nitroAds object but strip out functional methods
 */
function isNitroAdsValid(): boolean {
  if (!("nitroAds" in window)) {
    return false;
  }

  const nitroAds = window.nitroAds as NitroAds;

  // Check basic properties
  if (!nitroAds || nitroAds.siteId !== NITROPAY_SITE_ID) {
    return false;
  }

  // Verify critical methods exist and are actual functions
  // AdGuard strips these while leaving siteId intact
  if (
    typeof nitroAds.createAd !== "function" ||
    typeof nitroAds.addUserToken !== "function" ||
    typeof nitroAds.clearUserTokens !== "function"
  ) {
    return false;
  }

  // Check that the queue exists (NitroPay uses this for ad management)
  if (!Array.isArray(nitroAds.queue)) {
    return false;
  }

  // Verify loaded state and version
  if (typeof nitroAds.loaded !== "boolean" || !nitroAds.loaded) {
    return false;
  }

  if (typeof nitroAds.version !== "string" || nitroAds.version.length === 0) {
    return false;
  }

  return true;
}

const useNitroState = create<{
  state: NitroState;
  setState: (state: NitroState) => void;
}>((set) => ({
  state: "loading",
  setState: (state) => set({ state }),
}));

export function NitroScript({
  children,
  fallback,
  loading,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}): JSX.Element {
  const accountHasHydrated = useAccountStore((state) => state._hasHydrated);
  const adRemoval = useAccountStore((state) => state.perks.adRemoval);
  const email = useAccountStore((state) => state.email);
  const { state, setState } = useNitroState();

  useEffect(() => {
    if (state !== "validation" || adRemoval || isOverwolf) {
      return;
    }
    const now = Date.now();
    const intervalId = setInterval(() => {
      if (isNitroAdsValid()) {
        setState("ready");
        clearInterval(intervalId);
        return;
      }
      if (Date.now() - now > 2500) {
        setState("error");
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [state, adRemoval]);

  useEffect(() => {
    if (adRemoval || state !== "ready") {
      return;
    }
    try {
      if (email) {
        // User logged in - send hashed email to NitroPay
        getNitroAds()
          .addUserToken(email, "PLAIN")
          .then(() => {
            console.log("[NitroPay] Hashed email tracking enabled");
          })
          .catch((error) => {
            console.error("[NitroPay] Failed to add user token:", error);
          });
      } else {
        // User logged out - clear tokens
        getNitroAds().clearUserTokens();
        console.log("[NitroPay] User tokens cleared");
      }
    } catch (error) {
      console.error("[NitroPay] Error managing user tokens:", error);
      setState("error");
    }
  }, [state, email, adRemoval]);

  if (!accountHasHydrated) {
    return <>{loading}</>;
  }
  if (adRemoval || isOverwolf) {
    return <></>;
  }

  return (
    <>
      <Script
        onError={() => {
          setState("error");
        }}
        strategy="lazyOnload"
        onReady={() => {
          if (isNitroAdsValid()) {
            setState("ready");
          } else {
            setState("validation");
          }
        }}
        src={`https://s.nitropay.com/ads-${NITROPAY_SITE_ID}.js`}
      />
      {state === "loading" && loading}
      {state === "ready" && children}
      {state === "error" && fallback}
    </>
  );
}
