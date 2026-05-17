import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PhoneFrame from "../../components/PhoneFrame";
import { Btn, Input, Header } from "../../components/shared";
import { Ics } from "../../components/icons";
import { C, F } from "../../constants/theme";
import { supabase } from "../../lib/supabase";

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveProfile } = useAuth();
  const phone = location.state?.phone || "+91 9876543219";

  const [form, setForm] = useState({ name: "", username: "", gender: "", dob: { dd: "", mm: "", yyyy: "" }, residence: "" });
  const [usernameStatus, setUsernameStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPicked, setAvatarPicked] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkUsername = async (val) => {
    set("username", val);
    if (val.length < 3) { setUsernameStatus(""); return; }
    const { data } = await supabase.from("profiles").select("id").eq("username", val).maybeSingle();
    setUsernameStatus(data ? "taken" : "available");
  };

  const dobValid = () => {
    const { dd, mm, yyyy } = form.dob;
    if (!dd || !mm || !yyyy) return false;
    const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy);
    return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1920 && y <= 2020;
  };

  const canSubmit = form.name.trim() && form.gender && form.username.length >= 3 && usernameStatus === "available" && form.residence.trim() && dobValid();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await saveProfile({
        phone,
        name: form.name.trim(),
        username: form.username.trim(),
        gender: form.gender,
        dob: `${form.dob.yyyy}-${form.dob.mm.padStart(2,"0")}-${form.dob.dd.padStart(2,"0")}`,
        residence: form.residence.trim(),
        verified: false,
      });
      navigate("/success");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <Header title="Create your profile" onBack={() => navigate("/login")} />
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div onClick={() => setAvatarPicked(true)} role="button" tabIndex={0} style={{ width: 88, height: 88, borderRadius: "50%", background: avatarPicked ? C.gradient : C.surface2, border: avatarPicked ? "none" : `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer", color: avatarPicked ? C.text : C.text2, fontSize: 32, fontWeight: 800 }}>
            {avatarPicked && form.name ? form.name[0].toUpperCase() : <Ics.User size={40} />}
            <div style={{ position: "absolute", bottom: -2, right: -2, background: C.gradient, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.bg}`, color: C.text }}>
              <Ics.Plus />
            </div>
          </div>
        </div>

        <Input label="Mobile Number *" value={phone} disabled />
        <Input label="Full Name *" placeholder="e.g. Aditya Kumar" value={form.name} onChange={e => set("name", e.target.value)} />

        {/* Username */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Username *</label>
          <div style={{ border: `1px solid ${usernameStatus === "taken" ? C.red : usernameStatus === "available" ? C.green : C.border}`, borderRadius: 10, overflow: "hidden", background: C.surface2 }}>
            <input placeholder="e.g. aditya_k" value={form.username} onChange={e => checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} style={{ width: "100%", padding: "14px", background: "transparent", border: "none", color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: F.body }} />
          </div>
        </div>
        {usernameStatus === "taken" && <div style={{ color: C.red, fontSize: 12, marginBottom: 16, marginTop: 4 }}>That username is taken.</div>}
        {usernameStatus === "available" && <div style={{ color: C.green, fontSize: 12, marginBottom: 16, marginTop: 4 }}>✓ Available</div>}
        {!usernameStatus && <div style={{ height: 20 }} />}

        {/* Gender */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Gender *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["Male", "Female", "Other"].map(g => (
              <button key={g} onClick={() => set("gender", g)} style={{ flex: 1, padding: "12px", borderRadius: 10, background: form.gender === g ? C.purpleDim : C.surface2, border: `1px solid ${form.gender === g ? C.purple : C.border}`, color: form.gender === g ? C.purple : C.text, fontSize: 14, fontWeight: form.gender === g ? 700 : 500, cursor: "pointer", fontFamily: F.body, transition: "all 0.2s" }}>{g}</button>
            ))}
          </div>
        </div>

        {/* DOB */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Date of Birth *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ p: "DD", k: "dd", m: 2 }, { p: "MM", k: "mm", m: 2 }, { p: "YYYY", k: "yyyy", m: 4 }].map(f => (
              <input key={f.k} placeholder={f.p} value={form.dob[f.k]} onChange={e => set("dob", { ...form.dob, [f.k]: e.target.value.replace(/\D/g, "") })} maxLength={f.m} style={{ flex: f.k === "yyyy" ? 2 : 1, padding: "14px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", textAlign: "center", fontFamily: F.body }} />
            ))}
          </div>
        </div>

        <Input label="Residence *" placeholder="Colony / Area, City" value={form.residence} onChange={e => set("residence", e.target.value)} right={<Ics.Pin />} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: C.purpleDim, border: `1px solid ${C.purple}30`, borderRadius: 10, marginBottom: 24, color: C.purple, fontSize: 13, fontFamily: F.body }}>
          <Ics.Shield />
          <span>Your ID will be verified within 24 hours</span>
        </div>

        <Btn onClick={handleSubmit} disabled={!canSubmit} loading={loading}>Create Account</Btn>
        <div style={{ height: 20 }} />
      </div>
    </PhoneFrame>
  );
}
