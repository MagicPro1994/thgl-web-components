import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withStorageDOMEvents } from "./dom";
import { putSharedFilters } from "./shared-nodes";

//#region Types
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

export type MapTransform = {
  borderRadius: string;
  transform: string;
  width: string;
  height: string;
};
//#endregion

//#region Profile Settings Store
export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  hotkeys: {},
  groupName: "",
  liveMode: true,
  overlayMode: null,
  overlayFullscreen: false,
  lockedWindow: false,
  colorBlindMode: "none",
  colorBlindSeverity: 1,
  transforms: {},
  mapTransform: null,
  mapFilter: "none",
  windowOpacity: 1,
  discoveredNodes: [],
  hideDiscoveredNodes: false,
  actorsPollingRate: 100,
  showTraceLine: true,
  traceLineLength: 100,
  traceLineRate: 5,
  traceLineColor: "#1ccdd1B3",
  displayDiscordActivityStatus: true,
  presets: {},
  tempPrivateNode: null,
  tempPrivateDrawing: null,
  drawingColor: "#FFFFFFAA",
  drawingSize: 4,
  textColor: "#1ccdd1",
  textSize: 20,
  baseIconSize: 1,
  playerIconSize: 1,
  iconSizeByGroup: {},
  iconSizeByFilter: {},
  fitBoundsOnChange: false,
  myFilters: [],
  showGrid: false,
  showFilters: true,
  expandedFilters: false,
  // Peer Link / Mesh settings
  peerCode: "",
  lastMeSenderId: "",
  playerName: "",
  autoJoinPeer: false,
  autoLiveModeWithMe: true,
};

const DEFAULT_PROFILE = {
  id: "default",
  name: "Default",
  settings: DEFAULT_PROFILE_SETTINGS,
};

export type ProfileSettings = {
  hotkeys: Record<string, string>;
  groupName: string;
  liveMode: boolean;
  overlayMode: boolean | null;
  overlayFullscreen: boolean;
  lockedWindow: boolean;
  colorBlindMode: ColorBlindMode;
  colorBlindSeverity: number;
  transforms: Record<string, string>;
  mapTransform: MapTransform | null;
  mapFilter: string;
  windowOpacity: number;
  discoveredNodes: string[];
  hideDiscoveredNodes: boolean;
  actorsPollingRate: number;
  showTraceLine: boolean;
  traceLineLength: number;
  traceLineRate: number;
  traceLineColor: string;
  displayDiscordActivityStatus: boolean;
  presets: Record<string, string[]>;
  tempPrivateNode: (Partial<PrivateNode> & { filter?: string }) | null;
  tempPrivateDrawing: (Partial<Drawing> & { name?: string }) | null;
  drawingColor: string;
  drawingSize: number;
  textColor: string;
  textSize: number;
  baseIconSize: number;
  playerIconSize: number;
  iconSizeByGroup: Record<string, number>;
  iconSizeByFilter: Record<string, number>;
  fitBoundsOnChange: boolean;
  myFilters: DrawingsAndNodes[];
  showGrid: boolean;
  showFilters: boolean;
  expandedFilters: boolean;
  // Peer Link / Mesh settings
  peerCode: string;
  lastMeSenderId: string;
  playerName: string;
  autoJoinPeer: boolean;
  autoLiveModeWithMe: boolean;

  // Deprecated
  privateNodes?: PrivateNode[];
  privateDrawings?: Drawing[];
  sharedFilters?: {
    url: string;
    filter: string;
  }[];
};

