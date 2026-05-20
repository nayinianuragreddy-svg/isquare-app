import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../../components/PhoneFrame";
import { Btn, BottomSheet } from "../../components/shared";
import { I2Logo } from "../../components/icons";
import { C, F } from "../../constants/theme";

export default function Phone() {
  const [phone, setPhone] = useState("");
  const [sheet, setSheet] = useState(null);
  const navigate = useNavigate();

  const handleSend = () => {
    if (phone.length < 10) return;
    navigate("/otp", { state: { phone: "+91 " + phone } });
  };

  return (
    <PhoneFrame>
      <div style={{ padding: "32px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <I2Logo size={56} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, marginTop: 0, letterSpacing: -0.5, fontFamily: F.body }}>
          Your city. Your voice.
        </h1>
        <p style={{ color: C.text2, fontSize: 15, marginBottom: 32, lineHeight: 1.5, fontFamily: F.body }}>
          Enter your mobile number to get started. Takes less than a minute.
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

        <Btn onClick={handleSend} disabled={phone.length < 10}>
          Continue
        </Btn>

        <div style={{ textAlign: "center", color: C.text3, fontSize: 12, marginTop: 24, lineHeight: 1.6, fontFamily: F.body }}>
          By continuing, you agree to our{" "}
          <span onClick={() => setSheet("terms")} style={{ color: C.text2, cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>
          {" "}and{" "}
          <span onClick={() => setSheet("privacy")} style={{ color: C.text2, cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
        </div>
      </div>

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)}>
        {sheet === "terms" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", fontFamily: F.body }}>Terms of Service</h3>
            {[
              ["Civic purpose only", "i² is built for residents to raise real civic issues and communicate with elected representatives. Misuse — including spam, fake issues, or harassment — will result in removal."],
              ["Your content", "You own what you post. By submitting, you grant i² a license to display your content within the platform. We will never sell it."],
              ["Accountability", "While anonymous posting hides your identity from other users, platform administrators retain audit access for abuse prevention and legal compliance."],
              ["Changes", "We may update these terms as the platform evolves. Continued use means you accept the updated terms."],
            ].map(([title, text]) => (
              <p key={title} style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>
                <strong style={{ color: C.text }}>{title}: </strong>{text}
              </p>
            ))}
            <div style={{ height: 8 }} />
            <Btn onClick={() => setSheet(null)}>Got it</Btn>
          </>
        )}
        {sheet === "privacy" && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px", fontFamily: F.body }}>Privacy Policy</h3>
            {[
              ["What we collect", "Your phone number (for verification), name, profile photo, and residence area. Nothing more."],
              ["How we use it", "To verify you're a real resident, route your requests to the right representative, and personalise your local feed."],
              ["What we never do", "We never sell your data, share it with advertisers, or expose your identity without your explicit consent."],
              ["Anonymous posts", "When you post anonymously, your identity is invisible to all other users. Only internal administrators can see it for abuse prevention."],
              ["Data security", "All data is stored on encrypted servers with strict access controls. We use Supabase infrastructure with AES-256 encryption at rest."],
            ].map(([title, text]) => (
              <p key={title} style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", fontFamily: F.body }}>
                <strong style={{ color: C.text }}>{title}: </strong>{text}
              </p>
            ))}
            <div style={{ height: 8 }} />
            <Btn onClick={() => setSheet(null)}>Got it</Btn>
          </>
        )}
      </BottomSheet>
    </PhoneFrame>
  );
}
