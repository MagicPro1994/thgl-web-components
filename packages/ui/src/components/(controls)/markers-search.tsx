"use client";

import { cn, TilesConfig, useSettingsStore, useUserStore } from "@repo/lib";
import { ReactNode, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { MarkersSearchResults } from "./markers-search-results";
import { MarkersFilters } from "./markers-filters";
import { ScrollArea } from "../ui/scroll-area";
import {
  FoldVertical,
  Search,
  TriangleAlert,
  UnfoldVertical,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { MapSelect } from "./map-select";
import { Presets } from "./presets";
import { GlobalFilters } from "./global-filters";
import { NodeDetails } from "../(data)";
import { useT } from "../(providers)";
import { AdditionalTooltipType } from "../(content)";

export function MarkersSearch({
  lastMapUpdate,
  appName,
  children,
  tileOptions,
  additionalFilters,
  additionalTooltip,
  embed,
  hideComments,
  iconsPath,
  className,
}: {
  lastMapUpdate?: number;
  appName: string;
  children?: ReactNode;
  tileOptions: TilesConfig;
  additionalFilters?: ReactNode;
  additionalTooltip?: AdditionalTooltipType;
  embed?: boolean;
  hideComments?: boolean;
  iconsPath: string;
  className?: string;
}): JSX.Element {
  const t = useT();
  const { _hasHydrated, search, setSearch, searchIsLoading, selectedNodeId } =
    useUserStore();
  const [internalSearch, setInternalSearch] = useState(search);
  const profileSettings = useSettingsStore((state) =>
    state.getCurrentProfileSettings(),
  );
  const showFilters = profileSettings.showFilters;
  const toggleShowFilters = useSettingsStore(
    (state) => state.toggleShowFilters,
  );

  const expandedFilters = profileSettings.expandedFilters;
  const toggleExpandedFilters = useSettingsStore(
    (state) => state.toggleExpandedFilters,
  );

  const mapNames = Object.entries(tileOptions).map(([k, v]) => ({
    name: k,
    defaultTitle: v.defaultTitle || t(k),
  }));

  useEffect(() => {
    if (_hasHydrated) {
      setInternalSearch(search);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(internalSearch);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [internalSearch]);
  const isLoading = searchIsLoading || search !== internalSearch;

  return (
    <div
      className={cn(
        `fixed w-[200px] md:w-[300px] lg:w-[363px] top-[64px] left-2 bottom-2 z-[500] md:ml-[77px] pointer-events-none h-[calc(100vh-74px)] flex flex-col gap-1`,
        { "top-2 md:ml-0 h-[100vh]": embed },
        className,
      )}
    >
      {selectedNodeId && (
        <NodeDetails
          id={selectedNodeId}
          appName={appName}
          hideComments={hideComments}
          additionalTooltip={additionalTooltip}
        />
      )}
      <div
        className={cn(
          "relative flex w-full pointer-events-auto bg-card border rounded-md",
          { hidden: selectedNodeId },
        )}
      >
        <Input
          autoComplete="off"
          autoCorrect="off"
          className=" placeholder:text-gray-400"
          onChange={(event) => {
            setInternalSearch(event.target.value);
          }}
          placeholder={t("markers.search.placeholder")}
          type="text"
          value={internalSearch}
        />
        {internalSearch ? (
          <button
            className="flex absolute inset-y-0 right-6 items-center pr-2 text-gray-400 hover:text-gray-200"
            onClick={() => {
              setInternalSearch("");
            }}
            type="button"
          >
            <svg
              className="block w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none" stroke="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
            <div className="h-3/6 w-px bg-gray-600 mx-1.5" />
          </button>
        ) : (
          <div className="flex absolute inset-y-0 right-6 items-center pr-2 text-gray-400">
            <svg
              className="block w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <div className="h-3/6 w-px bg-gray-600 mx-1.5" />
          </div>
        )}
        <button
          aria-expanded={showFilters}
          aria-haspopup="menu"
          aria-label="Open filters"
          className={cn(
            `flex absolute inset-y-0 right-1 items-center pr-2 text-gray-400 hover:text-gray-200 md:text-white`,
          )}
          onClick={toggleShowFilters}
          type="button"
        >
          {showFilters ? (
            <FoldVertical className="h-4 w-4" />
          ) : (
            <UnfoldVertical className="h-4 w-4" />
          )}
        </button>
      </div>
      <div
        className={cn(
          "pointer-events-auto border rounded-md bg-card text-card-foreground shadow grid relative pb-1 overflow-hidden text-sm",
          {
            collapse: !showFilters,
            hidden: selectedNodeId,
          },
        )}
      >
        {lastMapUpdate && (
          <div className="italic text-xs text-muted-foreground px-2.5 py-1">
            {t("markers.search.update")}{" "}
            <span>
              {new Date(lastMapUpdate).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {additionalFilters && (
          <>
            {additionalFilters}
            <Separator />
          </>
        )}
        {mapNames.length > 1 && (
          <>
            <MapSelect mapNames={mapNames} />
            <Separator />
          </>
        )}
        <Presets />
        <Separator />
        <GlobalFilters />
        <ScrollArea
          className={cn("max-h-[40vh]", {
            "md:max-h-[25vh]": !expandedFilters,
            "md:max-h-none": expandedFilters,
          })}
          type="auto"
        >
          {internalSearch ? (
            <>
              {isLoading && internalSearch.length >= 3 && (
                <div className="p-2 text-center">
                  <Search className="w-4 h-4 mx-auto" />
                  {t("markers.search.searching")}
                </div>
              )}
              {internalSearch.length < 3 && (
                <div className="p-2 text-center">
                  <TriangleAlert className="w-4 h-4 mx-auto" />
                  {t("markers.search.moreCharacters")}
                </div>
              )}
              {!isLoading && internalSearch.length >= 3 && (
                <MarkersSearchResults
                  hasMultipleMaps={mapNames.length > 1}
                  appName={appName}
                  iconsPath={iconsPath}
                />
              )}
            </>
          ) : (
            <MarkersFilters appName={appName} iconsPath={iconsPath} />
          )}
        </ScrollArea>
      </div>
      <button
        className={cn(
          "pointer-events-auto hover:text-primary mx-auto bg-card p-1 rounded-b-md -mt-4 hidden",
          {
            collapse: !showFilters,
            "md:block": !selectedNodeId,
          },
        )}
        onClick={toggleExpandedFilters}
      >
        {expandedFilters ? (
          <FoldVertical className="h-4 w-4" />
        ) : (
          <UnfoldVertical className="h-4 w-4" />
        )}
      </button>
      <div className="grow" />
      {children}
    </div>
  );
}