export interface ProfileActions {
  setHotkey: (key: string, value: string) => void;
  setHotkeys: (hotkeys: Record<string, string>) => void;
  setGroupName: (groupName: string) => void;
  setLiveMode: (liveMode: boolean) => void;
  toggleLiveMode: () => void;
  setOverlayMode: (overlayMode: boolean) => void;
  toggleOverlayFullscreen: () => void;
  toggleLockedWindow: () => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setColorBlindSeverity: (severity: number) => void;
  setTransform: (id: string, transform: string) => void;
  setMapTransform: (mapTransform: MapTransform | null) => void;
  setMapFilter: (mapFilter: string) => void;
  setWindowOpacity: (windowOpacity: number) => void;
  resetTransform: () => void;
  isDiscoveredNode: (nodeId: string) => boolean;
  toggleDiscoveredNode: (nodeId: string) => void;
  setDiscoverNode: (nodeId: string, discovered: boolean) => void;
  toggleHideDiscoveredNodes: () => void;
  setDiscoveredNodes: (discoveredNodes: string[]) => void;
  setActorsPollingRate: (actorsPollingRate: number) => void;
  toggleShowTraceLine: () => void;
  setTraceLineLength: (traceLineLength: number) => void;
  setTraceLineRate: (traceLineRate: number) => void;
  setTraceLineColor: (traceLineColor: string) => void;
  setDisplayDiscordActivityStatus: (
    displayDiscordActivityStatus: boolean,
  ) => void;
  addPreset: (presetName: string, filters: string[]) => void;
  removePreset: (presetName: string) => void;
  setTempPrivateNode: (
    tempPrivateNode: (Partial<PrivateNode> & { filter?: string }) | null,
  ) => void;
  setTempPrivateDrawing: (
    tempPrivateDrawing: (Partial<Drawing> & { name?: string }) | null,
  ) => void;
  setDrawingColor: (drawingColor: string) => void;
  setDrawingSize: (drawingSize: number) => void;
  setTextColor: (textColor: string) => void;
  setTextSize: (textSize: number) => void;
  setBaseIconSize: (baseIconSize: number) => void;
  setPlayerIconSize: (playerIconSize: number) => void;
  setIconSizeByGroup: (group: string, size: number) => void;
  setIconSizeByFilter: (id: string, size: number) => void;
  toggleFitBoundsOnChange: () => void;
  setMyFilters: (myFilters: DrawingsAndNodes[]) => void;
  setMyFilter: (name: string, myFilter: Partial<DrawingsAndNodes>) => void;
  addMyFilter: (myFilter: DrawingsAndNodes) => void;
  removeMyFilter: (myFilterName: string) => void;
  removeMyNode: (nodeId: string) => void;
  toggleShowGrid: () => void;
  toggleShowFilters: () => void;
  toggleExpandedFilters: () => void;
  // Peer Link / Mesh settings
  setPeerCode: (code: string) => void;
  setLastMeSenderId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setAutoJoinPeer: (autoJoin: boolean) => void;
  setAutoLiveModeWithMe: (autoLiveMode: boolean) => void;
}

export type Profile = {
  id: string;
  name: string;
  settings: ProfileSettings;
  createdAt: number;
  updatedAt: number;
};

class ProfileManager {
  static createProfileId() {
    return `profile-${Date.now()}`;
  }

