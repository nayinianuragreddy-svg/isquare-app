import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { I2Logo } from "../components/icons";
import { Ics } from "../components/icons";
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
    }, 3200);
    return () => clearTimeout(t);
  }, [loading, user, profile]);

  return (
    <PhoneFrame>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "#050508" }}>

        {/* Subtle grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(120,86,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,86,255,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px", animation: "gridDraw 1.5s ease-out forwards" }} />

        {/* Shockwave ring */}
        <div style={{ position: "absolute", top: "50%", left: "50%", borderRadius: "50%", border: "1.5px solid rgba(120,86,255,0.25)", animation: "shockwave 1.8s ease-out 0.3s both" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", borderRadius: "50%", border: "1px solid rgba(29,155,240,0.2)", animation: "shockwave 2s ease-out 0.5s both" }} />

        {/* Central gradient glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}50 0%, ${C.accent}20 40%, transparent 70%)`, filter: "blur(60px)", animation: "glowExpand 1.5s ease-out 0.2s both" }} />

        {/* Particle sparkles */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ position: "absolute", top: "calc(50% - 4px)", left: "calc(50% - 4px)", zIndex: 3, pointerEvents: "none" }}>
            <div style={{ color: i % 3 === 0 ? C.purple : i % 3 === 1 ? C.accent : C.amber, animation: `sparkle 1.4s ease-out ${0.4 + i * 0.06}s both`, transform: `rotate(${i * 45}deg) translateY(-70px)` }}>
              <Ics.Spark size={8 + (i % 4) * 3} />
            </div>
          </div>
        ))}

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 4, animation: "logoReveal 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s both" }}>
          <I2Logo size={100} />
        </div>

        {/* Tagline */}
        <div style={{ position: "relative", zIndex: 4, marginTop: 24, animation: "floatUp 0.6s ease-out 0.9s both" }}>
          <span style={{ fontSize: 13, color: C.text2, letterSpacing: 6, textTransform: "uppercase", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>Your Voice · Your City</span>
        </div>

        {/* Loading bar */}
        <div style={{ position: "absolute", bottom: 100, width: 140, height: 3, background: C.surface3, borderRadius: 2, overflow: "hidden", zIndex: 4, animation: "fadeIn 0.4s ease-out 1.4s both" }}>
          <div style={{ height: "100%", background: C.gradient, borderRadius: 2, animation: "loadBar 2s ease-in-out 1.4s both" }} />
        </div>

        {/* Brand footer */}
        <div style={{ position: "absolute", bottom: 50, zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "floatUp 0.5s ease-out 1.6s both" }}>
          <div style={{ fontSize: 10, color: C.text3, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>IMPACT × IGNITE</div>
        </div>

        {/* Ambient floating dots */}
        {[0,1,2,3,4].map(i => (
          <div key={"dot"+i} style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: i % 2 === 0 ? `${C.purple}60` : `${C.accent}60`, top: `${20 + i * 15}%`, left: `${10 + i * 18}%`, animation: `pulse1 ${2.5 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`, zIndex: 1 }} />
        ))}
      </div>
    </PhoneFrame>
  );
}
