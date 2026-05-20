import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Btn, Input, BottomSheet } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";
import { AnimatedNumber } from "../lib/useCountUp";
import { toast } from "../lib/toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, saveProfile } = useAuth();
  const avatarInputRef = useRef(null);
  const [settingsSheet, setSettingsSheet] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: profile?.name || "", username: profile?.username || "", residence: profile?.residence || "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ raised: 0, resolved: 0, isquared: 0 });
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      await supabase.storage.from("post-images").upload(path, file, { upsert: true });
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      await saveProfile({ avatar_url: url });
      toast("Photo updated");
    } catch (err) {
      toast("Upload failed", "error");
    }
    setAvatarUploading(false);
    e.target.value = "";
  };

  useEffect(() => {
    if (!profile?.id) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from("posts")
        .select("status, agree_count")
        .eq("author_id", profile.id);
      if (data) {
        setStats({
          raised: data.length,
          resolved: data.filter(p => p.status === "Resolved").length,
          isquared: data.reduce((sum, p) => sum + (p.agree_count || 0), 0),
        });
      }
    };
    fetchStats();
  }, [profile?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ name: editForm.name, username: editForm.username, residence: editForm.residence });
      setEditing(false);
      toast("Profile saved");
    } catch (e) { console.error(e); toast("Save failed", "error"); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <PhoneFrame>
      <Header title="Profile" onBack={() => navigate("/feed")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

        {/* Avatar + info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div onClick={() => avatarInputRef.current?.click()} style={{ width: 64, height: 64, borderRadius: "50%", background: profile?.avatar_url ? "none" : C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, cursor: "pointer", position: "relative", overflow: "hidden" }}>
              {avatarUploading ? (
                <div style={{ width: 24, height: 24, border: `2px solid ${C.text}`, borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                profile?.name?.[0]?.toUpperCase() || "A"
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ics.Camera />
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: F.body }}>{profile?.name || "Citizen"}</span>
                {profile?.verified && <Ics.Badge />}
              </div>
              <div style={{ color: C.text2, fontSize: 13, fontFamily: F.body }}>@{profile?.username || "citizen"}</div>
              <div style={{ color: C.text2, fontSize: 12, marginTop: 2, fontFamily: F.body }}>{profile?.phone || ""}</div>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, color: C.text, cursor: "pointer" }}>
            <Ics.Edit />
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="slide-up" style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px", marginBottom: 20 }}>
            <Input label="Full Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Username" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
            <Input label="Residence" value={editForm.residence} onChange={e => setEditForm(f => ({ ...f, residence: e.target.value }))} right={<Ics.Pin />} />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleSave} loading={saving} style={{ flex: 1 }}>Save</Btn>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[{ val: stats.raised, label: "Issues raised", color: C.text }, { val: stats.resolved, label: "Resolved", color: C.green }, { val: stats.isquared, label: "i² received", color: C.purple }].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "14px 10px", background: C.surface2, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: F.body }}><AnimatedNumber value={s.val} /></div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2, fontFamily: F.body }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Verification status */}
        {profile?.verified ? (
          <div style={{ background: `${C.green}15`, border: `1px solid ${C.green}40`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
            <span style={{ color: C.green, fontSize: 13, flex: 1, fontFamily: F.body, fontWeight: 600 }}>Verified citizen</span>
          </div>
        ) : (
          <div style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}30`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Ics.Info />
            <span style={{ color: C.amber, fontSize: 13, flex: 1, fontFamily: F.body }}>Verification pending — we'll review your profile within 24 hours</span>
          </div>
        )}

        {/* Settings list */}
        {[
          { icon: Ics.Info, text: "About i²", action: () => setSettingsSheet("about") },
          { icon: Ics.File, text: "Terms & Privacy", action: () => setSettingsSheet("terms") },
          { icon: Ics.Shield, text: "Security", action: () => setSettingsSheet("security") },
          { icon: Ics.Logout, text: "Logout", red: true, action: handleLogout },
        ].map((item, i, arr) => (
          <div key={i} onClick={item.action} className="pressable" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: item.red ? C.red : C.text, fontSize: 15, fontWeight: 500, fontFamily: F.body }}>
              <div style={{ color: item.red ? C.red : C.text2 }}><item.icon /></div>
              {item.text}
            </div>
            <div style={{ color: C.text2 }}><Ics.ChevRight /></div>
          </div>
        ))}
      </div>

      {/* Settings sheets */}
      <BottomSheet open={!!settingsSheet} onClose={() => setSettingsSheet(null)}>
        {settingsSheet === "about" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>About i²</h3>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>i² is built on a simple idea: when two voices square together, they become louder than ten.</p>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>Raise civic issues publicly, rally your neighbors behind what matters, and send private requests directly to your elected representatives — all in one place, built for real residents.</p>
            <p style={{ color: C.text3, fontSize: 12, margin: "12px 0 16px", fontFamily: F.body }}>Version 1.0.0 · Built in Hyderabad</p>
            <Btn onClick={() => setSettingsSheet(null)}>Got it</Btn>
          </>
        )}
        {settingsSheet === "terms" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", fontFamily: F.body }}>Terms & Privacy</h3>
            {[
              ["Your data", "We collect only what's needed: your phone number, name, and residence. We use it to verify you're a real resident and surface issues relevant to your area."],
              ["Anonymous posts", "When you post anonymously, your identity is hidden from all other users of this app. Only platform administrators retain access for abuse prevention and legal compliance."],
              ["Personal requests", "Private requests are shared only with the elected representative you select. No other user can see them."],
              ["We never sell your data", "Your information is never sold to advertisers, shared with third parties, or used for anything beyond making this platform work."],
            ].map(([title, text]) => (
              <p key={title} style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>
                <strong style={{ color: C.text }}>{title}: </strong>{text}
              </p>
            ))}
            <div style={{ height: 8 }} />
            <Btn onClick={() => setSettingsSheet(null)}>Got it</Btn>
          </>
        )}
        {settingsSheet === "security" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>Security</h3>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 16px", fontFamily: F.body }}>Your data is stored on encrypted servers with strict access controls.</p>
            {[
              { label: "Identity on posts", value: "Private by default" },
              { label: "Visible to other users", value: "Only if you choose" },
              { label: "Data encryption", value: "AES-256" },
              { label: "Active sessions", value: "This device" },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 14, fontFamily: F.body, color: C.text }}>{row.label}</span>
                <span style={{ fontSize: 13, color: C.text2, fontFamily: F.body, textAlign: "right", maxWidth: 160 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "12px 14px", background: C.purpleDim, border: `1px solid ${C.purple}30`, borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.purple, lineHeight: 1.5, fontFamily: F.body }}>
                <strong>What "Anonymous" means:</strong> When you post anonymously, other users of this app — including your neighbors — will never see your name, photo, or profile. Only internal platform administrators can see authorship for abuse prevention.
              </p>
            </div>
            <div style={{ height: 20 }} />
            <Btn onClick={() => setSettingsSheet(null)}>Got it</Btn>
          </>
        )}
      </BottomSheet>
    </PhoneFrame>
  );
}
