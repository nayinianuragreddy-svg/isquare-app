import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header } from "../components/shared";
import { C, F } from "../constants/theme";
import { I2Logo } from "../components/icons";
import { toast } from "../lib/toast";

const TYPE_ICON = { vote: "🔥", comment: "💬", status_change: "✅", merge_accepted: "🤝", default: "📢" };

function groupByDate(notifs) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
  notifs.forEach(n => {
    const d = new Date(n.created_at);
    if (d >= today) groups.Today.push(n);
    else if (d >= yesterday) groups.Yesterday.push(n);
    else if (d >= weekAgo) groups["This Week"].push(n);
    else groups.Earlier.push(n);
  });
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotifs();

    const channel = supabase.channel("notifs-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchNotifs())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const fetchNotifs = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifs(data || []);
    setLoading(false);

    // Mark all as read
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  };

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  };

  return (
    <PhoneFrame>
      <Header title="Notifications" onBack={() => navigate("/feed")} />
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none" }}
        onTouchStart={e => { if (scrollRef.current?.scrollTop === 0) touchStartY.current = e.touches[0].clientY; }}
        onTouchMove={e => { if (!touchStartY.current) return; const d = e.touches[0].clientY - touchStartY.current; if (d > 0 && scrollRef.current?.scrollTop === 0) setPullDist(Math.min(d * 0.35, 70)); }}
        onTouchEnd={() => { if (pullDist > 45 && !refreshing) { setRefreshing(true); fetchNotifs().then(() => { setRefreshing(false); toast("Refreshed"); }); } setPullDist(0); touchStartY.current = 0; }}>
        {(pullDist > 0 || refreshing) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: refreshing ? 50 : pullDist, overflow: "hidden", transition: pullDist > 0 ? "none" : "height 0.3s" }}>
            <div style={{ opacity: Math.min((pullDist || (refreshing ? 45 : 0)) / 45, 1), transform: refreshing ? "scale(1)" : `scale(${Math.min(pullDist / 60, 1)})`, animation: refreshing ? "pulse1 1s ease-in-out infinite" : "none", transition: refreshing ? "opacity 0.2s" : "none" }}>
              <I2Logo size={26} />
            </div>
          </div>
        )}
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.surface3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 14, background: C.surface3, borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: "90%", height: 12, background: C.surface3, borderRadius: 6 }} />
              </div>
            </div>
          ))
        ) : notifs.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}20, ${C.accent}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulse1 3s ease-in-out infinite" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: F.body, letterSpacing: -0.3 }}>All quiet here</div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.5, fontFamily: F.body, maxWidth: 260, margin: "0 auto" }}>When someone supports or replies to your issues, you'll be notified here.</div>
          </div>
        ) : (
          <>
            {groupByDate(notifs).map(([label, items]) => (
              <div key={label}>
                <div style={{ padding: "8px 16px 6px", fontSize: 11, fontWeight: 700, color: C.text2, textTransform: "uppercase", letterSpacing: 1.2, background: C.surface2, borderBottom: `1px solid ${C.border}`, fontFamily: F.body }}>
                  {label}
                </div>
                {items.map((n, idx) => (
                  <div
                    key={n.id}
                    onClick={() => n.post_id && navigate("/post/" + n.post_id)}
                    className="pressable"
                    style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: !n.read ? `${C.purple}08` : "transparent", cursor: n.post_id ? "pointer" : "default", animation: `listIn 0.3s cubic-bezier(0.16,1,0.3,1) ${idx * 40}ms both` }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: C.surface3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {TYPE_ICON[n.type] || TYPE_ICON.default}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2, gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{n.title}</span>
                        <span style={{ fontSize: 11, color: C.text2, flexShrink: 0, fontFamily: F.body }}>{timeAgo(n.created_at)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: C.text2, lineHeight: 1.4, fontFamily: F.body }}>{n.body}</p>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.purple, flexShrink: 0, marginTop: 6 }} />}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ padding: "20px 16px", textAlign: "center", color: C.text3, fontSize: 12, fontFamily: F.body }}>You're all caught up ✓</div>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
