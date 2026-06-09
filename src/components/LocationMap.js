"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in leaflet with Next.js/Webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

function MapEvents({ onPositionChange }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      onPositionChange(center.lat, center.lng);
    },
    click: (e) => {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapFixSize() {
  const map = useMapEvents({});
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const LocationMap = ({ defaultLat = 20.5937, defaultLng = 78.9629, onPositionChange, autoLocate = false }) => {
  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [isLocating, setIsLocating] = useState(autoLocate);
  const mapRef = useRef(null);

  // Fetch location details using Nominatim API
  const fetchLocationDetails = async (lat, lng) => {
    try {
      // Added addressdetails=1 and a generic email to avoid getting blocked by rate-limits
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=test@example.com`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (!response.ok) {
         throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        const pincode = addr.postcode || "";
        
        // Extract a shorter formatted address instead of the huge full name
        const fullAddress = data.display_name || "";
        
        return {
          address: fullAddress,
          city: city,
          pincode: pincode
        };
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
    return null;
  };

  useEffect(() => {
    // Try to get current position on component mount if autoLocate is true
    if (autoLocate && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          setIsLocating(false);
          
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 16, { animate: true });
          }
          
          const details = await fetchLocationDetails(lat, lng);
          if (onPositionChange) {
            onPositionChange(lat, lng, details);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  }, [autoLocate]); // Run only once

  const handlePositionChange = async (lat, lng) => {
    setPosition([lat, lng]);
    const details = await fetchLocationDetails(lat, lng);
    if (onPositionChange) {
      onPositionChange(lat, lng, details);
    }
  };

  return (
    <div style={{ position: "relative", height: "300px", width: "100%", borderRadius: "1rem", overflow: "hidden" }}>
      {isLocating && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: "500" }}>
          <span>Locating you...</span>
        </div>
      )}
      <MapContainer
        center={position}
        zoom={15}
        ref={mapRef}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
        <MapEvents onPositionChange={handlePositionChange} />
        <MapFixSize />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
