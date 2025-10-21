"use client";
import Peer, { DataConnection } from "peerjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  cn,
  DrawingsAndNodes,
  Drawing,
  PrivateNode,
  useConnectionStore,
  useSettingsStore,
  useUserStore,
} from "@repo/lib";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Presentation } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Whiteboard({
  domain,
  hidden,
}: {
  domain: string;
  hidden?: boolean;
}) {
  const connectionStore = useConnectionStore();
  const profileSettings = useSettingsStore((state) =>
    state.getCurrentProfileSettings(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const { groupName, setGroupName } = useSettingsStore(
    useShallow((state) => {
      const shallowProfileSettings = state.getCurrentProfileSettings();
      return {
        groupName: shallowProfileSettings.groupName,
        setGroupName: state.setGroupName,
      };
    }),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const peerRef = useRef<Peer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const closeConnectionToPeerServer = useCallback(() => {
    setErrorMessage("");
    setIsLoading(false);
    connectionStore.closeExistingConnections();
    connectionStore.setMyFilters([]);
    connectionStore.setTempPrivateDrawing(null);
    connectionStore.setTempPrivateNode(null);
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  }, []);

  const initializeConnection = useCallback(
    (conn: DataConnection, onClose?: () => void) => {
      connectionStore.closeExistingConnection(conn.peer);

      conn.on("open", () => {
        connectionStore.addConnection(conn);
        console.log("conn open", conn.connectionId);
      });
      conn.on("close", () => {
        connectionStore.closeExistingConnection(conn.peer);
        console.log("conn close", conn.connectionId);
        onClose?.();
      });
      conn.on("error", (error) => {
        console.log("conn error", error);
      });
      conn.on("data", (data) => {
        if (typeof data !== "object" || data === null) {
          return;
        }
        if ("tempPrivateDrawing" in data) {
          try {
            connectionStore.setTempPrivateDrawing(
              data.tempPrivateDrawing as Partial<Drawing> | null,
            );
          } catch (error) {
            console.error("conn data error", error);
          }
        }
        if ("selectedMyFilters" in data) {
          try {
            connectionStore.setMyFilters(
              data.selectedMyFilters as DrawingsAndNodes[],
            );
          } catch (error) {
            console.error("conn data error", error);
          }
        }
        if ("tempPrivateNode" in data) {
          try {
            connectionStore.setTempPrivateNode(
              data.tempPrivateNode as Partial<PrivateNode> | null,
            );
          } catch (error) {
            console.error("conn data error", error);
          }
        }
      });
    },
    [],
  );

  const groupId = useMemo(
    () => `${domain}-th-gl-${groupName}`,
    [domain, groupName],
  );
  const joinGroup = useCallback((groupId: string, peerId?: string) => {
    setIsLoading(true);
    setErrorMessage("");
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (peerId) {
      peerRef.current = new Peer(peerId);
    } else {
      peerRef.current = new Peer();
    }
    const peer = peerRef.current;
    peer.on("close", () => {
      console.log("peer close");
      setIsConnected(false);
      connectionStore.closeExistingConnections();
    });
    peer.on("error", (error) => {
      if (error.type === "unavailable-id") {
        joinGroup(groupId);
      } else {
        console.log("peer error", error, error.name, error.message);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    });
    peer.on("open", (id) => {
      connectionStore.setPeerId(id);
      console.log("peer open", id);
      setIsConnected(true);
      setIsLoading(false);
      if (!peerId) {
        const conn = peer.connect(groupId);
        initializeConnection(conn, () => {
          toast("The Live Share Group has been closed");
          closeConnectionToPeerServer();
        });
      }
    });
    peer.on("connection", (conn) => {
      console.log("peer connection", conn);
      initializeConnection(conn);
    });
    peer.on("disconnected", (connectionId) => {
      console.log("peer disconnected", connectionId);
      setIsConnected(false);
    });
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      joinGroup(groupId, groupId);
    },
    [groupId],
  );
  const isOwner = connectionStore.peerId === groupId;

  const sendToConnections = useCallback(
    (data: any) => {
      Object.values(connectionStore.connections).forEach((conn) => {
        conn.send(data);
      });
    },
    [connectionStore.connections],
  );
  const tempPrivateDrawing = profileSettings.tempPrivateDrawing;
  useEffect(() => {
    if (!isOwner || !isConnected) {
      return;
    }
    sendToConnections({ tempPrivateDrawing });
  }, [isOwner, isConnected, sendToConnections, tempPrivateDrawing]);
  const filters = useUserStore((state) => state.filters);
  const myFilters = profileSettings.myFilters;
  const selectedMyFilters = useMemo(
    () => myFilters.filter((myFilter) => filters.includes(myFilter.name)),
    [filters, myFilters],
  );
  useEffect(() => {
    if (!isOwner || !isConnected) {
      return;
    }
    sendToConnections({ selectedMyFilters });
  }, [isOwner, isConnected, sendToConnections, selectedMyFilters]);

  const tempPrivateNode = profileSettings.tempPrivateNode;
  useEffect(() => {
    if (!isOwner || !isConnected) {
      return;
    }
    sendToConnections({ tempPrivateNode });
  }, [isOwner, isConnected, sendToConnections, tempPrivateNode]);

  if (hidden) {
    return <></>;
  }

  const hasConnections = Object.keys(connectionStore.connections).length > 0;
  return (
    <Dialog>
      <Tooltip delayDuration={200} disableHoverableContent>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                hasConnections
                  ? "text-green-400"
                  : isConnected
                    ? "text-yellow-500"
                    : "text-orange-500",
              )}
            >
              <Presentation className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Whiteboard</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Whiteboard</DialogTitle>
          <div className="text-xs text-muted-foreground">
            <Tooltip delayDuration={200} disableHoverableContent>
              <TooltipTrigger asChild>
                <span className="underline cursor-help">What is this?</span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[360px]">
                Share your nodes, drawings with your group in real-time! After
                opening a group, share the group name with your friends to
                connect to each other. Your selected filter (My Filters) will be
                shared, and they will see current changes in real-time (Add
                Node/Add Drawing).
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogHeader>
        <section className="space-y-4 overflow-hidden">
          <p className="text-orange-500 truncate">{errorMessage}</p>
          {isConnected && (
            <>
              <div>
                <p className="font-bold text-sm">Group Name</p>
                <p>{groupName}</p>
              </div>
              <div>
                <p className="font-bold text-sm">Role</p>
                <p>{isOwner ? "Owner" : "Member"}</p>
              </div>
              {isOwner && (
                <div>
                  <p className="font-bold text-sm">Connections</p>
                  <p>{Object.keys(connectionStore.connections).length}</p>
                </div>
              )}

              <Button
                type="button"
                variant="destructive"
                disabled={!isConnected}
                className="w-full"
                onClick={() => closeConnectionToPeerServer()}
              >
                {isOwner ? "Close" : "Leave"} Group
              </Button>
            </>
          )}
          {!isConnected && (
            <form className="space-y-2" onSubmit={handleSubmit}>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(event) =>
                    setGroupName(
                      event.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                    )
                  }
                  required
                  placeholder="This name is used to connect to each other"
                  disabled={isConnected}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !groupName || isConnected}
                className="w-full"
              >
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Join Group
              </Button>
            </form>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
