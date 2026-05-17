import { useNavigate, useLocation } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";
import { Btn } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";

export default function PostSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const postType = location.state?.type || "public";

  return (
    <PhoneFrame>
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div className="scale-in" style={{ position: "relative", marginBottom: 32 }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}40 0%, transparent 70%)`, filter: "blur(20px)", animation: "pulse1 2s ease-in-out infinite" }} />
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", color: i % 2 ? C.amber : C.purple, animation: `sparkle 1.2s ease-out ${i * 0.1}s infinite`, transform: `rotate(${i * 72}deg) translateY(-70px)` }}>
              <Ics.Spark size={14} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5, fontFamily: F.body }}>
          {postType === "public" ? "Your voice is live!" : "Request sent!"}
        </div>
        <div style={{ fontSize: 14, color: C.text2, marginBottom: 32, lineHeight: 1.6, maxWidth: 300, fontFamily: F.body }}>
          {postType === "public" ? "Your issue is now visible to everyone in your area. Neighbors can support it with i² to make it louder." : "Your personal request has been routed to your representative's office. You'll be notified of any updates."}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn onClick={() => navigate("/voice")}>Track in My Voice</Btn>
          <Btn variant="secondary" onClick={() => navigate("/feed")}>Back to Home</Btn>
        </div>
      </div>
    </PhoneFrame>
  );
}
