import { C, STYLES } from "../constants/theme";

export default function PhoneFrame({ children }) {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at top, rgba(120, 86, 255, 0.08) 0%, #050508 50%)", fontFamily: "system-ui, sans-serif", color: C.text, padding: 0 }}>
      <style>{`
        ${STYLES}
        .i2-frame-wrapper { padding: 20px; }
        .i2-frame { width: 390px; height: 844px; border-radius: 48px; border: 1px solid ${C.border}; box-shadow: 0 0 100px rgba(120, 86, 255, 0.15), 0 20px 60px rgba(0,0,0,0.8); }
        @media (max-width: 430px) {
          .i2-frame-wrapper { padding: 0; }
          .i2-frame { width: 100vw !important; height: 100vh !important; border-radius: 0 !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="i2-frame-wrapper">
        <div className="i2-frame" style={{ background: C.bg, overflow: "hidden", position: "relative" }}>
          {/* Status Bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: C.bg }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="4" width="3" height="7" fill={C.text} rx="1" /><rect x="4.5" y="3" width="3" height="8" fill={C.text} rx="1" /><rect x="9" y="1" width="3" height="10" fill={C.text} rx="1" /><rect x="13.5" y="0" width="3" height="11" fill={C.text} rx="1" /></svg>
              <svg width="16" height="11" viewBox="0 0 24 16" fill="none" stroke={C.text} strokeWidth="2"><path d="M1 8C3 5 7 3 12 3s9 2 11 5M4 11c1.5-1.5 4.5-3 8-3s6.5 1.5 8 3M8 14c1-1 2.5-2 4-2s3 1 4 2" /><circle cx="12" cy="16" r="1.5" fill={C.text} stroke="none" /></svg>
              <div style={{ width: 24, height: 12, border: `1.5px solid ${C.text}`, borderRadius: 3, padding: "1.5px", display: "flex", alignItems: "center" }}>
                <div style={{ width: "80%", height: "100%", background: C.text, borderRadius: 1 }} />
              </div>
            </div>
          </div>
          {/* Content */}
          <div style={{ position: "absolute", inset: 0, paddingTop: 44, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
