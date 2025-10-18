"use client";
import { useEffect } from "react";
import { getNitroAds } from "./nitro-pay";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AdFreeContainer } from "./ad-free-container";
import { IS_DEMO_MODE } from "./constants";
import { AdPlaceholder } from "./ad-placeholder";

const mediaQuery = "(min-width: 768px)";
export function NitroPayVideoPlayer({
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
  const matched = useMediaQuery(mediaQuery);

  useEffect(() => {
    if (!matched || isLoading || isBlocked) {
      return;
    }
    try {
      getNitroAds().createAd(id, {
        targeting, // Custom targeting for reporting filters
        format: "video-nc",
        video: {
          mobile: "compact",
          interval: 10,
        },
        mediaQuery: mediaQuery,
        demo: IS_DEMO_MODE,
        debug: "silent",
      });
    } catch (error) {
      console.error(`[NitroPayVideoPlayer] Failed to create ad ${id}:`, error);
    }
  }, [matched, id, targeting, mediaQuery, isLoading, isBlocked]);

  if (!matched) {
    return <></>;
  }
  if (isLoading) {
    return (
      <AdPlaceholder
        type="loading"
        width="max-w-[400px]"
        height="h-[170px] lg:h-[203px]"
        className="md:block hidden"
      />
    );
  }

  if (isBlocked) {
    return (
      <AdPlaceholder
        type="blocked"
        width="max-w-[400px]"
        height="h-[170px] lg:h-[203px]"
        className="md:block hidden"
      />
    );
  }
  return (
    <AdFreeContainer>
      <div className="max-w-[400px] h-[170px] lg:h-[203px]" id={id} />
    </AdFreeContainer>
  );
}
