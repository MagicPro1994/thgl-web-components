import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withStorageDOMEvents } from "./dom";
import { putSharedFilters } from "./shared-nodes";

export type PrivateNode = {
  id: string;
  name?: string;
  description?: string;
  icon: {
    name: string;
    url: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } | null;
  color?: string;
  radius: number;
  p: [number, number];
  mapName: string;
};

export type Drawing = {
  id: string;
  polylines?: {
    positions: [number, number][];
    size: number;
    color: string;
    mapName: string;
  }[];
  rectangles?: {
    positions: [number, number][];
    size: number;
    color: string;
    mapName: string;
  }[];
  polygons?: {
    positions: [number, number][];
    size: number;
    color: string;
    mapName: string;
  }[];
  circles?: {
    center: [number, number];
    radius: number;
    size: number;
    color: string;
    mapName: string;
  }[];
  texts?: {
    position: [number, number];
    text: string;
    size: number;
    color: string;
    mapName: string;
  }[];
};

export type DrawingsAndNodes = {
  name: string;
  isShared?: boolean;
  url?: string;
  nodes?: PrivateNode[];
  drawing?: Drawing;
};

export type ColorBlindMode =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia";

export type ProfileData = {
  // Discovered nodes
  discoveredNodes: string[];
  hideDiscoveredNodes: boolean;
  // My Filters
  myFilters: DrawingsAndNodes[];
  // UI Settings
  colorBlindMode: ColorBlindMode;
  colorBlindSeverity: number;
  fitBoundsOnChange: boolean;
  transforms: Record<string, string>;
  mapTransform: {
    borderRadius: string;
    transform: string;
    width: string;
    height: string;
  } | null;
  mapFilter: string;
  // Icon sizes
  baseIconSize: number;
  playerIconSize: number;
  iconSizeByGroup: Record<string, number>;
  iconSizeByFilter: Record<string, number>;
  // Trace line
  showTraceLine: boolean;
  traceLineLength: number;
  traceLineRate: number;
  traceLineColor: string;
  // Grid and filters
  showGrid: boolean;
  showFilters: boolean;
  expandedFilters: boolean;
  // Drawing
  drawingColor: string;
  drawingSize: number;
  textColor: string;
  textSize: number;
  // Presets
  presets: Record<string, string[]>;
};

export type Profile = {
  id: string;
  name: string;
  data: ProfileData;
  createdAt: number;
  updatedAt: number;
};

