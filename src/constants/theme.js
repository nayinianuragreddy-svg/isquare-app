export const C = {
  bg: "#0A0A0F",
  surface: "#0A0A0F",
  surface2: "#14141B",
  surface3: "#1F1F2A",
  border: "#2A2A38",
  accent: "#1D9BF0",
  accentDim: "rgba(29, 155, 240, 0.15)",
  amber: "#FFB020",
  green: "#00BA7C",
  red: "#F04438",
  purple: "#7856FF",
  purpleDim: "rgba(120, 86, 255, 0.15)",
  text: "#F5F5F7",
  text2: "#8E8E99",
  text3: "#55555F",
  critical: "#F04438",
  high: "#FFB020",
  routine: "#8E8E99",
  gradient: "linear-gradient(135deg, #7856FF 0%, #1D9BF0 100%)",
};

export const F = {
  body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export const STYLES = `
  @keyframes pulse1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes pulse2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes sparkle { 0% { transform: scale(0) rotate(0); opacity: 0; } 50% { transform: scale(1.2) rotate(180deg); opacity: 1; } 100% { transform: scale(0) rotate(360deg); opacity: 0; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes heatPulse { 0%, 100% { box-shadow: 0 0 12px rgba(240,68,56,0.35); } 50% { box-shadow: 0 0 28px rgba(240,68,56,0.6), 0 0 48px rgba(240,68,56,0.2); } }
  @keyframes warmPulse { 0%, 100% { box-shadow: 0 0 10px rgba(255,176,32,0.3); } 50% { box-shadow: 0 0 22px rgba(255,176,32,0.5); } }
  @keyframes risePulse { 0%, 100% { box-shadow: 0 0 8px rgba(120,86,255,0.25); } 50% { box-shadow: 0 0 16px rgba(120,86,255,0.45); } }
  .heat-hot { animation: heatPulse 2s ease-in-out infinite; border-color: rgba(240,68,56,0.4) !important; }
  .heat-warm { animation: warmPulse 2.5s ease-in-out infinite; border-color: rgba(255,176,32,0.4) !important; }
  .heat-rising { animation: risePulse 3s ease-in-out infinite; border-color: rgba(120,86,255,0.4) !important; }
  @keyframes pageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .page-in { animation: pageIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes toastIn { from { transform: translateY(40px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes toastOut { from { transform: translateY(0) scale(1); opacity: 1; } to { transform: translateY(40px) scale(0.9); opacity: 0; } }
  @keyframes shockwave { from { width: 0; height: 0; opacity: 0.8; } to { width: 500px; height: 500px; margin-top: -250px; margin-left: -250px; opacity: 0; } }
  @keyframes glowExpand { from { width: 0; height: 0; } to { width: 400px; height: 400px; margin-top: -200px; margin-left: -200px; } }
  @keyframes logoReveal { from { transform: scale(0) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes floatUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes loadBar { from { width: 0%; } to { width: 100%; } }
  @keyframes gridDraw { from { opacity: 0; } to { opacity: 0.08; } }
  @keyframes navBounce { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .nav-active-icon { animation: navBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes pullSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #050508; overscroll-behavior: none; }
  .skeleton { background: linear-gradient(90deg, #14141B 0%, #1F1F2A 50%, #14141B 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
  .fade-in { animation: fadeIn 0.3s ease-out; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  input, textarea, button { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  ::-webkit-scrollbar { width: 0; }
`;
