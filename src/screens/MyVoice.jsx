import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { StatusBadge, SeverityTag, I2Button } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";
import { MOCK_MY_VOICE_PUBLIC, MOCK_MY_VOICE_PRIVATE } from "../data/mockData";

export default function MyVoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("Public");
  const [statusFilter, setStatusFilter] = useState("All");
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("posts").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const mapped = data.map(p => ({
        id: p.id, cat: p.category, severity: p.severity, date: timeAgo(p.created_at),
        desc: p.description, status: p.status, type: p.type === "public" ? "Public" : "Private",
        agree: p.agree_count, comments: p.comments_count, verified: true, routedTo: p.routed_to,
      }));
      setMyPosts(mapped);
    } else {
      setMyPosts([...MOCK_MY_VOICE_PUBLIC, ...MOCK_MY_VOICE_PRIVATE]);
    }
    setLoading(false);
  };

  const allPosts = myPosts.length > 0 ? myPosts : [...MOCK_MY_VOICE_PUBLIC, ...MOCK_MY_VOICE_PRIVATE];
  const typePosts = allPosts.filter(p => filter === "Public" ? p.type === "Public" : p.type === "Private");
  const filtered = typePosts.filter(p => statusFilter === "All" || p.status === statusFilter);

  return (
    <PhoneFrame>
      <div style={{ padding: "14px 16px 0", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple }}><Ics.Voice a={true} /></div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, fontFamily: F.body }}>My Voice</div>
            <div style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>Everything you've raised, in one place</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["Public", "Private"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: filter === f ? C.gradient : C.surface2, color: filter === f ? C.text : C.text2, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>
              {f === "Public" ? "Spoke Up" : "Requests"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
          {["All", "Open", "Pending", "In Progress", "Resolved"].map(f => (
            <div key={f} onClick={() => setStatusFilter(f)} style={{ padding: "5px 14px", borderRadius: 999, background: statusFilter === f ? C.text : "transparent", color: statusFilter === f ? C.bg : C.text2, fontSize: 12, fontWeight: 700, border: `1px solid ${statusFilter === f ? C.text : C.border}`, cursor: "pointer", whiteSpace: "nowrap", fontFamily: F.body }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: F.body }}>No {filter === "Public" ? "posts" : "requests"} yet</div>
            <div style={{ color: C.text2, fontSize: 14, marginBottom: 20, fontFamily: F.body }}>{filter === "Public" ? "Speak up about issues in your area." : "Send a personal request to your representative."}</div>
            <button onClick={() => navigate("/create", { state: { type: filter === "Public" ? "public" : "private" } })} style={{ background: C.gradient, color: C.text, padding: "10px 20px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: F.body }}>Create now</button>
          </div>
        ) : filtered.map((t, i) => (
          <article key={t.id || i} style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.surface3, display: "flex", alignItems: "center", justifyContent: "center", color: C.text2, flexShrink: 0 }}>
              {t.type === "Public" ? <Ics.SpeakUp /> : <Ics.Rep />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <SeverityTag level={t.severity} />
                  <span style={{ padding: "2px 8px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 11, fontWeight: 600, fontFamily: F.body }}>{t.cat}</span>
                </div>
                <span style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>{t.date}</span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.5, color: C.text, fontFamily: F.body }}>{t.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.type === "Public" ? 10 : 0 }}>
                <StatusBadge status={t.status} />
                {t.routedTo && <span style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>→ {t.routedTo}</span>}
              </div>
              {t.type === "Public" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <I2Button count={t.agree} />
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.text2, fontSize: 12, padding: "6px 10px", fontFamily: F.body }}>
                    <Ics.Comment /> {t.comments}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <BottomNavBar active="voice" navigate={navigate} />
    </PhoneFrame>
  );
}

function BottomNavBar({ active, navigate }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 20px", borderTop: `1px solid ${C.border}`, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", flexShrink: 0 }}>
      {[{ id: "feed", label: "Home", Icon: Ics.Home },
        { id: "create", label: "Create", isCreate: true },
        { id: "voice", label: "My Voice", Icon: Ics.Voice }].map(n => {
        const isActive = active === n.id;
        if (n.isCreate) return (
          <button key="create" onClick={() => navigate("/create")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60, color: C.text, position: "relative" }}>
            <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", width: 64, height: 32, borderRadius: "0 0 32px 32px", background: C.bg, border: `1px solid ${C.border}`, borderTop: "none", pointerEvents: "none" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(120,86,255,0.45), 0 0 0 3px ${C.bg}`, marginTop: -14, position: "relative", zIndex: 1 }}><Ics.Plus /></div>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text2, position: "relative", zIndex: 1, fontFamily: F.body }}>Create</span>
          </button>
        );
        return (
          <button key={n.id} onClick={() => navigate("/" + (n.id === "feed" ? "feed" : n.id))} style={{ background: "none", border: "none", color: isActive ? C.purple : C.text2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60 }}>
            <n.Icon a={isActive} />
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.body }}>{n.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
