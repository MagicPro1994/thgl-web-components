"use client";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AdFreeContainer } from "./ad-free-container";
import { useEffect } from "react";
import { getNitroAds } from "./nitro-pay";
import { IS_DEMO_MODE } from "./constants";
import { AdPlaceholder } from "./ad-placeholder";

const smallMediaQuery = "(min-width: 768px)";
export function FloatingMobileBanner({
  bannerId,
  videoId,
  targeting,
  isLoading = false,
  isBlocked = false,
}: {
  bannerId: string;
  videoId: string;
  targeting?: Record<string, string>;
  isLoading?: boolean;
  isBlocked?: boolean;
}): JSX.Element {
  const matched = useMediaQuery(smallMediaQuery);

  useEffect(() => {
    if (matched || isLoading || isBlocked) {
      return;
    }
    try {
      getNitroAds().createAd(bannerId, {
        targeting, // Custom targeting for reporting filters
        refreshTime: 30,
        renderVisibleOnly: false,
        sizes: [["320", "50"]],
        demo: IS_DEMO_MODE,
        debug: "silent",
      });
      getNitroAds().createAd(videoId, {
        targeting, // Custom targeting for reporting filters
        refreshTime: 30,
        format: "floating",
        report: {
          enabled: true,
          icon: true,
          wording: "Report Ad",
          position: "top-left",
        },
        demo: IS_DEMO_MODE,
        debug: "silent",
      });
    } catch (error) {
      console.error(
        `[FloatingMobileBanner] Failed to create ads ${bannerId}, ${videoId}:`,
        error,
      );
    }
  }, [matched, bannerId, videoId, targeting, isLoading, isBlocked]);

  if (matched) {
    return <></>;
  }

  if (isLoading) {
    return (
      <AdPlaceholder
        type="loading"
        width="w-[320px]"
        height="h-[50px]"
        className="w-fit mx-auto fixed bottom-0 right-0 z-[99999]"
      />
    );
  }

  if (isBlocked) {
    return (
      <AdPlaceholder
        type="blocked"
        width="w-[320px]"
        height="h-[50px]"
        className="w-fit mx-auto fixed bottom-0 right-0 z-[99999]"
        hideBlockedText
      />
    );
  }
  return (
    <AdFreeContainer
      className={"w-fit mx-auto fixed bottom-0 right-0 z-[99999]"}
      closable={
        <div className="rounded h-[133.4px] w-full bg-zinc-800/30 flex flex-col justify-center text-gray-500 mx-auto">
          <div id={videoId} className="h-full w-full" />
        </div>
      }
    >
      <div
        className="rounded h-[50px] w-[320px] bg-zinc-800/30 flex flex-col justify-center text-gray-500"
        id={bannerId}
      />
    </AdFreeContainer>
  );
}
