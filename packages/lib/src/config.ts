import type { MarkerOptions } from "./types";
import type { Region } from "./coordinates";
import type { Drawing, PrivateNode } from "./settings";
import { Game } from "./games";

// Conditional import of Next.js cache - only available in Next.js environments
let unstable_cache: typeof import("next/cache").unstable_cache | undefined;

try {
  const nextCache = await import("next/cache");
  unstable_cache = nextCache.unstable_cache;
} catch {
  // Not in a Next.js environment (e.g., Vite), caching will be disabled
  unstable_cache = undefined;
}

export type IconName =
  | "House"
  | "Map"
  | "Server"
  | "BookOpen"
  | "ScrollText"
  | "ArrowUp"
  | "Bug"
  | "NotepadText"
  | "Axe"
  | "Gift"
  | "MapPin"
  | "Trophy"
  | "SquareCheckBig"
  | "MessageSquareWarning"
  | "Grid"
  | "Megaphone"
  | "MonitorSmartphone"
  | "Heart"
  | "Handshake"
  | "Newspaper"
  | "MessageSquare"
  | "HelpCircle"
  | "FileText"
  | "ShieldCheck";

export type AppConfig = {
  name: string;
  domain: string;
  title: string;
  supportedLocales: string[];
  keywords: string[];
  appUrl: string | null;
  withoutLiveMode?: boolean;
  internalLinks?: {
    title: string;
    description?: string;
    href: string;
    linkText?: string;
    bgImage?: string;
    iconName: IconName;
  }[];
  promoLinks?: {
    title: string;
    href: string;
  }[];
  externalLinks?: { href: string; title: string }[];
  markerOptions?: MarkerOptions;
  game?: Game;
};

export type OverwolfAppConfig = {
  name: string;
  domain: string;
  title: string;
  gameClassId: number;
  appUrl: string;
  withoutLiveMode?: boolean;
  appId: string;
  discordApplicationId: string;
  markerOptions: MarkerOptions;
};

export type THGLAppConfig = {
  name: string;
  domain: string;
  title: string;
  withoutOverlayMode?: boolean;
  markerOptions: MarkerOptions;
  defaultHotkeys: Record<string, string>;
};

export type Version = {
  id: string;
  createdAt: number;
  data: {
    enDict: Record<string, string>;
    filters: FiltersConfig;
    regions: Region[];
    tiles: TilesConfig;
    globalFilters: GlobalFiltersConfig;
    typesIdMap: Record<string, string>;
    database: DatabaseConfig;
    drawings: DrawingsConfig;
  };
  more: {
    nodes: Record<string, string>;
    icons: string;
  };
};

export const TH_GL_URL = "https://www.th.gl";
export const API_FORGE_URL = "https://api-forge.th.gl";
// export const TH_GL_URL = "http://localhost:3006";
export const DATA_FORGE_URL = "https://data.th.gl";
// export const DATA_FORGE_URL = "http://localhost:3000";

export function getAppUrl(appName: string, path: string): string {
  return `${DATA_FORGE_URL}/${appName}${path}`;
}

// Helper to conditionally apply unstable_cache if available (Next.js), otherwise return the function as-is
function conditionalCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keys: string[],
  options: { revalidate: number },
): T {
  if (unstable_cache) {
    return unstable_cache(fn, keys, options) as T;
  }
  // In non-Next.js environments (Vite), just return the function without caching
  return fn;
}

export const fetchVersion = conditionalCache(
  async (appName: string): Promise<Version> => {
    const res = await fetch(getAppUrl(appName, "/version.json"));
    return res.json();
  },
  ["version"],
  {
    revalidate: 60,
  },
);

// Cache for version lookup maps to avoid recreating them on each call
const versionCacheMap = new WeakMap<
  Version,
  {
    reverseDictMap: Map<string, string[]>;
    tileKeys: Set<string>;
    filterValueIds: Set<string>;
    filterGroupIds: Set<string>;
  }
>();

function getVersionLookupCache(version: Version) {
  let cache = versionCacheMap.get(version);

  if (!cache) {
    // Build reverse dictionary map (value -> keys[])
    const reverseDictMap = new Map<string, string[]>();
    for (const [key, value] of Object.entries(version.data.enDict)) {
      const existing = reverseDictMap.get(value) || [];
      existing.push(key);
      reverseDictMap.set(value, existing);
    }

    // Build set of valid tile keys
    const tileKeys = new Set(Object.keys(version.data.tiles));

    // Build set of valid filter value IDs
    const filterValueIds = new Set<string>();
    const filterGroupIds = new Set<string>();
    for (const filter of version.data.filters) {
      filterGroupIds.add(filter.group);
      for (const value of filter.values) {
        filterValueIds.add(value.id);
      }
    }

    cache = { reverseDictMap, tileKeys, filterValueIds, filterGroupIds };
    versionCacheMap.set(version, cache);
  }

  return cache;
}

