import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";
import { Btn } from "../components/shared";
import { Ics, I2Logo } from "../components/icons";
import { C, F } from "../constants/theme";

const slides = [
  { Icon: () => <Ics.SpeakUp a={true} />, t: "Speak Up", d: "See something wrong in your area? Raise it publicly. Your neighbors can support it, making it louder for officials to hear." },
  { Icon: () => <Ics.Rep a={true} />, t: "Personal Request", d: "Need private help with a government matter? Send a direct request to your MLA, MP, or Corporator. Track every response." },
  { Icon: I2Logo, t: "Two i's, one voice", d: "When citizens stand together, their voice squares. Support others with i², and watch real change happen in your city." },
];

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const s = slides[step];

  return (
    <PhoneFrame>
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", fontFamily: F.body, color: C.text }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => navigate("/feed")} style={{ background: "none", border: "none", color: C.text2, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Skip</button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }} className="scale-in" key={step}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, color: C.purple, border: `2px solid ${C.purple}40` }}>
            <s.Icon />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, marginTop: 0 }}>{s.t}</h2>
          <p style={{ color: C.text2, fontSize: 16, lineHeight: 1.6, maxWidth: 300, margin: 0 }}>{s.d}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, background: i === step ? C.purple : C.surface3, transition: "width 0.3s" }} />
          ))}
        </div>

        <Btn onClick={() => step < slides.length - 1 ? setStep(step + 1) : navigate("/feed")}>
          {step < slides.length - 1 ? "Next" : "Let's Go"}
        </Btn>
      </div>
    </PhoneFrame>
  );
}
