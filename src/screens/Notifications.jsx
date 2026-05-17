import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";
import { Header } from "../components/shared";
import { C, F } from "../constants/theme";

const NOTIFS = [
  { id: "n1", icon: "🔥", title: "Your issue is gaining traction", body: "Your water shortage post crossed 50 i² signals. Keep neighbors posted as it develops.", time: "2h ago", unread: true },
  { id: "n2", icon: "✅", title: "Issue marked In Progress", body: "Corporator, Ward 12 responded to your sanitation report. Repair team dispatched.", time: "5h ago", unread: true },
  { id: "n3", icon: "📢", title: "New poll from your MLA", body: "Rajesh Nayak has posted a new community poll. Your vote matters.", time: "1d ago", unread: true },
  { id: "n4", icon: "💬", title: "New reply on your post", body: 'Sarah M replied: "Same issue in our block too..."', time: "1d ago", unread: false },
  { id: "n5", icon: "🎉", title: "Issue resolved", body: "Your widow pension request has been approved by MLA Office, Uppal.", time: "3d ago", unread: false },
];

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <Header title="Notifications" onBack={() => navigate("/feed")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {NOTIFS.map(n => (
          <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: n.unread ? `${C.purple}08` : "transparent", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2, gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{n.title}</span>
                <span style={{ fontSize: 11, color: C.text2, flexShrink: 0, fontFamily: F.body }}>{n.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.text2, lineHeight: 1.4, fontFamily: F.body }}>{n.body}</p>
            </div>
            {n.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.purple, flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
        <div style={{ padding: "20px 16px", textAlign: "center", color: C.text3, fontSize: 12, fontFamily: F.body }}>You're all caught up 🎉</div>
      </div>
    </PhoneFrame>
  );
}
