"use client";

import { isOverwolf, useAccountStore } from "@repo/lib";
import Script from "next/script";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";
import { NitroAds } from "./nitro-pay";
import { NITROPAY_SITE_ID } from "./constants";

type NitroState = "loading" | "ready" | "error";

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
  const { state, setState } = useNitroState();

  useEffect(() => {
    if (state !== "loading" || adRemoval || isOverwolf) {
      return;
    }
    const now = Date.now();
    const intervalId = setInterval(() => {
      if (
        "nitroAds" in window &&
        (window.nitroAds as NitroAds).siteId === NITROPAY_SITE_ID
      ) {
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
  }, [state]);

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
          if (
            "nitroAds" in window &&
            (window.nitroAds as NitroAds).siteId === NITROPAY_SITE_ID
          ) {
            setState("ready");
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
