import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PhoneFrame from "../../components/PhoneFrame";
import { Btn } from "../../components/shared";
import { I2Logo } from "../../components/icons";
import { C, F } from "../../constants/theme";

export default function Phone() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSend = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      await signIn();
      navigate("/otp", { state: { phone: "+91 " + phone } });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <div style={{ padding: "32px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <I2Logo size={56} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, marginTop: 0, letterSpacing: -0.5, fontFamily: F.body }}>
          Join your city.
        </h1>
        <p style={{ color: C.text2, fontSize: 15, marginBottom: 32, lineHeight: 1.5, fontFamily: F.body }}>
          Enter your WhatsApp number. We'll send a secure OTP to verify it's really you.
        </p>

        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 20, overflow: "hidden", background: C.surface2 }}>
          <div style={{ padding: "15px 16px", borderRight: `1px solid ${C.border}`, color: C.text2, fontSize: 15, background: C.surface3, fontFamily: F.body }}>+91</div>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Phone number"
            type="tel"
            onKeyDown={e => e.key === "Enter" && handleSend()}
            style={{ flex: 1, padding: "15px", background: "none", border: "none", color: C.text, fontSize: 16, outline: "none", fontFamily: F.body }}
          />
        </div>

        <Btn onClick={handleSend} disabled={phone.length < 10} loading={loading}>
          Send OTP
        </Btn>

        <div style={{ textAlign: "center", color: C.text3, fontSize: 12, marginTop: 24, lineHeight: 1.6, fontFamily: F.body }}>
          By continuing, you agree to our<br />
          <span style={{ color: C.text2 }}>Terms</span> and <span style={{ color: C.text2 }}>Privacy Policy</span>
        </div>
      </div>
    </PhoneFrame>
  );
}
