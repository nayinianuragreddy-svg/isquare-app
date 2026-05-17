import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { I2Logo } from "../components/icons";
import { C } from "../constants/theme";

export default function Splash() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (user && profile?.name) navigate("/feed");
      else if (user && !profile?.name) navigate("/register");
      else navigate("/login");
    }, 2400);
    return () => clearTimeout(t);
  }, [loading, user, profile]);

  return (
    <PhoneFrame>
      <div onClick={() => navigate(user && profile?.name ? "/feed" : "/login")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative", cursor: "pointer" }}>
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}30 0%, transparent 70%)`, filter: "blur(20px)", animation: "pulse1 3s ease-in-out infinite" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <I2Logo size={90} animated />
        </div>
        <div style={{ fontSize: 13, color: C.text2, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600, animation: "fadeIn 1s ease-out 0.6s both" }}>
          Your Voice · Your City
        </div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 11, color: C.text3, letterSpacing: 2, animation: "fadeIn 1s ease-out 1.2s both" }}>
          IMPACT × IGNITE
        </div>
      </div>
    </PhoneFrame>
  );
}
