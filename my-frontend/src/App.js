// frontend/src/App.js
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const addressRef = useRef(null);

  const [address, setAddress] = useState("");
  const [item, setItem] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [coords, setCoords] = useState(null);

  // We'll store the parsed store data if we can parse JSON
  const [storeData, setStoreData] = useState(null);

  // We'll store the raw text if parsing fails or if needed
  const [rawText, setRawText] = useState("");

  // Hook up Google Places Autocomplete for address
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
    setStoreData(null);
    setRawText("");

    let lat = coords?.lat;
    let lng = coords?.lng;

    // Fallback geocode if user typed address but didn't pick from dropdown
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

    // Call our backend
    try {
      const resp = await fetch("http://localhost:3001/api/cheapest-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, item })
      });
      const textData = await resp.text(); // raw text from the server
      setRawText(textData); // store the raw text

      // Attempt to parse
      try {
        const parsed = JSON.parse(textData);
        if (parsed.error) {
          setErrorMsg(parsed.error);
          setStoreData(null);
        } else if (typeof parsed === "object") {
          setStoreData(parsed);
        } else {
          setStoreData(null);
        }
      } catch {
        setStoreData(null);
      }
    } catch (err) {
      setErrorMsg("Backend error: " + err);
    }
  }

  // Helper to render a table if we have storeData
  function renderStoreTable() {
    if (!storeData || typeof storeData !== "object") return null;

    // Convert to array entries, so we can sort
    const storeEntries = Object.entries(storeData);
    if (!storeEntries.length) return null;

    // Sort by ascending price
    storeEntries.sort((a, b) => {
      const priceA = Number(a[1].price) || 0;
      const priceB = Number(b[1].price) || 0;
      return priceA - priceB;
    });

    return (
      <table className="store-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Address</th>
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {storeEntries.map(([storeName, s]) => (
            <tr key={storeName}>
              <td>{storeName}</td>
              <td>{s.address}</td>
              <td>${s.price}</td>
              <td>{s["short-description"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Helper to render a simple bar chart if we have storeData
  function renderPriceChart() {
    if (!storeData || typeof storeData !== "object") return null;

    const storeEntries = Object.entries(storeData);
    if (!storeEntries.length) return null;

    // Sort by ascending price to match the table
    storeEntries.sort((a, b) => {
      const priceA = Number(a[1].price) || 0;
      const priceB = Number(b[1].price) || 0;
      return priceA - priceB;
    });

    return (
      <div className="chart-container">
        {storeEntries.map(([storeName, s]) => {
          const price = Number(s.price) || 0;
          const barWidth = Math.max(price * 50, 0);
          return (
            <div key={storeName} className="chart-row">
              <div className="chart-label">{storeName}</div>
              <div className="chart-bar" style={{ width: barWidth }}>
                ${s.price}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* A gradient header */}
      <header className="app-header">
        <h1 className="header-title">Save, Don't Stress</h1>
      </header>

      {/* The main container */}
      <div className="app-container">
        <div className="input-group">
          <label className="label">Address:</label>
          <input
            ref={addressRef}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
            placeholder="Type or select address"
          />
        </div>

        <div className="input-group">
          <label className="label">Grocery Item:</label>
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="input"
            placeholder="milk"
          />
        </div>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {storeData && (
          <div className="results-container">
            <h2>Store Data (Cheapest to Most Expensive)</h2>
            {renderStoreTable()}

            <h2>Price Chart (Ascending)</h2>
            {renderPriceChart()}
          </div>
        )}

        {!storeData && rawText && !errorMsg && (
          <div className="raw-json-container">
            <h2>Raw Response (Unparsed)</h2>
            <pre className="raw-json">{rawText}</pre>
          </div>
        )}
      </div>

      {/* A simple footer */}
      <footer className="app-footer">
        <p>© 2025 Grocery Finder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

