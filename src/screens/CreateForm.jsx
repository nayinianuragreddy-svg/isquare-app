import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Btn, Input } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";
import { toast } from "../lib/toast";

const CATEGORIES = ["Water", "Roads", "Electricity", "Sanitation", "Traffic", "Infrastructure", "Other"];
const SEVERITIES = [
  { id: "Critical", label: "Critical", desc: "Danger to life or safety", color: "#F04438" },
  { id: "High", label: "High", desc: "Urgent, needs quick action", color: "#FFB020" },
  { id: "Routine", label: "Routine", desc: "Important but not urgent", color: "#8E8E99" },
];

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a = data.address || {};
    const parts = [
      a.neighbourhood || a.suburb || a.quarter,
      a.city_district || a.town || a.city || a.village,
    ].filter(Boolean);
    return parts.join(", ") || data.display_name?.split(",").slice(0, 2).join(",").trim() || "";
  } catch {
    return "";
  }
}

export default function CreateForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const postType = location.state?.type || "public";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ desc: "", area: "", cat: "", severity: "High" });
  const [anonymous, setAnonymous] = useState(false);
  const [sendTo, setSendTo] = useState("MLA");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.desc.trim() && form.area.trim() && form.cat;

  const handleBack = () => {
    if (form.desc.trim() || form.area.trim()) setConfirmDiscard(true);
    else navigate(-1);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast("GPS not supported on this device", "error");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setGpsLoading(false);
        const area = await reverseGeocode(lat, lng);
        if (area) {
          set("area", area);
          toast("Location detected", "success");
        } else {
          toast("GPS captured — enter area manually", "info");
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast("Location access denied. Please enable GPS in settings.", "error");
        } else {
          toast("Couldn't get your location. Try again.", "error");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Auto-trigger GPS on mount
  useEffect(() => { getLocation(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - photos.length);
    if (!files.length || !user) return;

    // Validate file sizes before upload
    const MAX_IMAGE = 8 * 1024 * 1024;  // 8 MB
    const MAX_VIDEO = 30 * 1024 * 1024; // 30 MB
    for (const file of files) {
      const isVid = file.type.startsWith("video/");
      if (file.size > (isVid ? MAX_VIDEO : MAX_IMAGE)) {
        toast(`${isVid ? "Videos" : "Images"} must be under ${isVid ? "30 MB" : "8 MB"}.`, "error");
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    const urls = [];
    for (const file of files) {
      const isVid = file.type.startsWith("video/");
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      try {
        const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
        if (!error) {
          const { data } = supabase.storage.from("post-images").getPublicUrl(path);
          urls.push(isVid ? "video::" + data.publicUrl : data.publicUrl);
        }
      } catch {
        toast(`${isVid ? "Video" : "Photo"} upload failed`, "error");
      }
    }
    setPhotos(prev => [...prev, ...urls].slice(0, 3));
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        type: postType,
        severity: form.severity,
        category: form.cat,
        description: form.desc.trim(),
        area: form.area.trim(),
        status: "Open",
        anonymous: postType === "public" && anonymous,
        loc_id: profile?.id || null,
        send_to: postType === "private" ? sendTo : null,
        routed_to: postType === "private" ? `${sendTo} Office` : null,
        agree_count: 0,
        comments_count: 0,
        photos,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      });
      if (error) throw error;
      navigate("/post-success", { state: { type: postType } });
    } catch (e) {
      console.error(e);
      toast(e?.message || "Couldn't post. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <Header title={postType === "public" ? "Speak Up" : "Personal Request"} onBack={handleBack} />
      <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>

        <div style={{ color: postType === "public" ? C.purple : C.accent, fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 12px", background: postType === "public" ? C.purpleDim : "rgba(29,155,240,0.15)", borderRadius: 10, border: `1px solid ${postType === "public" ? C.purple : C.accent}40`, fontFamily: F.body }}>
          <Ics.Info />
          <span style={{ fontWeight: 600 }}>{postType === "public" ? "Visible to everyone in your area" : "Private — only your representative sees this"}</span>
        </div>

        <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>What's the issue? *</label>
        <textarea placeholder="Be specific — street name, block number, what's broken and since when. More detail = faster action." value={form.desc} onChange={e => { if (e.target.value.length <= 500) set("desc", e.target.value); }} style={{ width: "100%", padding: "14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", height: 100, resize: "none", marginBottom: 4, boxSizing: "border-box", fontFamily: F.body }} />
        <div style={{ textAlign: "right", fontSize: 11, color: form.desc.length > 450 ? C.amber : C.text3, marginBottom: 16, fontFamily: F.body }}>{form.desc.length}/500</div>

        <div style={{ position: "relative" }}>
          <Input label="Area *" placeholder="Street, landmark, block number" value={form.area} onChange={e => set("area", e.target.value)} maxLength={120} right={<Ics.Pin />} />
          <button onClick={getLocation} type="button" style={{ position: "absolute", right: 42, top: 36, background: "none", border: "none", padding: "4px 8px", cursor: "pointer", fontSize: 11, color: coords ? C.green : C.purple, fontWeight: 700, fontFamily: F.body }}>
            {gpsLoading ? "locating..." : coords ? "✓ GPS" : "Use GPS"}
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Category *</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => set("cat", cat)} style={{ padding: "8px 14px", borderRadius: 20, background: form.cat === cat ? C.purpleDim : C.surface2, border: `1px solid ${form.cat === cat ? C.purple : C.border}`, color: form.cat === cat ? C.purple : C.text, fontSize: 13, fontWeight: form.cat === cat ? 700 : 500, cursor: "pointer", fontFamily: F.body, transition: "all 0.2s" }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>How urgent is it? *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {SEVERITIES.map(s => (
              <button key={s.id} onClick={() => set("severity", s.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, background: form.severity === s.id ? `${s.color}20` : C.surface2, border: `1px solid ${form.severity === s.id ? s.color : C.border}`, cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.severity === s.id ? s.color : C.text, fontFamily: F.body }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.text2, marginTop: 2, fontFamily: F.body }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>
          Add Photos / Video <span style={{ color: C.text2, fontWeight: 400 }}>(optional · up to 3 · images 8 MB · videos 30 MB)</span>
        </label>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {photos.map((url, i) => {
            const isVid = url.startsWith("video::");
            return (
              <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, flexShrink: 0 }}>
                {isVid ? (
                  <div style={{ width: "100%", height: "100%", background: C.surface3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.purple, gap: 4 }}>
                    <Ics.Video />
                    <span style={{ fontSize: 9, fontFamily: F.body, color: C.text2 }}>Video</span>
                  </div>
                ) : (
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, lineHeight: 1 }}>×</button>
              </div>
            );
          })}
          {photos.length < 3 && (
            <div onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, border: `1.5px dashed ${uploading ? C.purple : C.border}`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: uploading ? C.purple : C.text2, cursor: "pointer", background: C.surface2, transition: "all 0.2s" }}>
              {uploading ? (
                <div style={{ width: 20, height: 20, border: `2px solid ${C.purple}`, borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <>
                  <Ics.Camera />
                  <span style={{ fontSize: 11, marginTop: 4, fontFamily: F.body }}>Add</span>
                </>
              )}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handlePhotoSelect} />
        </div>

        {postType === "public" ? (
          <div onClick={() => setAnonymous(!anonymous)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 14px", background: anonymous ? C.purpleDim : C.surface2, borderRadius: 10, border: `1px solid ${anonymous ? C.purple : C.border}`, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 18, height: 18, border: `2px solid ${anonymous ? C.purple : C.border}`, borderRadius: 4, flexShrink: 0, background: anonymous ? C.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {anonymous && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: anonymous ? C.purple : C.text, fontWeight: anonymous ? 700 : 500, fontFamily: F.body }}>Post anonymously</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2, fontFamily: F.body }}>Other users won't see your name or profile — only you know it was you.</div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: C.text, fontSize: 13, fontWeight: 700, marginBottom: 10, fontFamily: F.body }}>Send to *</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Corporator", "MLA", "MP"].map(r => (
                <button key={r} onClick={() => setSendTo(r)} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: sendTo === r ? C.purpleDim : C.surface2, border: `1px solid ${sendTo === r ? C.purple : C.border}`, color: sendTo === r ? C.purple : C.text, fontSize: 13, fontWeight: sendTo === r ? 700 : 500, cursor: "pointer", fontFamily: F.body, transition: "all 0.2s" }}>{r}</button>
              ))}
            </div>
          </div>
        )}

        <Btn disabled={!canSubmit || uploading || loading} loading={loading} onClick={handleSubmit}>
          {postType === "public" ? "Speak Up" : "Send Request"}
        </Btn>
        <div style={{ height: 20 }} />
      </div>

      {confirmDiscard && (
        <div onClick={() => setConfirmDiscard(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", padding: "0 24px" }}>
          <div onClick={e => e.stopPropagation()} className="scale-in" style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, fontFamily: F.body }}>Discard draft?</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 20, lineHeight: 1.5, fontFamily: F.body }}>You have unsaved changes. Leave now and they're gone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDiscard(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Keep editing</button>
              <button onClick={() => { setConfirmDiscard(false); navigate(-1); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: C.red, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
