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
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #050508; }
  .skeleton { background: linear-gradient(90deg, #14141B 0%, #1F1F2A 50%, #14141B 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
  .fade-in { animation: fadeIn 0.3s ease-out; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  input, textarea, button { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  ::-webkit-scrollbar { width: 0; }
`;
