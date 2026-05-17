import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Btn, Input, BottomSheet } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut, saveProfile } = useAuth();
  const [settingsSheet, setSettingsSheet] = useState(null);
  const [darkTheme, setDarkTheme] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: profile?.name || "", username: profile?.username || "", residence: profile?.residence || "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ raised: 0, resolved: 0, isquared: 0 });

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
    } catch (e) { console.error(e); }
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
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
              {profile?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: F.body }}>{profile?.name || "Citizen"}</span>
                <Ics.Badge />
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
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: F.body }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2, fontFamily: F.body }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Verification warning */}
        <div style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}>
          <Ics.Warning />
          <span style={{ color: C.amber, fontSize: 13, flex: 1, fontFamily: F.body }}>Please reupload ID Proof for verification</span>
          <div style={{ color: C.amber }}><Ics.ChevRight /></div>
        </div>

        {/* Settings list */}
        {[
          { icon: Ics.Moon, text: "Dark Theme", toggle: true, action: () => setDarkTheme(!darkTheme), toggleOn: darkTheme },
          { icon: Ics.Info, text: "About i²", action: () => setSettingsSheet("about") },
          { icon: Ics.File, text: "Terms & Privacy", action: () => setSettingsSheet("terms") },
          { icon: Ics.Shield, text: "Security", action: () => setSettingsSheet("security") },
          { icon: Ics.Trash, text: "Delete Account", red: true, action: () => setSettingsSheet("delete") },
          { icon: Ics.Logout, text: "Logout", red: true, action: handleLogout },
        ].map((item, i, arr) => (
          <div key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: item.red ? C.red : C.text, fontSize: 15, fontWeight: 500, fontFamily: F.body }}>
              <div style={{ color: item.red ? C.red : C.text2 }}><item.icon /></div>
              {item.text}
            </div>
            {item.toggle ? (
              <div style={{ width: 44, height: 24, background: item.toggleOn ? C.purple : C.surface3, borderRadius: 12, position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, right: item.toggleOn ? 2 : "auto", left: item.toggleOn ? "auto" : 2, transition: "all 0.2s" }} />
              </div>
            ) : (
              <div style={{ color: C.text2 }}><Ics.ChevRight /></div>
            )}
          </div>
        ))}
      </div>

      {/* Settings sheets */}
      <BottomSheet open={!!settingsSheet} onClose={() => setSettingsSheet(null)}>
        {settingsSheet === "about" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>About i²</h3>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>i² is a civic-engagement platform built on one idea: when two voices square, they become louder than ten.</p>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>Raise issues in your area, support your neighbors' concerns, and send private requests directly to your elected representatives — all in one place.</p>
            <p style={{ color: C.text3, fontSize: 12, margin: "12px 0 16px", fontFamily: F.body }}>Version 1.0.0 · Made in Hyderabad</p>
            <Btn onClick={() => setSettingsSheet(null)}>Got it</Btn>
          </>
        )}
        {settingsSheet === "terms" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>Terms & Privacy</h3>
            {[["Your data", "We collect only what's needed to verify you're a real resident and route your requests to the right representative."], ["Anonymous posts", "When you choose anonymous, your identity is never shown publicly, but platform administrators retain audit access for abuse prevention."], ["Personal requests", "Shared only with the representative you select. Not visible to other users."]].map(([title, text]) => (
              <p key={title} style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 10px", fontFamily: F.body }}><strong style={{ color: C.text }}>{title}:</strong> {text}</p>
            ))}
            <div style={{ height: 16 }} />
            <Btn onClick={() => setSettingsSheet(null)}>Close</Btn>
          </>
        )}
        {settingsSheet === "security" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>Security</h3>
            {[{ label: "Two-factor authentication", value: "Off" }, { label: "Login alerts", value: "On" }, { label: "Active sessions", value: "1 device" }, { label: "Last login", value: "Today, 9:41 AM" }].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 14, fontFamily: F.body }}>{row.label}</span>
                <span style={{ fontSize: 14, color: C.text2, fontFamily: F.body }}>{row.value}</span>
              </div>
            ))}
            <div style={{ height: 20 }} />
            <Btn onClick={() => setSettingsSheet(null)}>Close</Btn>
          </>
        )}
        {settingsSheet === "delete" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: C.red, fontFamily: F.body }}>Delete Account?</h3>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>This will permanently remove your profile, all issues you've raised, and all support you've given. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setSettingsSheet(null)} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "transparent", border: `1px solid ${C.border}`, color: C.text, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Cancel</button>
              <button onClick={() => { setSettingsSheet(null); handleLogout(); }} style={{ flex: 1, padding: "14px", borderRadius: 12, background: C.red, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Delete</button>
            </div>
          </>
        )}
      </BottomSheet>
    </PhoneFrame>
  );
}
