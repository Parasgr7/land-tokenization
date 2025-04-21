'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import only on client side
const Map = dynamic(() => import("./LeafletMap"), {
  ssr: false
});

export default function ClientOnlyMap({ locationName, lat, lng, landDetails }) {
  return (
    <>
      {typeof window !== "undefined" && lat && lng && (
        <Map lat={lat} lng={lng} locationName={locationName} landDetails={landDetails} />
      )}
    </>
  );
}
