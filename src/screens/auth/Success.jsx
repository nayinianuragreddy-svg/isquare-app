import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PhoneFrame from "../../components/PhoneFrame";
import { Btn } from "../../components/shared";
import { Ics } from "../../components/icons";
import { C, F } from "../../constants/theme";

export default function Success() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <PhoneFrame>
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div className="scale-in" style={{ width: 120, height: 120, borderRadius: "50%", background: C.purpleDim, border: `3px solid ${C.purple}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <Ics.CheckCircle size={60} color={C.purple} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5, fontFamily: F.body }}>
          Welcome, {profile?.name?.split(" ")[0] || "Citizen"}!
        </div>
        <div style={{ fontSize: 15, color: C.text2, marginBottom: 40, lineHeight: 1.6, maxWidth: 280, fontFamily: F.body }}>
          Your i² account is ready. Let's show you how to make your voice count.
        </div>
        <Btn onClick={() => navigate("/tutorial")}>Show me around</Btn>
      </div>
    </PhoneFrame>
  );
}
