import { useState, useRef } from "react";
import { C, F } from "../constants/theme";
import { Ics } from "./icons";

export const Header = ({ title, onBack, right }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.bg, minHeight: 52 }}>
    {onBack && (
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", marginRight: 12, display: "flex", alignItems: "center", padding: 4 }}>
        <Ics.Back />
      </button>
    )}
    <span style={{ fontSize: 18, fontWeight: 700, flex: 1, fontFamily: F.body }}>{title}</span>
    {right}
  </div>
);

export const Btn = ({ children, onClick, disabled, variant = "primary", style: s = {}, loading = false }) => {
  const isPri = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ width: "100%", padding: "15px", borderRadius: 12, cursor: (disabled || loading) ? "default" : "pointer", background: isPri ? C.gradient : "transparent", color: C.text, border: isPri ? "none" : `1px solid ${C.border}`, fontSize: 15, fontWeight: 700, opacity: (disabled || loading) ? 0.5 : 1, transition: "all 0.2s", fontFamily: F.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...s }}>
      {loading && <Ics.Loader />}
      {children}
    </button>
  );
};

export const Input = ({ label, placeholder, value, onChange, disabled, type = "text", right, error, ...rest }) => (
  <div style={{ marginBottom: 20 }}>
    {label && <label style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>{label}</label>}
    <div className={disabled ? "" : "input-focus-glow"} style={{ display: "flex", alignItems: "center", border: `1px solid ${error ? C.red : C.border}`, borderRadius: 10, overflow: "hidden", background: C.surface2 }}>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} {...rest} style={{ flex: 1, padding: "14px", background: "transparent", border: "none", color: disabled ? C.text2 : C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
      {right && <div style={{ padding: "0 14px", color: C.text2 }}>{right}</div>}
    </div>
    {error && <div style={{ color: C.red, fontSize: 12, marginTop: 4, fontFamily: F.body }}>{error}</div>}
  </div>
);

export const Avatar = ({ name, size = 40, isOfficial = false, src, verified = false }) => {
  const palette = ["#7856FF", "#1D9BF0", "#00BA7C", "#FFB020", "#F04438", "#EC4899", "#14B8A6", "#F59E0B", "#8B5CF6", "#06B6D4"];
  const hash = (name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = palette[hash % palette.length];
  const bgStyle = isOfficial ? `linear-gradient(135deg, ${C.purple}40, ${C.accent}40)` : `linear-gradient(135deg, ${color}55, ${color}25)`;
  const innerSize = verified ? size - 4 : size;
  const inner = (
    <div style={{ width: innerSize, height: innerSize, borderRadius: "50%", background: bgStyle, border: isOfficial ? `2px solid ${C.purple}` : verified ? "none" : `1px solid ${color}60`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", color: isOfficial ? C.purple : C.text }}>
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : isOfficial ? <Ics.Shield /> : <span style={{ fontSize: innerSize * 0.4, fontWeight: 700 }}>{name?.[0]?.toUpperCase() || "?"}</span>}
    </div>
  );
  if (verified) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #7856FF 0%, #1D9BF0 100%)", padding: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {inner}
      </div>
    );
  }
  return <div style={{ width: size, height: size, flexShrink: 0 }}>{inner}</div>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    Open: { color: C.accent, bg: "rgba(29, 155, 240, 0.15)", dot: true },
    Pending: { color: C.amber, bg: "rgba(255, 176, 32, 0.15)", dot: true },
    "In Progress": { color: C.purple, bg: C.purpleDim, dot: true },
    Resolved: { color: C.green, bg: "rgba(0, 186, 124, 0.15)", dot: true, solid: true },
  };
  const s = map[status] || { color: C.text2, bg: "transparent", dot: false };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, animation: (status === "Open" || status === "Pending") ? "blink 1.5s infinite" : "none", boxShadow: s.solid ? `0 0 0 2px ${s.bg}` : "none" }} />}
      {status}
    </span>
  );
};

export const SeverityTag = ({ level, blink = true }) => {
  const map = {
    Critical: { color: C.critical, bg: "rgba(240, 68, 56, 0.12)", label: "Critical" },
    High: { color: C.high, bg: "rgba(255, 176, 32, 0.12)", label: "High" },
    Routine: { color: C.routine, bg: "rgba(142, 142, 153, 0.12)", label: "Routine" },
  };
  const s = map[level] || map.Routine;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {level === "Critical" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, animation: blink ? "blink 1.5s ease-in-out infinite" : "none" }} />}
      {s.label}
    </span>
  );
};

export const I2Button = ({ active, count, onClick }) => {
  const [popping, setPopping] = useState(false);
  const prevCount = useRef(count);

  if (count !== prevCount.current) {
    prevCount.current = count;
    if (!popping) { setPopping(true); setTimeout(() => setPopping(false), 400); }
  }

  const handleClick = (e) => {
    if (navigator.vibrate) navigator.vibrate(12);
    onClick?.(e);
  };
  return (
    <button onClick={handleClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: active ? C.purpleDim : "transparent", border: `1px solid ${active ? C.purple : C.border}`, borderRadius: 20, cursor: "pointer", color: active ? C.purple : C.text2, fontSize: 13, fontWeight: 600, transition: "all 0.2s", fontFamily: F.body }}>
      <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 15, lineHeight: 1, display: "inline-flex", alignItems: "flex-start", letterSpacing: -0.5 }}>
        i<span style={{ fontSize: 9, marginLeft: 0, marginTop: -2, lineHeight: 1 }}>²</span>
      </span>
      <span className={popping ? "count-pop" : ""} style={{ display: "inline-block" }}>{count?.toLocaleString()}</span>
    </button>
  );
};

export const BottomSheet = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 2000, display: "flex", alignItems: "flex-end", animation: "fadeIn 0.2s" }}>
      <div onClick={e => e.stopPropagation()} className="slide-up" style={{ background: C.surface, width: "100%", borderRadius: "20px 20px 0 0", overflow: "hidden", border: `1px solid ${C.border}`, borderBottom: "none", padding: "20px" }}>
        <div style={{ width: 40, height: 4, background: C.surface3, borderRadius: 2, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
};

export const Skeleton = ({ width = "100%", height = 16, style = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius: 8, ...style }} />
);

export const Lightbox = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", cursor: "pointer" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, zIndex: 1, backdropFilter: "blur(10px)" }}>×</button>
      <img src={src} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "95%", maxHeight: "85%", objectFit: "contain", borderRadius: 12, touchAction: "pinch-zoom" }} />
    </div>
  );
};

export const PostCardSkeleton = () => (
  <div style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
    <Skeleton width={40} height={40} style={{ borderRadius: "50%", flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width={60} height={28} style={{ borderRadius: 20 }} />
        <Skeleton width={60} height={28} style={{ borderRadius: 20 }} />
      </div>
    </div>
  </div>
);