export function getMapNameFromVersion(
  version: Version,
  map: string,
): string | null {
  const decodedMap = decodeURIComponent(map);
  const { reverseDictMap, tileKeys } = getVersionLookupCache(version);

  const possibleKeys = reverseDictMap.get(decodedMap);
  if (!possibleKeys) return null;

  // Find first key that exists in tiles
  for (const key of possibleKeys) {
    if (tileKeys.has(key)) {
      return key;
    }
  }

  return null;
}

export function getTypeFromVersion(
  version: Version,
  type: string,
): string | null {
  const decodedType = decodeURIComponent(type);
  const { reverseDictMap, filterValueIds } = getVersionLookupCache(version);

  const possibleKeys = reverseDictMap.get(decodedType);
  if (!possibleKeys) return null;

  // Find first key that exists in filter values
  for (const key of possibleKeys) {
    if (filterValueIds.has(key)) {
      return key;
    }
  }

  return null;
}

export function getGroupFromVersion(
  version: Version,
  group: string,
): string | null {
  const decodedGroup = decodeURIComponent(group);
  const { reverseDictMap, filterGroupIds } = getVersionLookupCache(version);

  const possibleKeys = reverseDictMap.get(decodedGroup);
  if (!possibleKeys) return null;

  // Find first key that exists in filter groups
  for (const key of possibleKeys) {
    if (filterGroupIds.has(key)) {
      return key;
    }
  }

  return null;
}

export function getIconsUrl(
  appName: string,
  icon: string,
  iconPath?: string,
): string {
  if (icon.startsWith("/global_icons/game-icons")) {
    return `${DATA_FORGE_URL}${icon.replace("/global_icons", "")}`;
  }
  if (icon.includes("global_icons")) {
    return icon;
  }
  if ((icon === "icons.webp" || icon === "/icons/icons.webp") && iconPath) {
    return getAppUrl(appName, iconPath);
  }
  if (icon.startsWith("/")) {
    return getAppUrl(appName, icon);
  }
  return getAppUrl(appName, `/icons/${icon}`);
}

export const fetchDict = conditionalCache(
  async (
    appName: string,
    locale: string = "en",
  ): Promise<Record<string, string>> => {
    const res = await fetch(
      `${DATA_FORGE_URL}/${appName}/dicts/${locale}.json`,
    );
    return res.json();
  },
  ["dict"],
  {
    revalidate: 60,
  },
);

export const fetchDatabase = conditionalCache(
  async (appName: string): Promise<DatabaseConfig> => {
    const res = await fetch(
      `${DATA_FORGE_URL}/${appName}/config/database.json`,
    );
    return res.json();
  },
  ["database"],
  {
    revalidate: 60,
  },
);

export const fetchFilters = conditionalCache(
  async (appName: string): Promise<FiltersConfig> => {
    const res = await fetch(`${DATA_FORGE_URL}/${appName}/config/filters.json`);
    return res.json();
  },
  ["filters"],
  {
    revalidate: 60,
  },
);

export const fetchTiles = conditionalCache(
  async (appName: string): Promise<TilesConfig> => {
    const res = await fetch(`${DATA_FORGE_URL}/${appName}/config/tiles.json`);
    return res.json();
  },
  ["tiles"],
  {
    revalidate: 60,
  },
);

export type GlobalFiltersConfig = Array<{
  group: string;
  values: Array<{
    id: string;
    defaultOn?: boolean;
  }>;
}>;

export type DrawingsConfig = {
  name: string;
  isShared?: boolean;
  url?: string;
  nodes?: PrivateNode[];
  drawing?: Drawing;
}[];

export type IconSprite = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Icon = string | IconSprite;
export type DatabaseConfig<T = Record<string, any>> = {
  type: string;
  items: {
    id: string;
    icon?: Icon;
    props: T;
    groupId?: string;
  }[];
}[];

export type FiltersConfig = {
  group: string;
  defaultOpen?: boolean;
  defaultOn?: boolean;
  values: {
    id: string;
    icon:
      | string
      | {
          name: string;
          url: string;
          x: number;
          y: number;
          width: number;
          height: number;
        };
    size?: number;
    sort?: number;
    live_only?: boolean;
    autoDiscover?: boolean;
    defaultOn?: boolean;
  }[];
}[];

export type RegionsConfig = Region[];

export type TileLayer = {
  url?: string;
  defaultTitle?: string;
  options?: {
    minNativeZoom: number;
    maxNativeZoom: number;
    bounds: [[number, number], [number, number]];
    tileSize: number;
    threshold?: number;
  };
  minZoom?: number;
  maxZoom?: number;
  fitBounds?: [[number, number], [number, number]];
  view?: { center?: [number, number]; zoom?: number };
  transformation?: [number, number, number, number];
  threshold?: number;
  rotation?: {
    center: [number, number];
    angle: number;
  };
};
export type TilesConfig = Record<string, TileLayer>;
