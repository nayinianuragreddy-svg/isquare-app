import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PhoneFrame from "../../components/PhoneFrame";
import { Btn, Header } from "../../components/shared";
import { C, F } from "../../constants/theme";

export default function OTP() {
  const [digits, setDigits] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signIn } = useAuth();
  const phone = location.state?.phone || "+91 XXXXXXXXXX";

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleDigit = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError("");
    if (val && i < 4) refs[i + 1].current?.focus();
    if (next.every(d => d) && val) verify(next.join(""));
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const verify = async (code) => {
    if (code !== "12345") { setError("Incorrect OTP. Try 12345."); return; }
    setLoading(true);
    try {
      await signIn();
      if (profile?.name) {
        navigate("/feed");
      } else {
        navigate("/register", { state: { phone } });
      }
    } catch (e) {
      setError("Could not connect. Check your internet and try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const otp = digits.join("");

  return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/login")} />
      <div style={{ padding: "32px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, fontFamily: F.body }}>Enter OTP</div>
        </div>
        <p style={{ color: C.text2, fontSize: 14, marginBottom: 36, lineHeight: 1.5, fontFamily: F.body }}>
          Sent to <span style={{ color: C.text, fontWeight: 700 }}>{phone}</span>
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              maxLength={1}
              type="tel"
              style={{ width: 52, height: 60, textAlign: "center", fontSize: 24, fontWeight: 800, background: C.surface2, border: `2px solid ${d ? C.purple : error ? C.red : C.border}`, borderRadius: 12, color: C.text, outline: "none", fontFamily: F.body, transition: "border-color 0.2s" }}
            />
          ))}
        </div>

        {error && <div style={{ color: C.red, fontSize: 13, textAlign: "center", marginBottom: 16, fontFamily: F.body }}>{error}</div>}

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ color: C.text2, fontSize: 13, fontFamily: F.body }}>Demo OTP: </span>
          <span style={{ color: C.purple, fontSize: 13, fontWeight: 700, fontFamily: F.body }}>12345</span>
        </div>

        <Btn onClick={() => verify(otp)} disabled={otp.length < 5} loading={loading}>
          Verify
        </Btn>

        <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: C.text2, fontSize: 14, marginTop: 20, cursor: "pointer", fontFamily: F.body }}>
          Resend OTP
        </button>
      </div>
    </PhoneFrame>
  );
}
