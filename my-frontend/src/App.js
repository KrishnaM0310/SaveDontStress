import React, { useEffect, useRef, useState } from "react";

function App() {
  const addressRef = useRef(null);

  const [address, setAddress] = useState("");
  const [item, setItem] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [coords, setCoords] = useState(null);

/// add 
  useEffect(() => {
    if (window.google && window.google.maps && addressRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressRef.current,
        { types: ["geocode"] }
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setAddress(place.formatted_address || "");
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setCoords({ lat, lng });
        }
      });
    }
  }, []);

  async function handleSearch() {
    setErrorMsg("");
    setRawJson("");

    let lat = coords?.lat;
    let lng = coords?.lng;

    if (!lat || !lng) {
      


      try {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyCodFuwZnIn1sJu08OdpieZsr2RH49kWG4`;
        const resp = await fetch(geoUrl);
        const j = await resp.json();
        if (j.status === "OK" && j.results.length) {
          lat = j.results[0].geometry.location.lat;
          lng = j.results[0].geometry.location.lng;
          setCoords({ lat, lng });
        } else {
          setErrorMsg("Could not geocode address.");
          return;
        }
      } catch (err) {
        setErrorMsg("Error geocoding: " + err);
        return;
      }
    }

    if (!lat || !lng || !item) {
      setErrorMsg("Missing address or item.");
      return;
    }

    try {
      const resp = await fetch("http://localhost:3001/api/cheapest-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, item })
      });
      const textData = await resp.text();
    setRawJson(textData);

    
      try {
        const parsed = JSON.parse(textData);
        if (parsed.error) {
          setErrorMsg(parsed.error);
        }
      } catch {
   
      }
    } catch (err) {
      setErrorMsg("Backend error: " + err);
    }
  }

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Cheapest Grocery Finder - Raw JSON</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Address:</label>{" "}
        <input
          ref={addressRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "300px" }}
          placeholder="Type or select address"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Grocery Item:</label>{" "}
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="milk"
        />
      </div>

      <button onClick={handleSearch}>Search</button>
      {errorMsg && (
        <div style={{ color: "red", marginTop: "1rem" }}>{errorMsg}</div>
      )}

      {rawJson && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Gemini Raw / Parsed JSON</h2>
          <pre>{rawJson}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
