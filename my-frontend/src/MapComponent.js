// frontend/src/MapComponent.js
import React, { useEffect, useRef } from "react";

function MapComponent({ userCoords, stores }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;
    if (!userCoords) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: userCoords.lat, lng: userCoords.lng },
      zoom: 12
    });

    // Marker for user
    new window.google.maps.Marker({
      position: { lat: userCoords.lat, lng: userCoords.lng },
      map,
      title: "You are here",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // or default
      }
    });

    // Markers for each store
    if (stores && typeof stores === "object") {
      // stores might look like { "Walmart": { address, price, lat, lng, ... }, ... }
      Object.keys(stores).forEach((storeName) => {
        const s = stores[storeName];
        if (s.lat && s.lng) {
          new window.google.maps.Marker({
            position: { lat: s.lat, lng: s.lng },
            map,
            title: `${storeName} - $${s.price}`
          });
        }
      });
    }
  }, [userCoords, stores]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", marginTop: "1rem" }}
    />
  );
}

export default MapComponent;