  static getDefaultProfile() {
    const defaultProfile = {
      ...DEFAULT_PROFILE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return defaultProfile;
  }

  static createProfile(name: string): Profile {
    const newProfile = {
      id: this.createProfileId(),
      name,
      settings: { ...DEFAULT_PROFILE_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return newProfile;
  }

  static updateProfileSettings(
    profile: Profile,
    settings: Partial<ProfileSettings>,
  ) {
    // Clone the profile to avoid mutating the original
    const updatedProfile: Profile = JSON.parse(JSON.stringify(profile));
    updatedProfile.settings = {
      ...updatedProfile.settings,
      ...settings,
    };
    updatedProfile.updatedAt = Date.now();
    return updatedProfile;
  }

  static duplicateProfile(profile: Profile): Profile {
    // Deep clone the profile object
    const newProfile: Profile = JSON.parse(JSON.stringify(profile));
    newProfile.name = `${profile.name} Copy`;
    newProfile.id = this.createProfileId();
    return newProfile;
  }
}

export interface SettingsStore extends ProfileActions {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Profile Management
  profiles: Profile[];
  currentProfileId: string;
  setProfileSettings: (settings: Partial<ProfileSettings>) => void;
  createProfile: (name: string) => void;
  getCurrentProfile: () => Profile | undefined;
  getCurrentProfileSettings: () => ProfileSettings;
  switchProfile: (profileId: string) => void;
  updateCurrentProfile: () => void;
  renameProfile: (profileId: string, newName: string) => void;
  deleteProfile: (profileId: string) => void;
  exportProfile: (profileId: string) => Profile | null;
  importProfile: (profile: Profile) => void;
  duplicateProfile: (profileId: string) => void;
}

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
      const getProfile = () => {
        const state = get();
        return state.profiles.find((p) => p.id === state.currentProfileId);
      };

      const getSettings = () => {
        const currentProfile = getProfile();
        return currentProfile ? currentProfile.settings : null;
      };

      const updateSettings = (settings: Partial<ProfileSettings>) => {
        const currentProfile = getProfile();
        if (!currentProfile) return;

        const state = get();
        const updatedProfile = ProfileManager.updateProfileSettings(
          currentProfile,
          settings,
        );

        set({
          profiles: state.profiles.map((p) =>
            p.id === currentProfile.id ? updatedProfile : p,
          ),
        });
      };

      const _isDiscoveredNode = (nodeId: string) => {
        const currentProfile = getProfile();
        if (!currentProfile) return false;

        const discoveredNodes = currentProfile.settings.discoveredNodes;
        if (nodeId.includes("@")) {
          return (
            discoveredNodes.includes(nodeId) ||
            discoveredNodes.some((id) => id === nodeId.split("@")[0])
          );
        }
        return discoveredNodes.includes(nodeId);
      };

      return {
        _hasHydrated: false,
        setHasHydrated: (state) => {
          set({
            _hasHydrated: state,
          });
        },

        // Actions for updating settings
        setHotkey: (key, value) => {
          const profileSettings = getSettings();
          if (!profileSettings) return;

          updateSettings({
            hotkeys: { ...profileSettings.hotkeys, [key]: value },
          });
        },

        setHotkeys: (hotkeys) => {
          updateSettings({ hotkeys });
        },

        setGroupName: (groupName) => {
          updateSettings({ groupName });
        },

        setLiveMode: (liveMode) => {
          updateSettings({ liveMode });
        },

        toggleLiveMode: () => {
          updateSettings({
            liveMode: !getSettings()?.liveMode,
          });
        },

        setOverlayMode: (overlayMode) => {
          updateSettings({ overlayMode });
        },

        toggleOverlayFullscreen: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            overlayFullscreen: !currentProfile.settings.overlayFullscreen,
          });
        },

