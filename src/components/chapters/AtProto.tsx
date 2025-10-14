/** @jsxImportSource react */
import { AtProtoProvider } from "atproto-ui";
import { Bsky } from "./utils/Bsky";
import { Leaflet } from "./utils/Leaflet";

type props = {
  type: "bsky" | "leaflet";
  did: string;
  rkey: string;
}

export function AtProto({ type, did, rkey }: props) {
  if (type === "bsky") return (
    <AtProtoProvider>
      <Bsky did={did} rkey={rkey} />
    </AtProtoProvider>
  );
  
  if (type === "leaflet") return (
    <AtProtoProvider>
      <Leaflet did={did} rkey={rkey} />
    </AtProtoProvider>
  );
}