/** @jsxImportSource react */
import { AtProtoProvider, LeafletDocument } from "atproto-ui";

type props = {
  did: string;
  rkey: string;
}

export function Leaflet({ did, rkey }: props) {
  return (
    <AtProtoProvider>
      <LeafletDocument
        did={did}
        rkey={rkey} 
        // renderer={({ record }) => (
        //   <article>
        //     {record.pages.map(page => (
        //       <>
        //         <pre>{JSON.stringify(page, null, 2)}</pre>
        //         {page.blocks?.map(({ block }) => (
        //           <p>{block.$type}</p>
        //         ))}
        //       </>
        //     ))}
        //   </article>
        // )}
      />
    </AtProtoProvider>
  )
}