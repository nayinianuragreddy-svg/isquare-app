import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header } from "../components/shared";
import { C, F } from "../constants/theme";

const SEVERITY_COLOR = { Critical: "#F04438", High: "#FFB020", Routine: "#7856FF" };
const DEFAULT_CENTER = [17.385, 78.4867]; // Hyderabad fallback

async function geocodeResidence(residence) {
  if (!residence) return null;
  try {
    const q = encodeURIComponent(residence + ", India");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { "Accept-Language": "en" },
    });
    const data = await res.json();
    if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch { /* fallback to default */ }
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [centerReady, setCenterReady] = useState(false);
  const centerRef = useRef(DEFAULT_CENTER);

  // Determine map center from user location or profile residence
  useEffect(() => {
    const initCenter = async () => {
      // Try GPS first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            centerRef.current = [pos.coords.latitude, pos.coords.longitude];
            setCenterReady(true);
          },
          async () => {
            // GPS denied — try geocoding the profile residence
            if (profile?.residence) {
              const coords = await geocodeResidence(profile.residence);
              if (coords) centerRef.current = coords;
            }
            setCenterReady(true);
          },
          { timeout: 5000 }
        );
      } else if (profile?.residence) {
        const coords = await geocodeResidence(profile.residence);
        if (coords) centerRef.current = coords;
        setCenterReady(true);
      } else {
        setCenterReady(true);
      }
    };
    initCenter();
  }, [profile?.residence]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, description, category, severity, status, agree_count, lat, lng, profiles(name)")
      .eq("type", "public")
      .is("merged_into", null)
      .not("lat", "is", null)
      .then(({ data }) => setPosts(data || []));
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !centerReady) return;

    mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(centerRef.current, 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      maxZoom: 19,
    }).addTo(mapInstance.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [centerReady]);

  useEffect(() => {
    if (!mapInstance.current) return;

    mapInstance.current.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) mapInstance.current.removeLayer(layer);
    });

    const filtered = filter === "All" ? posts : posts.filter(p => p.severity === filter);

    filtered.forEach(p => {
      const color = SEVERITY_COLOR[p.severity] || C.purple;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 10 + Math.min((p.agree_count || 0) / 5, 14),
        fillColor: color,
        color: "#0A0A0F",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(mapInstance.current);

      marker.on("click", () => setSelected(p));
    });
  }, [posts, filter, centerReady]);

  const visibleCount = filter === "All" ? posts.length : posts.filter(p => p.severity === filter).length;

  return (
    <PhoneFrame>
      <Header title="Issues Map" onBack={() => navigate(-1)} />

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, overflowX: "auto" }}>
        {["All", "Critical", "High", "Routine"].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 999, background: filter === f ? (SEVERITY_COLOR[f] || C.purple) : C.surface2, color: filter === f ? "#fff" : C.text2, fontSize: 12, fontWeight: 700, border: `1px solid ${filter === f ? "transparent" : C.border}`, cursor: "pointer", whiteSpace: "nowrap", fontFamily: F.body, transition: "all 0.2s" }}>
            {f} {filter === f && `(${visibleCount})`}
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {posts.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.85)", zIndex: 1000, pointerEvents: "none" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F.body, marginBottom: 6 }}>No mapped issues yet</div>
            <div style={{ fontSize: 13, color: C.text2, fontFamily: F.body, textAlign: "center", maxWidth: 220 }}>Issues appear on this map when users share GPS while posting.</div>
          </div>
        )}

        {/* Legend */}
        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(10,10,15,0.9)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", zIndex: 500 }}>
          {Object.entries(SEVERITY_COLOR).map(([sev, col]) => (
            <div key={sev} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>{sev}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.purple, opacity: 0.5, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>Bigger = more i²</span>
          </div>
        </div>
      </div>

      {/* Selected post card */}
      {selected && (
        <div className="slide-up" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.surface2, borderTop: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", padding: "16px", zIndex: 1000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 11, fontWeight: 700, fontFamily: F.body }}>{selected.category}</span>
                <span style={{ fontSize: 11, color: SEVERITY_COLOR[selected.severity] || C.purple, fontWeight: 700, fontFamily: F.body }}>{selected.severity}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: C.text, fontFamily: F.body, lineHeight: 1.4, maxWidth: 260 }}>{selected.description?.slice(0, 100)}{selected.description?.length > 100 ? "..." : ""}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.purple, fontWeight: 700, fontFamily: F.body }}>{selected.agree_count} i²</span>
            <button onClick={() => navigate("/post/" + selected.id)} style={{ padding: "8px 16px", borderRadius: 20, background: C.gradient, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>View Issue →</button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
