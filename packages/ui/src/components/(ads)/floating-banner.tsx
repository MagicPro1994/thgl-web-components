"use client";
import { useEffect } from "react";
import { getNitroAds } from "./nitro-pay";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AdFreeContainer } from "./ad-free-container";
import { cn } from "@repo/lib";
import { IS_DEMO_MODE } from "./constants";
import { AdPlaceholder } from "./ad-placeholder";

const smallMediaQuery = "(min-width: 768px)";
const bigMediaQuery = "(min-width: 1250px)";
export function FloatingBanner({
  id,
  targeting,
  isLoading = false,
  isBlocked = false,
}: {
  id: string;
  targeting?: Record<string, string>;
  isLoading?: boolean;
  isBlocked?: boolean;
}): JSX.Element {
  const smallMatched = useMediaQuery(smallMediaQuery);
  const bigMatched = useMediaQuery(bigMediaQuery);

  useEffect(() => {
    if (!smallMatched || isLoading || isBlocked) {
      return;
    }
    try {
      const sizes = bigMatched
        ? [
            ["300", "600"],
            ["300", "250"],
            ["160", "600"],
          ]
        : [["160", "600"]];
      getNitroAds().createAd(id, {
        targeting, // Custom targeting for reporting filters
        refreshTime: 30,
        renderVisibleOnly: false,
        sizes: sizes,
        mediaQuery: smallMediaQuery,
        debug: "silent",
        demo: IS_DEMO_MODE,
      });
    } catch (error) {
      console.error(`[FloatingBanner] Failed to create ad ${id}:`, error);
    }
  }, [smallMatched, bigMatched, id, targeting, isLoading, isBlocked]);

  if (!smallMatched) {
    return <></>;
  }

  if (isLoading) {
    return (
      <AdPlaceholder
        type="loading"
        width={bigMatched ? "w-[300px]" : "w-[160px]"}
        height="h-[600px]"
        className="fixed bottom-2 right-2"
      />
    );
  }

  if (isBlocked) {
    return (
      <AdPlaceholder
        type="blocked"
        width={bigMatched ? "w-[300px]" : "w-[160px]"}
        height="h-[600px]"
        className="fixed bottom-2 right-2"
      />
    );
  }
  return (
    <AdFreeContainer className="fixed bottom-2 right-2">
      <div
        id={id}
        className={cn(
          "min-h-[600px]",
          bigMatched ? "min-w-[300px]" : "min-w-[160px]",
        )}
      />
    </AdFreeContainer>
  );
}