type SettingsStore = {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  hotkeys: Record<string, string>;
  setHotkey: (key: string, value: string) => void;
  setHotkeys: (hotkeys: Record<string, string>) => void;
  groupName: string;
  setGroupName: (groupName: string) => void;
  liveMode: boolean;
  setLiveMode: (liveMode: boolean) => void;
  toggleLiveMode: () => void;
  overlayMode: boolean | null;
  setOverlayMode: (overlayMode: boolean) => void;
  overlayFullscreen: boolean;
  toggleOverlayFullscreen: () => void;
  lockedWindow: boolean;
  toggleLockedWindow: () => void;
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  colorBlindSeverity: number;
  setColorBlindSeverity: (severity: number) => void;
  transforms: Record<string, string>;
  setTransform: (id: string, transform: string) => void;
  mapTransform: {
    borderRadius: string;
    transform: string;
    width: string;
    height: string;
  } | null;
  setMapTransform: (mapTransform: {
    borderRadius: string;
    transform: string;
    width: string;
    height: string;
  }) => void;
  mapFilter: string;
  setMapFilter: (mapFilter: string) => void;
  windowOpacity: number;
  setWindowOpacity: (windowOpacity: number) => void;
  resetTransform: () => void;
  discoveredNodes: string[];
  isDiscoveredNode: (nodeId: string) => boolean;
  toggleDiscoveredNode: (nodeId: string) => void;
  setDiscoverNode: (nodeId: string, discovered: boolean) => void;
  hideDiscoveredNodes: boolean;
  toggleHideDiscoveredNodes: () => void;
  setDiscoveredNodes: (discoveredNodes: string[]) => void;
  actorsPollingRate: number;
  setActorsPollingRate: (actorsPollingRate: number) => void;
  showTraceLine: boolean;
  toggleShowTraceLine: () => void;
  traceLineLength: number;
  setTraceLineLength: (traceLineLength: number) => void;
  traceLineRate: number;
  setTraceLineRate: (traceLineRate: number) => void;
  traceLineColor: string;
  setTraceLineColor: (traceLineColor: string) => void;
  displayDiscordActivityStatus: boolean;
  setDisplayDiscordActivityStatus: (
    displayDiscordActivityStatus: boolean,
  ) => void;
  presets: Record<string, string[]>;
  addPreset: (presetName: string, filters: string[]) => void;
  removePreset: (presetName: string) => void;
  tempPrivateNode: (Partial<PrivateNode> & { filter?: string }) | null;
  setTempPrivateNode: (
    tempPrivateNode: (Partial<PrivateNode> & { filter?: string }) | null,
  ) => void;
  tempPrivateDrawing: (Partial<Drawing> & { name?: string }) | null;
  setTempPrivateDrawing: (
    tempPrivateDrawing: (Partial<Drawing> & { name?: string }) | null,
  ) => void;
  drawingColor: string;
  setDrawingColor: (drawingColor: string) => void;
  drawingSize: number;
  setDrawingSize: (drawingSize: number) => void;
  textColor: string;
  setTextColor: (textColor: string) => void;
  textSize: number;
  setTextSize: (textSize: number) => void;
  baseIconSize: number;
  setBaseIconSize: (baseIconSize: number) => void;
  playerIconSize: number;
  setPlayerIconSize: (playerIconSize: number) => void;
  iconSizeByGroup: Record<string, number>;
  setIconSizeByGroup: (group: string, size: number) => void;
  iconSizeByFilter: Record<string, number>;
  setIconSizeByFilter: (id: string, size: number) => void;
  fitBoundsOnChange: boolean;
  toggleFitBoundsOnChange: () => void;
  myFilters: DrawingsAndNodes[];
  setMyFilters: (myFilters: DrawingsAndNodes[]) => void;
  setMyFilter: (name: string, myFilter: Partial<DrawingsAndNodes>) => void;
  addMyFilter: (myFilter: DrawingsAndNodes) => void;
  removeMyFilter: (myFilterName: string) => void;
  removeMyNode: (nodeId: string) => void;
  showGrid: boolean;
  toggleShowGrid: () => void;
  showFilters: boolean;
  toggleShowFilters: () => void;
  expandedFilters: boolean;
  toggleExpandedFilters: () => void;
  // Peer Link / Mesh settings
  peerCode: string;
  setPeerCode: (code: string) => void;
  lastMeSenderId: string;
  setLastMeSenderId: (id: string) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  autoJoinPeer: boolean;
  setAutoJoinPeer: (autoJoin: boolean) => void;
  autoLiveModeWithMe: boolean;
  setAutoLiveModeWithMe: (autoLiveMode: boolean) => void;
  // Profile Management
  currentProfileId: string;
  profiles: Profile[];
  createProfile: (name: string) => void;
  switchProfile: (profileId: string) => void;
  updateCurrentProfile: () => void;
  renameProfile: (profileId: string, newName: string) => void;
  deleteProfile: (profileId: string) => void;
  exportProfile: (profileId: string) => Profile | null;
  importProfile: (profile: Profile) => void;
  duplicateProfile: (profileId: string) => void;
  // Deprecated
  privateNodes?: PrivateNode[];
  privateDrawings?: Drawing[];
  sharedFilters?: {
    url: string;
    filter: string;
  }[];
};