        toggleLockedWindow: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            lockedWindow: !currentProfile.settings.lockedWindow,
          });
        },

        setColorBlindMode: (mode) => {
          updateSettings({ colorBlindMode: mode });
        },

        setColorBlindSeverity: (severity: number) => {
          updateSettings({
            colorBlindSeverity: Math.max(0, Math.min(1, severity)),
          });
        },

        setTransform: (id: string, transform: string) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            transforms: {
              ...currentProfile.settings.transforms,
              [id]: transform,
            },
          });
        },

        setMapTransform: (mapTransform) => {
          updateSettings({ mapTransform });
        },

        setMapFilter: (mapFilter) => {
          updateSettings({ mapFilter });
        },

        setWindowOpacity: (windowOpacity) => {
          updateSettings({ windowOpacity });
        },

        resetTransform: () => {
          updateSettings({
            transforms: {},
            mapTransform: null,
            playerIconSize: 1,
            baseIconSize: 1,
            iconSizeByFilter: {},
            iconSizeByGroup: {},
          });
        },

        isDiscoveredNode: (nodeId) => _isDiscoveredNode(nodeId),

        toggleDiscoveredNode: (nodeId: string) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;

          const discoveredNodes = currentProfile.settings.discoveredNodes;
          const updatedNodes = _isDiscoveredNode(nodeId)
            ? discoveredNodes.filter((id) => {
                if (id === nodeId) {
                  return false;
                }
                if (nodeId.includes("@") && nodeId.split("@")[0] === id) {
                  return false;
                }
                return true;
              })
            : [...new Set([...discoveredNodes, nodeId])];

          updateSettings({ discoveredNodes: updatedNodes });
        },

        setDiscoverNode: (nodeId, discovered) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;

          updateSettings({
            discoveredNodes: discovered
              ? [
                  ...new Set([
                    ...currentProfile.settings.discoveredNodes,
                    nodeId,
                  ]),
                ]
              : currentProfile.settings.discoveredNodes.filter((id) => {
                  if (id === nodeId) {
                    return false;
                  }
                  if (nodeId.includes("@") && nodeId.split("@")[0] === id) {
                    return false;
                  }
                  return true;
                }),
          });
        },

        toggleHideDiscoveredNodes: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            hideDiscoveredNodes: !currentProfile.settings.hideDiscoveredNodes,
          });
        },

        setDiscoveredNodes: (discoveredNodes: string[]) => {
          updateSettings({ discoveredNodes });
        },

        setActorsPollingRate: (actorsPollingRate: number) => {
          updateSettings({ actorsPollingRate });
        },

        toggleShowTraceLine: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            showTraceLine: !currentProfile.settings.showTraceLine,
          });
        },

        setTraceLineLength: (traceLineLength: number) => {
          updateSettings({ traceLineLength });
        },

        setTraceLineRate: (traceLineRate: number) => {
          updateSettings({ traceLineRate });
        },

        setTraceLineColor: (traceLineColor: string) => {
          updateSettings({ traceLineColor });
        },

        setDisplayDiscordActivityStatus: (
          displayDiscordActivityStatus: boolean,
        ) => {
          updateSettings({ displayDiscordActivityStatus });
        },

        addPreset: (presetName: string, filters: string[]) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            presets: {
              ...currentProfile.settings.presets,
              [presetName]: filters,
            },
          });
        },

        removePreset: (presetName: string) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          const newPresets = { ...currentProfile.settings.presets };
          delete newPresets[presetName];
          updateSettings({ presets: newPresets });
        },

        setTempPrivateNode: (tempPrivateNode) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;

          updateSettings({
            tempPrivateNode: tempPrivateNode
              ? {
                  ...(currentProfile.settings.tempPrivateNode ?? {}),
                  ...tempPrivateNode,
                }
              : null,
          });
        },

        setTempPrivateDrawing: (tempPrivateDrawing) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;

          updateSettings({
            tempPrivateDrawing: tempPrivateDrawing
              ? {
                  ...(currentProfile.settings.tempPrivateDrawing ?? {}),
                  ...tempPrivateDrawing,
                }
              : null,
          });
        },

        setDrawingColor: (drawingColor) => {
          updateSettings({ drawingColor });
        },

        setDrawingSize: (drawingSize) => {
          updateSettings({ drawingSize });
        },

        setTextColor: (textColor) => {
          updateSettings({ textColor });
        },

        setTextSize: (textSize) => {
          updateSettings({ textSize });
        },

        setBaseIconSize: (baseIconSize) => {
          updateSettings({ baseIconSize });
        },

        setPlayerIconSize: (playerIconSize) => {
          updateSettings({ playerIconSize });
        },

        setIconSizeByGroup: (group, size) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            iconSizeByGroup: {
              ...currentProfile.settings.iconSizeByGroup,
              [group]: size,
            },
          });
        },

        setIconSizeByFilter: (id, size) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            iconSizeByFilter: {
              ...currentProfile.settings.iconSizeByFilter,
              [id]: size,
            },
          });
        },

        toggleFitBoundsOnChange: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            fitBoundsOnChange: !currentProfile.settings.fitBoundsOnChange,
          });
        },

        setMyFilters: (myFilters) => {
          updateSettings({ myFilters });
        },

        setMyFilter: (name, myFilter) => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          const updatedFilters = currentProfile.settings.myFilters.map(
            (filter) =>
              filter.name === name ? { ...filter, ...myFilter } : filter,
          );
          updateSettings({ myFilters: updatedFilters });
          // Update shared filters if this filter has a URL
          const updatedFilter = updatedFilters.find((f) => f.name === name);
          if (updatedFilter?.url) {
            putSharedFilters(updatedFilter.name, updatedFilter);
          }
        },

        addMyFilter: async (myFilter) => {
          if (myFilter.isShared && !myFilter.url) {
            const blob = await putSharedFilters(myFilter.name, myFilter);
            myFilter.url = blob.url;
          }

          const profileSettings = getSettings();
          if (!profileSettings) return;

          if (
            myFilter.isShared &&
            myFilter.url &&
            profileSettings.myFilters.some(
              (filter) => filter.isShared && filter.url === myFilter.url,
            )
          ) {
            return;
          }

          updateSettings({
            myFilters: [...profileSettings.myFilters, myFilter],
          });
        },

        removeMyFilter: (myFilterName: string) => {
          const profileSettings = getSettings();
          if (!profileSettings) return;

          const updatedFilters = profileSettings.myFilters.filter(
            (filter) => filter.name !== myFilterName,
          );
          updateSettings({ myFilters: updatedFilters });
        },

        removeMyNode: async (nodeId: string) => {
          const profileSettings = getSettings();
          if (!profileSettings) return;

          const myFilter = profileSettings.myFilters.find((filter) =>
            filter.nodes?.some((node) => node.id === nodeId),
          );
          if (!myFilter) {
            return;
          }
          myFilter.nodes = myFilter.nodes?.filter((node) => node.id !== nodeId);
          if (myFilter.url) {
            await putSharedFilters(myFilter.url, myFilter);
          }
          return {
            myFilters: profileSettings.myFilters.map((filter) =>
              filter.name === myFilter.name ? myFilter : filter,
            ),
          };
        },

        toggleShowGrid: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            showGrid: !currentProfile.settings.showGrid,
          });
        },

        toggleShowFilters: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            showFilters: !currentProfile.settings.showFilters,
          });
        },

        toggleExpandedFilters: () => {
          const currentProfile = getProfile();
          if (!currentProfile) return;
          updateSettings({
            expandedFilters: !currentProfile.settings.expandedFilters,
          });
        },

        // Peer Link / Mesh settings
        setPeerCode: (code: string) => {
          updateSettings({ peerCode: code });
        },

        setLastMeSenderId: (id: string) => {
          updateSettings({ lastMeSenderId: id });
        },

        setPlayerName: (name: string) => {
          updateSettings({ playerName: name });
        },

        setAutoJoinPeer: (autoJoin: boolean) => {
          updateSettings({ autoJoinPeer: autoJoin });
        },

        setAutoLiveModeWithMe: (autoLiveMode: boolean) => {
          updateSettings({ autoLiveModeWithMe: autoLiveMode });
        },
        // Profile Management
        currentProfileId: DEFAULT_PROFILE.id,
        profiles: [ProfileManager.getDefaultProfile()],

        setProfileSettings: (settings: Partial<ProfileSettings>) => {
          updateSettings(settings);
        },

        createProfile: (name: string) => {
          const newProfile = ProfileManager.createProfile(name);
          set((state) => ({
            profiles: [...state.profiles, newProfile],
            currentProfileId: newProfile.id,
          }));
        },
        getCurrentProfile: () => getProfile(),
        getCurrentProfileSettings: () => {
          const currentProfile = getProfile();
          return currentProfile
            ? currentProfile.settings
            : DEFAULT_PROFILE_SETTINGS;
        },
        switchProfile: (profileId: string) => {
          const state = get();
          const profile = state.profiles.find((p) => p.id === profileId);
          if (!profile) return;

          set({ currentProfileId: profileId });
        },
        updateCurrentProfile: () => {
          const state = get();
          const currentProfile = state.profiles.find(
            (p) => p.id === state.currentProfileId,
          );
          if (!currentProfile) return;
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
            const newProfiles = state.profiles.filter(
              (p) => p.id !== profileId,
            );
            const newCurrentProfileId =
              state.currentProfileId === profileId
                ? newProfiles[0].id
                : state.currentProfileId;

            // If we're switching to a different profile, load its data
            if (newCurrentProfileId !== state.currentProfileId) {
              const newProfile = newProfiles.find(
                (p) => p.id === newCurrentProfileId,
              );
              if (newProfile) {
                return {
                  profiles: newProfiles,
                  currentProfileId: newCurrentProfileId,
                  ...newProfile.settings,
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

          const newProfile = ProfileManager.duplicateProfile(profile);

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
          console.log("✅ Setting _hasHydrated to true");
          state?.setHasHydrated(true);
        } else {
          console.log("⚠️ _hasHydrated already true, skipping");
        }

        // Initialize profiles if they don't exist
        if (state && !state.profiles?.length) {
          console.log("🆕 Initializing default profile");
          const defaultProfile = ProfileManager.getDefaultProfile();
          state.profiles = [defaultProfile];
          state.currentProfileId = defaultProfile.id;
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
            const defaultProfile = ProfileManager.getDefaultProfile();
            state.profiles = [defaultProfile];
            state.currentProfileId = defaultProfile.id;
          }
        }
        return persistedState;
      },
    },
  ),
);

withStorageDOMEvents(useSettingsStore);
