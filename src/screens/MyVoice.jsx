import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { StatusBadge, SeverityTag, I2Button, PostCardSkeleton } from "../components/shared";
import { Ics, I2Logo } from "../components/icons";
import { C, F } from "../constants/theme";
import { toast } from "../lib/toast";

export default function MyVoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false).then(({ count }) => setUnreadCount(count || 0));
  }, [user]);
  const [filter, setFilter] = useState("Public");
  const [statusFilter, setStatusFilter] = useState("All");
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("posts").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    const mapped = (data || []).map(p => ({
      id: p.id, cat: p.category, severity: p.severity, date: timeAgo(p.created_at),
      desc: p.description, status: p.status, type: p.type === "public" ? "Public" : "Private",
      agree: p.agree_count, comments: p.comments_count, verified: true, routedTo: p.routed_to,
    }));
    setMyPosts(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const typePosts = myPosts.filter(p => filter === "Public" ? p.type === "Public" : p.type === "Private");
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

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none" }}
        onTouchStart={e => { if (scrollRef.current?.scrollTop === 0) touchStartY.current = e.touches[0].clientY; }}
        onTouchMove={e => { if (!touchStartY.current) return; const d = e.touches[0].clientY - touchStartY.current; if (d > 0 && scrollRef.current?.scrollTop === 0) setPullDist(Math.min(d * 0.35, 70)); }}
        onTouchEnd={() => { if (pullDist > 45 && !refreshing) { setRefreshing(true); fetchMyPosts().then(() => { setRefreshing(false); toast("Refreshed"); }); } setPullDist(0); touchStartY.current = 0; }}>
        {(pullDist > 0 || refreshing) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: refreshing ? 50 : pullDist, overflow: "hidden", transition: pullDist > 0 ? "none" : "height 0.3s" }}>
            <div style={{ opacity: Math.min((pullDist || (refreshing ? 45 : 0)) / 45, 1), transform: refreshing ? "scale(1)" : `scale(${Math.min(pullDist / 60, 1)})`, animation: refreshing ? "pulse1 1s ease-in-out infinite" : "none", transition: refreshing ? "opacity 0.2s" : "none" }}>
              <I2Logo size={26} />
            </div>
          </div>
        )}
        {loading ? (
          Array(3).fill(0).map((_, i) => <PostCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}20, ${C.accent}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulse1 3s ease-in-out infinite" }}>
                {filter === "Public" ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                )}
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: F.body, letterSpacing: -0.3 }}>{filter === "Public" ? "No issues raised yet" : "No requests sent yet"}</div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.5, fontFamily: F.body, marginBottom: 20, maxWidth: 260, margin: "0 auto 20px" }}>{filter === "Public" ? "Be the change. Raise an issue and your neighborhood will rally behind you." : "Reach your representative directly with a private request."}</div>
            <button onClick={() => navigate("/create", { state: { type: filter === "Public" ? "public" : "private" } })} style={{ padding: "12px 28px", borderRadius: 24, background: C.gradient, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body, boxShadow: "0 4px 20px rgba(120,86,255,0.3)" }}>{filter === "Public" ? "Speak Up" : "Send Request"}</button>
          </div>
        ) : filtered.map((t, i) => (
          <article key={t.id || i} onClick={() => navigate("/post/" + t.id)} style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, cursor: "pointer" }}>
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

      <BottomNavBar active="voice" navigate={navigate} unreadCount={unreadCount} />
    </PhoneFrame>
  );
}

function BottomNavBar({ active, navigate, unreadCount = 0 }) {
  return (
    <div className="glass-nav" style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      {[{ id: "feed", label: "Home", Icon: Ics.Home, path: "/feed" },
        { id: "notifications", label: "Alerts", Icon: Ics.Bell, path: "/notifications", badge: unreadCount },
        { id: "create", label: "Create", isCreate: true },
        { id: "voice", label: "My Voice", Icon: Ics.Voice, path: "/voice" }].map(n => {
        const isActive = active === n.id;
        if (n.isCreate) return (
          <button key="create" onClick={() => navigate("/create")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52, color: C.text, position: "relative" }}>
            <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 56, height: 28, borderRadius: "0 0 28px 28px", background: C.bg, border: `1px solid ${C.border}`, borderTop: "none", pointerEvents: "none" }} />
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(120,86,255,0.45), 0 0 0 3px ${C.bg}`, marginTop: -12, position: "relative", zIndex: 1 }}><Ics.Plus /></div>
            <span style={{ fontSize: 9, fontWeight: 600, color: C.text2, position: "relative", zIndex: 1, fontFamily: F.body }}>Create</span>
          </button>
        );
        return (
          <button key={n.id} onClick={() => { if (navigator.vibrate) navigator.vibrate(8); navigate(n.path); }} style={{ background: "none", border: "none", color: isActive ? C.purple : C.text2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52, transition: "color 0.2s", position: "relative" }}>
            <div className={isActive ? "nav-active-icon" : ""} style={{ display: "flex", position: "relative" }}>
              <n.Icon a={isActive} />
              {n.badge > 0 && (
                <div style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", padding: "0 4px", border: `2px solid ${C.bg}` }}>
                  {n.badge > 9 ? "9+" : n.badge}
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, fontFamily: F.body }}>{n.label}</span>
            {isActive && <div style={{ position: "absolute", bottom: -4, width: 4, height: 4, borderRadius: "50%", background: C.purple }} />}
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
