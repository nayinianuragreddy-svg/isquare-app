import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Btn, Input } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";

const CATEGORIES = ["Water", "Road", "Electricity", "Sanitation", "Traffic", "Infrastructure", "Other"];

export default function CreateForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const postType = location.state?.type || "public";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ desc: "", area: "", cat: "" });
  const [anonymous, setAnonymous] = useState(false);
  const [sendTo, setSendTo] = useState("MLA");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.desc.trim() && form.area.trim() && form.cat;

  const handleBack = () => {
    if (form.desc.trim() || form.area.trim()) setConfirmDiscard(true);
    else navigate("/feed");
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - photos.length);
    if (!files.length || !user) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("post-images").getPublicUrl(path);
        urls.push(data.publicUrl);
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
      await supabase.from("posts").insert({
        author_id: user.id,
        type: postType,
        severity: "High",
        category: form.cat,
        description: form.desc.trim(),
        area: form.area.trim(),
        status: "Open",
        anonymous: postType === "public" && anonymous,
        loc_id: "resident",
        send_to: postType === "private" ? sendTo : null,
        routed_to: postType === "private" ? `${sendTo} Office` : null,
        agree_count: 0,
        comments_count: 0,
        photos,
      });
      navigate("/post-success", { state: { type: postType } });
    } catch (e) {
      console.error(e);
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

        <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>What's happening? *</label>
        <textarea placeholder="Describe the issue clearly. More detail = faster action." value={form.desc} onChange={e => set("desc", e.target.value)} style={{ width: "100%", padding: "14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", height: 100, resize: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: F.body }} />

        <Input label="Area *" placeholder="Street, landmark, block number" value={form.area} onChange={e => set("area", e.target.value)} right={<Ics.Pin />} />

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Category *</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => set("cat", cat)} style={{ padding: "8px 14px", borderRadius: 20, background: form.cat === cat ? C.purpleDim : C.surface2, border: `1px solid ${form.cat === cat ? C.purple : C.border}`, color: form.cat === cat ? C.purple : C.text, fontSize: 13, fontWeight: form.cat === cat ? 700 : 500, cursor: "pointer", fontFamily: F.body, transition: "all 0.2s" }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>
          Add Photos <span style={{ color: C.text2, fontWeight: 400 }}>(optional · up to 3)</span>
        </label>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {photos.map((url, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, flexShrink: 0 }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, lineHeight: 1 }}>×</button>
            </div>
          ))}
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
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoSelect} />
        </div>

        {postType === "public" ? (
          <div onClick={() => setAnonymous(!anonymous)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 14px", background: anonymous ? C.purpleDim : C.surface2, borderRadius: 10, border: `1px solid ${anonymous ? C.purple : C.border}`, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 18, height: 18, border: `2px solid ${anonymous ? C.purple : C.border}`, borderRadius: 4, flexShrink: 0, background: anonymous ? C.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {anonymous && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
            </div>
            <span style={{ fontSize: 13, color: anonymous ? C.purple : C.text2, flex: 1, fontWeight: anonymous ? 700 : 400, fontFamily: F.body }}>Post anonymously (your identity stays hidden)</span>
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

        <Btn disabled={!canSubmit || uploading} loading={loading} onClick={handleSubmit}>
          {postType === "public" ? "Speak Up" : "Send Request"}
        </Btn>
        <div style={{ height: 20 }} />
      </div>

      {confirmDiscard && (
        <div onClick={() => setConfirmDiscard(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", padding: "0 24px" }}>
          <div onClick={e => e.stopPropagation()} className="scale-in" style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, fontFamily: F.body }}>Discard changes?</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 20, lineHeight: 1.5, fontFamily: F.body }}>You have unsaved text. If you leave now, it will be lost.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDiscard(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Keep editing</button>
              <button onClick={() => { setConfirmDiscard(false); navigate("/feed"); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: C.red, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
