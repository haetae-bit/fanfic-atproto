/** @jsxImportSource react */
import { LeafletDocument, useAtProtoRecord, type LeafletDocumentRecord } from "atproto-ui";

import "./Leaflet.css";
import { LeafletRenderer } from "./LeafletRenderer";

type props = {
  did: string;
  rkey: string;
}

export function Leaflet({ did, rkey }: props) {
  const { record, loading, error } = useAtProtoRecord<LeafletDocumentRecord>({ 
    did, 
    collection: "pub.leaflet.document", 
    rkey 
  });

  if (loading) return <div className="loading loading-spinner loading-lg mx-auto" />
  if (error) return <p className="text-error p-4">Could not load post!</p>
  
  return (
    <LeafletDocument
      did={did}
      rkey={rkey} 
      renderer={LeafletRenderer}
    />
  )
}