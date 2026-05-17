import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header } from "../components/shared";
import { C, F } from "../constants/theme";

const TYPE_ICON = { vote: "🔥", comment: "💬", status_change: "✅", default: "📢" };

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div style={{ flex: 1, overflowY: "auto" }}>
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: F.body }}>No notifications yet</div>
            <div style={{ color: C.text2, fontSize: 14, fontFamily: F.body }}>When others support or comment on your posts, you'll see it here.</div>
          </div>
        ) : (
          <>
            {notifs.map(n => (
              <div
                key={n.id}
                onClick={() => n.post_id && navigate("/post/" + n.post_id)}
                style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: !n.read ? `${C.purple}08` : "transparent", cursor: n.post_id ? "pointer" : "default" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
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
            <div style={{ padding: "20px 16px", textAlign: "center", color: C.text3, fontSize: 12, fontFamily: F.body }}>You're all caught up</div>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