const getStorageName = () => {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/apps/")) {
      const appId = window.location.pathname.split("/")[2];
      return `thgl-settings-${appId}`;
    }
  }
  return "settings-storage";
};
export const useSettingsStore = create(
  persist<SettingsStore>(
    (set, get) => {
      return {
        _hasHydrated: false,
        setHasHydrated: (state) => {
          set({
            _hasHydrated: state,
          });
        },
        hotkeys: {},
        setHotkey: (key, value) =>
          set((state) => ({
            hotkeys: {
              ...state.hotkeys,
              [key]: value,
            },
          })),
        setHotkeys: (hotkeys) => set({ hotkeys }),
        groupName: "",
        setGroupName: (groupName) => set({ groupName }),
        liveMode: true,
        setLiveMode: (liveMode) => set({ liveMode }),
        toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),
        overlayMode: null,
        setOverlayMode: (overlayMode) =>
          set({
            overlayMode,
          }),
        overlayFullscreen: false,
        toggleOverlayFullscreen: () =>
          set((state) => ({ overlayFullscreen: !state.overlayFullscreen })),
        lockedWindow: false,
        toggleLockedWindow: () =>
          set((state) => ({ lockedWindow: !state.lockedWindow })),
        colorBlindMode: "none",
        setColorBlindMode: (mode) => set({ colorBlindMode: mode }),
        colorBlindSeverity: 1,
        setColorBlindSeverity: (severity) =>
          set({ colorBlindSeverity: Math.max(0, Math.min(1, severity)) }),
        transforms: {},
        setTransform: (id, transform) =>
          set((state) => ({
            transforms: {
              ...state.transforms,
              [id]: transform,
            },
          })),
        mapTransform: null,
        setMapTransform: (mapTransform) => set({ mapTransform }),
        mapFilter: "none",
        setMapFilter: (mapFilter) => set({ mapFilter }),
        windowOpacity: 1,
        setWindowOpacity: (windowOpacity) => set({ windowOpacity }),
        resetTransform: () => {
          set({
            transforms: {},
            mapTransform: null,
            playerIconSize: 1,
            baseIconSize: 1,
            iconSizeByFilter: {},
            iconSizeByGroup: {},
          });
        },
        discoveredNodes: [],
        isDiscoveredNode: (nodeId) => {
          const { discoveredNodes } = get();
          if (nodeId.includes("@")) {
            return (
              discoveredNodes.includes(nodeId) ||
              discoveredNodes.some((id) => id === nodeId.split("@")[0])
            );
          }
          return discoveredNodes.includes(nodeId);
        },
        toggleDiscoveredNode: (nodeId) => {
          set((state) => ({
            discoveredNodes: state.isDiscoveredNode(nodeId)
              ? state.discoveredNodes.filter((id) => {
                  if (id === nodeId) {
                    return false;
                  }
                  if (nodeId.includes("@") && nodeId.split("@")[0] === id) {
                    return false;
                  }
                  return true;
                })
              : [...new Set([...state.discoveredNodes, nodeId])],
          }));
        },
        setDiscoverNode: (nodeId, discovered) =>
          set((state) => ({
            discoveredNodes: discovered
              ? [...new Set([...state.discoveredNodes, nodeId])]
              : state.discoveredNodes.filter((id) => {
                  if (id === nodeId) {
                    return false;
                  }
                  if (nodeId.includes("@") && nodeId.split("@")[0] === id) {
                    return false;
                  }
                  return true;
                }),
          })),
        hideDiscoveredNodes: false,
        toggleHideDiscoveredNodes: () =>
          set((state) => ({
            hideDiscoveredNodes: !state.hideDiscoveredNodes,
          })),
        setDiscoveredNodes: (discoveredNodes) => set({ discoveredNodes }),
        actorsPollingRate: 100,
        setActorsPollingRate: (actorsPollingRate) => set({ actorsPollingRate }),
        showTraceLine: true,
        toggleShowTraceLine: () =>
          set((state) => ({ showTraceLine: !state.showTraceLine })),
        traceLineLength: 100,
        setTraceLineLength: (traceLineLength) => set({ traceLineLength }),
        traceLineRate: 5,
        setTraceLineRate: (traceLineRate) => set({ traceLineRate }),
        traceLineColor: "#1ccdd1B3",
        setTraceLineColor: (traceLineColor) => set({ traceLineColor }),
        displayDiscordActivityStatus: true,
        setDisplayDiscordActivityStatus: (displayDiscordActivityStatus) =>
          set({ displayDiscordActivityStatus }),
        presets: {},
        addPreset: (presetName, filters) =>
          set((state) => ({
            presets: {
              ...state.presets,
              [presetName]: filters,
            },
          })),
        removePreset: (presetName) =>
          set((state) => {
            const presets = { ...state.presets };
            delete presets[presetName];
            return { presets };
          }),
        tempPrivateNode: null,
        setTempPrivateNode: (tempPrivateNode) =>
          set((state) => ({
            tempPrivateNode: tempPrivateNode
              ? { ...(state.tempPrivateNode || {}), ...tempPrivateNode }
              : null,
          })),
        tempPrivateDrawing: null,
        setTempPrivateDrawing: (tempPrivateDrawing) =>
          set((state) => ({
            tempPrivateDrawing: tempPrivateDrawing
              ? { ...(state.tempPrivateDrawing || {}), ...tempPrivateDrawing }
              : null,
          })),
        drawingColor: "#FFFFFFAA",
        setDrawingColor: (drawingColor) => set({ drawingColor }),
        drawingSize: 4,
        setDrawingSize: (drawingSize) => set({ drawingSize }),
        textColor: "#1ccdd1",
        setTextColor: (textColor) => set({ textColor }),
        textSize: 20,
        setTextSize: (textSize) => set({ textSize }),
        baseIconSize: 1,
        setBaseIconSize: (baseIconSize) => set({ baseIconSize }),
        playerIconSize: 1,
        setPlayerIconSize: (playerIconSize) => set({ playerIconSize }),
        iconSizeByGroup: {},
        setIconSizeByGroup: (group, size) =>
          set((state) => ({
            iconSizeByGroup: {
              ...state.iconSizeByGroup,
              [group]: size,
            },
          })),
        iconSizeByFilter: {},
        setIconSizeByFilter: (id, size) =>
          set((state) => ({
            iconSizeByFilter: {
              ...state.iconSizeByFilter,
              [id]: size,
            },
          })),
        fitBoundsOnChange: false,
        toggleFitBoundsOnChange: () =>
          set((state) => ({ fitBoundsOnChange: !state.fitBoundsOnChange })),
        myFilters: [],
        setMyFilters: (myFilters) => set({ myFilters }),
        setMyFilter: (name, myFilter) =>
          set((state) => ({
            myFilters: state.myFilters.map((filter) =>
              filter.name === name ? { ...filter, ...myFilter } : filter,
            ),
          })),
        addMyFilter: async (myFilter) => {
          if (myFilter.isShared && !myFilter.url) {
            const blob = await putSharedFilters(myFilter.name, myFilter);
            myFilter.url = blob.url;
          }
          set((state) => {
            if (
              myFilter.isShared &&
              myFilter.url &&
              state.myFilters.some(
                (filter) => filter.isShared && filter.url === myFilter.url,
              )
            ) {
              return state;
            }
            return {
              myFilters: [...state.myFilters, myFilter],
            };
          });
        },
        removeMyFilter: (myFilterName) =>
          set((state) => ({
            myFilters: state.myFilters.filter(
              (filter) => filter.name !== myFilterName,
            ),
          })),
        removeMyNode: (nodeId) =>
          set((state) => {
            const myFilter = state.myFilters.find((filter) =>
              filter.nodes?.some((node) => node.id === nodeId),
            );
            if (!myFilter) {
              return state;
            }
            myFilter.nodes = myFilter.nodes?.filter(
              (node) => node.id !== nodeId,
            );
            if (myFilter.url) {
              putSharedFilters(myFilter.url, myFilter);
            }
            return {
              myFilters: state.myFilters.map((filter) =>
                filter.name === myFilter.name ? myFilter : filter,
              ),
            };
          }),
        showGrid: false,
        toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
        showFilters: true,
        toggleShowFilters: () =>
          set((state) => ({ showFilters: !state.showFilters })),
        expandedFilters: false,
        toggleExpandedFilters: () =>
          set((state) => ({ expandedFilters: !state.expandedFilters })),
        // Peer Link / Mesh settings
        peerCode: "",
        setPeerCode: (code: string) => set({ peerCode: code }),
        lastMeSenderId: "",
        setLastMeSenderId: (id: string) => set({ lastMeSenderId: id }),
        playerName: "",
        setPlayerName: (name: string) => set({ playerName: name }),
        autoJoinPeer: false,
        setAutoJoinPeer: (autoJoin: boolean) => set({ autoJoinPeer: autoJoin }),
        autoLiveModeWithMe: true,
        setAutoLiveModeWithMe: (autoLiveMode: boolean) => set({ autoLiveModeWithMe: autoLiveMode }),
        // Profile Management
        currentProfileId: "default",
        profiles: [
          {
            id: "default",
            name: "Default",
            data: {
              discoveredNodes: [],
              hideDiscoveredNodes: false,
              myFilters: [],
              colorBlindMode: "none",
              colorBlindSeverity: 1,
              fitBoundsOnChange: false,
              transforms: {},
              mapTransform: null,
              mapFilter: "none",
              baseIconSize: 1,
              playerIconSize: 1,
              iconSizeByGroup: {},
              iconSizeByFilter: {},
              showTraceLine: true,
              traceLineLength: 100,
              traceLineRate: 5,
              traceLineColor: "#1ccdd1B3",
              showGrid: false,
              showFilters: true,
              expandedFilters: false,
              drawingColor: "#FFFFFFAA",
              drawingSize: 4,
              textColor: "#1ccdd1",
              textSize: 20,
              presets: {},
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        createProfile: (name: string) => {
          const state = get();
          const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            name,
            data: {
              discoveredNodes: state.discoveredNodes,
              hideDiscoveredNodes: state.hideDiscoveredNodes,
              myFilters: state.myFilters,
              colorBlindMode: state.colorBlindMode,
              colorBlindSeverity: state.colorBlindSeverity,
              fitBoundsOnChange: state.fitBoundsOnChange,
              transforms: state.transforms,
              mapTransform: state.mapTransform,
              mapFilter: state.mapFilter,
              baseIconSize: state.baseIconSize,
              playerIconSize: state.playerIconSize,
              iconSizeByGroup: state.iconSizeByGroup,
              iconSizeByFilter: state.iconSizeByFilter,
              showTraceLine: state.showTraceLine,
              traceLineLength: state.traceLineLength,
              traceLineRate: state.traceLineRate,
              traceLineColor: state.traceLineColor,
              showGrid: state.showGrid,
              showFilters: state.showFilters,
              expandedFilters: state.expandedFilters,
              drawingColor: state.drawingColor,
              drawingSize: state.drawingSize,
              textColor: state.textColor,
              textSize: state.textSize,
              presets: state.presets,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            profiles: [...state.profiles, newProfile],
            currentProfileId: newProfile.id,
          }));
        },
        switchProfile: (profileId: string) => {
          const state = get();
          const profile = state.profiles.find((p) => p.id === profileId);
          if (!profile) return;

          // Update current profile before switching
          state.updateCurrentProfile();

          // Apply the new profile data
          set({
            currentProfileId: profileId,
            discoveredNodes: profile.data.discoveredNodes,
            hideDiscoveredNodes: profile.data.hideDiscoveredNodes,
            myFilters: profile.data.myFilters,
            colorBlindMode: profile.data.colorBlindMode,
            colorBlindSeverity: profile.data.colorBlindSeverity,
            fitBoundsOnChange: profile.data.fitBoundsOnChange,
            transforms: profile.data.transforms,
            mapTransform: profile.data.mapTransform,
            mapFilter: profile.data.mapFilter,
            baseIconSize: profile.data.baseIconSize,
            playerIconSize: profile.data.playerIconSize,
            iconSizeByGroup: profile.data.iconSizeByGroup,
            iconSizeByFilter: profile.data.iconSizeByFilter,
            showTraceLine: profile.data.showTraceLine,
            traceLineLength: profile.data.traceLineLength,
            traceLineRate: profile.data.traceLineRate,
            traceLineColor: profile.data.traceLineColor,
            showGrid: profile.data.showGrid,
            showFilters: profile.data.showFilters,
            expandedFilters: profile.data.expandedFilters,
            drawingColor: profile.data.drawingColor,
            drawingSize: profile.data.drawingSize,
            textColor: profile.data.textColor,
            textSize: profile.data.textSize,
            presets: profile.data.presets,
          });
        },
        updateCurrentProfile: () => {
          const state = get();
          const currentProfile = state.profiles.find(
            (p) => p.id === state.currentProfileId,
          );
          if (!currentProfile) return;

          currentProfile.data = {
            discoveredNodes: state.discoveredNodes,
            hideDiscoveredNodes: state.hideDiscoveredNodes,
            myFilters: state.myFilters,
            colorBlindMode: state.colorBlindMode,
            colorBlindSeverity: state.colorBlindSeverity,
            fitBoundsOnChange: state.fitBoundsOnChange,
            transforms: state.transforms,
            mapTransform: state.mapTransform,
            mapFilter: state.mapFilter,
            baseIconSize: state.baseIconSize,
            playerIconSize: state.playerIconSize,
            iconSizeByGroup: state.iconSizeByGroup,
            iconSizeByFilter: state.iconSizeByFilter,
            showTraceLine: state.showTraceLine,
            traceLineLength: state.traceLineLength,
            traceLineRate: state.traceLineRate,
            traceLineColor: state.traceLineColor,
            showGrid: state.showGrid,
            showFilters: state.showFilters,
            expandedFilters: state.expandedFilters,
            drawingColor: state.drawingColor,
            drawingSize: state.drawingSize,
            textColor: state.textColor,
            textSize: state.textSize,
            presets: state.presets,
          };
          currentProfile.updatedAt = Date.now();

          set((state) => ({
            profiles: state.profiles.map((p) =>
              p.id === currentProfile.id ? currentProfile : p,
            ),
          }));
        },
        renameProfile: (profileId: string, newName: string) => {
          set((state) => ({
            profiles: state.profiles.map((p) =>
              p.id === profileId
                ? { ...p, name: newName, updatedAt: Date.now() }
                : p,
            ),
          }));
        },
        deleteProfile: (profileId: string) => {
          const state = get();
          if (state.profiles.length <= 1) return; // Don't delete the last profile
          if (profileId === "default") return; // Don't delete default profile

          set((state) => {
            const newProfiles = state.profiles.filter((p) => p.id !== profileId);
            const newCurrentProfileId =
              state.currentProfileId === profileId
                ? newProfiles[0].id
                : state.currentProfileId;

            // If we're switching to a different profile, load its data
            if (newCurrentProfileId !== state.currentProfileId) {
              const newProfile = newProfiles.find((p) => p.id === newCurrentProfileId);
              if (newProfile) {
                return {
                  profiles: newProfiles,
                  currentProfileId: newCurrentProfileId,
                  ...newProfile.data,
                };
              }
            }

            return {
              profiles: newProfiles,
              currentProfileId: newCurrentProfileId,
            };
          });
        },
        exportProfile: (profileId: string) => {
          const state = get();
          const profile = state.profiles.find((p) => p.id === profileId);
          return profile || null;
        },
        importProfile: (profile: Profile) => {
          set((state) => {
            // Check if profile with same ID already exists
            const exists = state.profiles.some((p) => p.id === profile.id);
            if (exists) {
              // Generate new ID
              profile.id = `profile-${Date.now()}`;
            }
            return {
              profiles: [...state.profiles, profile],
            };
          });
        },
        duplicateProfile: (profileId: string) => {
          const state = get();
          const profile = state.profiles.find((p) => p.id === profileId);
          if (!profile) return;

          const newProfile: Profile = {
            ...profile,
            id: `profile-${Date.now()}`,
            name: `${profile.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set((state) => ({
            profiles: [...state.profiles, newProfile],
          }));
        },
      };
    },
    {
      name: getStorageName(),
      onRehydrateStorage: () => (state) => {
        if (!state?._hasHydrated) {
          state?.setHasHydrated(true);
        }
        // Initialize profiles if they don't exist
        if (state && !state.profiles?.length) {
          const defaultProfile: Profile = {
            id: "default",
            name: "Default",
            data: {
              discoveredNodes: state.discoveredNodes || [],
              hideDiscoveredNodes: state.hideDiscoveredNodes || false,
              myFilters: state.myFilters || [],
              colorBlindMode: state.colorBlindMode || "none",
              colorBlindSeverity: state.colorBlindSeverity || 1,
              fitBoundsOnChange: state.fitBoundsOnChange || false,
              transforms: state.transforms || {},
              mapTransform: state.mapTransform || null,
              mapFilter: state.mapFilter || "none",
              baseIconSize: state.baseIconSize || 1,
              playerIconSize: state.playerIconSize || 1,
              iconSizeByGroup: state.iconSizeByGroup || {},
              iconSizeByFilter: state.iconSizeByFilter || {},
              showTraceLine: state.showTraceLine ?? true,
              traceLineLength: state.traceLineLength || 100,
              traceLineRate: state.traceLineRate || 5,
              traceLineColor: state.traceLineColor || "#1ccdd1B3",
              showGrid: state.showGrid || false,
              showFilters: state.showFilters ?? true,
              expandedFilters: state.expandedFilters || false,
              drawingColor: state.drawingColor || "#FFFFFFAA",
              drawingSize: state.drawingSize || 4,
              textColor: state.textColor || "#1ccdd1",
              textSize: state.textSize || 20,
              presets: state.presets || {},
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          state.profiles = [defaultProfile];
          state.currentProfileId = "default";
        }
      },
      version: 4,
      // @ts-ignore
      migrate: (persistedState, version) => {
        if (version < 3) {
          const storageName = getStorageName();
          if (storageName !== "settings-storage") {
            const oldStorage = localStorage.getItem("settings-storage");
            if (oldStorage) {
              const oldState = JSON.parse(oldStorage).state;
              Object.assign(persistedState || {}, oldState);
            }
          }
        }
        if (version < 4) {
          // Initialize profiles from existing settings
          const state = persistedState as any;
          if (!state.profiles?.length) {
            const defaultProfile: Profile = {
              id: "default",
              name: "Default",
              data: {
                discoveredNodes: state.discoveredNodes || [],
                hideDiscoveredNodes: state.hideDiscoveredNodes || false,
                myFilters: state.myFilters || [],
                colorBlindMode: state.colorBlindMode || "none",
                colorBlindSeverity: state.colorBlindSeverity || 1,
                fitBoundsOnChange: state.fitBoundsOnChange || false,
                transforms: state.transforms || {},
                mapTransform: state.mapTransform || null,
                mapFilter: state.mapFilter || "none",
                baseIconSize: state.baseIconSize || 1,
                playerIconSize: state.playerIconSize || 1,
                iconSizeByGroup: state.iconSizeByGroup || {},
                iconSizeByFilter: state.iconSizeByFilter || {},
                showTraceLine: state.showTraceLine ?? true,
                traceLineLength: state.traceLineLength || 100,
                traceLineRate: state.traceLineRate || 5,
                traceLineColor: state.traceLineColor || "#1ccdd1B3",
                showGrid: state.showGrid || false,
                showFilters: state.showFilters ?? true,
                expandedFilters: state.expandedFilters || false,
                drawingColor: state.drawingColor || "#FFFFFFAA",
                drawingSize: state.drawingSize || 4,
                textColor: state.textColor || "#1ccdd1",
                textSize: state.textSize || 20,
                presets: state.presets || {},
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            state.profiles = [defaultProfile];
            state.currentProfileId = "default";
          }
        }
        return persistedState;
      },
    },
  ),
);

withStorageDOMEvents(useSettingsStore);
