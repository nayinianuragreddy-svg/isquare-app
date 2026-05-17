import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
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
const F = {
  body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ics = {
  Back: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Close: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Badge: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={C.accent}>
      <path d="M12 2l3.09 2.26L18.8 3.4l.53 3.77 3.27 1.94-1.6 3.46 1.6 3.46-3.27 1.94-.53 3.77-3.71-.86L12 22l-3.09-2.26-3.71.86-.53-3.77-3.27-1.94 1.6-3.46-1.6-3.46 3.27-1.94.53-3.77 3.71.86z" />
      <path
        d="M9 12l2 2 4-4"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Pin: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Camera: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Comment: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  Share: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Globe: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Moon: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Info: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  File: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Warning: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.amber}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ChevDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  More: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  User: ({ size = 40 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  SpeakUp: ({ a }) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={a ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 11l18-8-8 18-2-8-8-2z" />
    </svg>
  ),
  Rep: ({ a }) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={a ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
    </svg>
  ),
  Voice: ({ a }) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={a ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Spark: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
    </svg>
  ),
  CheckCircle: ({ size = 48, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || C.purple}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  TrendUp: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Send: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Alert: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  Flame: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  ),
  Hourglass: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 2h12M6 22h12M6 2v6a6 6 0 0012 0V2M6 22v-6a6 6 0 0112 0v6" />
    </svg>
  ),
};

// ─── i² LOGO COMPONENT ───────────────────────────────────────────────────────
const I2Logo = ({ size = 48, animated = false }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "baseline",
      gap: 0,
      position: "relative",
    }}
  >
    <span
      style={{
        fontSize: size,
        fontWeight: 900,
        letterSpacing: -size * 0.05,
        background: C.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        animation: animated ? "pulse1 2s ease-in-out infinite" : "none",
      }}
    >
      i
    </span>
    <span
      style={{
        fontSize: size * 0.55,
        fontWeight: 900,
        background: C.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        marginLeft: -size * 0.05,
        marginBottom: size * 0.3,
        animation: animated ? "pulse2 2s ease-in-out infinite 0.3s" : "none",
      }}
    >
      ²
    </span>
  </div>
);

// ─── i² REACTION BUTTON ──────────────────────────────────────────────────────
const I2Button = ({ active, count, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 12px",
      background: active ? C.purpleDim : "transparent",
      border: `1px solid ${active ? C.purple : C.border}`,
      borderRadius: 20,
      cursor: "pointer",
      color: active ? C.purple : C.text2,
      fontSize: 13,
      fontWeight: 600,
      transition: "all 0.2s",
      fontFamily: F.body,
    }}
  >
    <span
      style={{
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontWeight: 900,
        fontSize: 15,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "flex-start",
        letterSpacing: -0.5,
      }}
    >
      i
      <span
        style={{ fontSize: 9, marginLeft: 0, marginTop: -2, lineHeight: 1 }}
      >
        ²
      </span>
    </span>
    <span>{count}</span>
  </button>
);

// ─── SEVERITY TAG ────────────────────────────────────────────────────────────
const SeverityTag = ({ level, blink = true }) => {
  const map = {
    Critical: {
      color: C.critical,
      bg: "rgba(240, 68, 56, 0.12)",
      label: "Critical",
    },
    High: { color: C.high, bg: "rgba(255, 176, 32, 0.12)", label: "High" },
    Routine: {
      color: C.routine,
      bg: "rgba(142, 142, 153, 0.12)",
      label: "Routine",
    },
  };
  const s = map[level] || map.Routine;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {level === "Critical" && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.color,
            animation: blink ? "blink 1.5s ease-in-out infinite" : "none",
          }}
        />
      )}
      {s.label}
    </span>
  );
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const POSTS = [
  {
    id: "PD456801",
    locId: "resident",
    cat: "Water",
    severity: "Critical",
    date: "2h ago",
    fullDate: "22/04/2026",
    desc: "Severe water shortage in Block C due to pipeline burst. We haven't had supply for 48 hours. Over 200 families affected. Request urgent attention.",
    status: "Open",
    agree: 2437,
    comments: 340,
    type: "Public",
    author: "Priya Reddy",
    handle: "priya_reddy",
    verified: true,
    img: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80",
    distance: "0.4 km",
  },
  {
    id: "PD456802",
    locId: "resident",
    cat: "Road",
    severity: "High",
    date: "5h ago",
    fullDate: "22/04/2026",
    desc: "Massive pothole near Saraswathi Colony bus stop has caused three two-wheeler accidents this week. Needs immediate repair before someone is seriously hurt.",
    status: "Pending",
    agree: 1524,
    comments: 186,
    type: "Public",
    author: "Ramesh Kumar",
    handle: "ramesh_k",
    verified: true,
    img: "https://images.unsplash.com/photo-1574045559400-3306dbfa48eb?auto=format&fit=crop&w=600&q=80",
    distance: "0.8 km",
  },
  {
    id: "PD456803",
    locId: "resident",
    cat: "Electricity",
    severity: "High",
    date: "1d ago",
    fullDate: "21/04/2026",
    desc: "Transformer near 3rd cross has been sparking dangerously for two days. Could cause fire. Power fluctuations have damaged appliances in several homes.",
    status: "Pending",
    agree: 892,
    comments: 124,
    type: "Public",
    author: "Aditya Sharma",
    handle: "aditya_s",
    verified: true,
    distance: "1.2 km",
  },
  {
    id: "PD456804",
    locId: "resident",
    cat: "Sanitation",
    severity: "Routine",
    date: "2d ago",
    fullDate: "20/04/2026",
    desc: "Garbage hasn't been collected in our lane for four days. Stray dogs scattering waste across the street. Public health concern.",
    status: "Open",
    agree: 456,
    comments: 72,
    type: "Public",
    author: "Anonymous",
    handle: "anonymous",
    verified: false,
    distance: "0.6 km",
  },
  {
    id: "PD456805",
    locId: "current",
    cat: "Infrastructure",
    severity: "High",
    date: "3h ago",
    fullDate: "22/04/2026",
    desc: "Footpath completely blocked by construction debris near Metro Pillar 42. Pedestrians forced onto the main road, multiple near-accidents.",
    status: "Open",
    agree: 1847,
    comments: 203,
    type: "Public",
    author: "Vikram Singh",
    handle: "vik_ram",
    verified: true,
    img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    distance: "0.3 km",
  },
  {
    id: "PD456806",
    locId: "current",
    cat: "Traffic",
    severity: "Routine",
    date: "6h ago",
    fullDate: "22/04/2026",
    desc: "Traffic signal at Main Road junction has been malfunctioning for the past week. Needs recalibration during peak hours.",
    status: "Open",
    agree: 634,
    comments: 48,
    type: "Public",
    author: "Neha Joshi",
    handle: "neha_j",
    verified: true,
    distance: "1.5 km",
  },
];

const REP_POSTS = [
  {
    id: "RP78901",
    locId: "resident",
    cat: "Poll",
    date: "1d ago",
    fullDate: "21/04/2026",
    desc: "Should we convert the unused municipal land on 5th Cross into a community park with children's play area, or a multi-purpose sports ground for youth?",
    options: [
      { label: "Community Park", pct: 62 },
      { label: "Sports Ground", pct: 38 },
    ],
    totalVotes: 1520,
    author: "Rajesh Nayak",
    role: "MLA, Uppal Constituency",
    official: true,
    userVoted: null,
  },
  {
    id: "RP78902",
    locId: "resident",
    cat: "Update",
    date: "2d ago",
    fullDate: "20/04/2026",
    desc: "Road widening work on Main Street approved in today's council meeting. Work begins next month. Tenders floated. Estimated completion: 4 months.",
    author: "Suresh Kumar",
    role: "Corporator, Ward 12",
    official: true,
    type: "update",
  },
  {
    id: "RP78903",
    locId: "current",
    cat: "Poll",
    date: "3d ago",
    fullDate: "19/04/2026",
    desc: "Proposal to implement rainwater harvesting system in all community buildings. Estimated cost: ₹12 lakh. Your support?",
    options: [
      { label: "Yes, proceed", pct: 87 },
      { label: "Need more info", pct: 13 },
    ],
    totalVotes: 3450,
    author: "Anita Desai",
    role: "MLA, Andheri East",
    official: true,
    userVoted: null,
  },
];

const MY_VOICE_PUBLIC = [
  {
    id: "PD456756",
    cat: "Electricity",
    severity: "High",
    date: "2h ago",
    fullDate: "22/04/2026",
    desc: "Street light on our lane has been out for a week. Makes it unsafe for women returning home after dark. Requesting urgent repair.",
    status: "Open",
    agree: 47,
    comments: 12,
    type: "Public",
    verified: true,
    img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "PD456757",
    cat: "Road",
    severity: "Routine",
    date: "3d ago",
    fullDate: "19/04/2026",
    desc: "Potholes near the children's park need to be filled before monsoon arrives.",
    status: "In Progress",
    agree: 128,
    comments: 23,
    type: "Public",
    verified: true,
    img: "https://images.unsplash.com/photo-1574045559400-3306dbfa48eb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "PD456758",
    cat: "Sanitation",
    severity: "High",
    date: "2w ago",
    fullDate: "08/04/2026",
    desc: "Blocked drain causing waterlogging every time it rains. Residents suffering for months.",
    status: "Resolved",
    agree: 284,
    comments: 54,
    type: "Public",
    verified: true,
  },
];

const MY_VOICE_PRIVATE = [
  {
    id: "PR90012",
    cat: "Property",
    severity: "Routine",
    date: "1d ago",
    fullDate: "21/04/2026",
    desc: "Requesting clarification on property tax assessment for FY 2025-26. Amount seems significantly higher than previous year.",
    status: "Pending",
    type: "Private",
    verified: true,
    routedTo: "Corporator, Ward 12",
  },
  {
    id: "PR90013",
    cat: "Documentation",
    severity: "Routine",
    date: "4d ago",
    fullDate: "18/04/2026",
    desc: "Birth certificate correction request. Name spelling error in original certificate needs to be rectified.",
    status: "In Progress",
    type: "Private",
    verified: true,
    routedTo: "MLA Office, Uppal",
  },
  {
    id: "PR90014",
    cat: "Welfare",
    severity: "High",
    date: "1w ago",
    fullDate: "15/04/2026",
    desc: "Assistance required for widow pension application. Documentation complete but no response for 2 months.",
    status: "Resolved",
    type: "Private",
    verified: true,
    routedTo: "MLA Office, Uppal",
  },
];

const THREAD_COMMENTS = [
  {
    user: "Sarah M",
    handle: "sarah_m",
    time: "1h ago",
    text: "Same issue in our block too. Water tanker services are charging ₹500 per trip. This is unacceptable.",
    official: false,
  },
  {
    user: "James K",
    handle: "james_k",
    time: "45 min ago",
    text: "I appreciate the quick escalation. Our society was without water for 3 days last month. Hoping this gets resolved fast.",
    official: false,
  },
  {
    user: "Corporator, Ward 12",
    handle: "corp_ward12",
    time: "25 min ago",
    text: "Issue escalated to HMWSSB. Emergency repair team dispatched. Expected restoration within 6 hours. Will update here.",
    official: true,
    badge: "Official Response",
  },
  {
    user: "Michael T",
    handle: "michael_t",
    time: "10 min ago",
    text: "Thank you for the quick response. This is what democracy in action looks like.",
    official: false,
  },
];

const LOCATIONS = [
  {
    id: "saraswathi",
    name: "Saraswathi Colony",
    full: "Saraswathi Colony, Uppal, Hyderabad",
  },
  {
    id: "quthbullapur",
    name: "Quthbullapur",
    full: "Quthbullapur, Hyderabad, Telangana",
  },
  {
    id: "medchal",
    name: "Medchal Malkajgiri",
    full: "Medchal Malkajgiri, Telangana",
  },
];

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const styles = `
  @keyframes pulse1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes pulse2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes sparkle { 0% { transform: scale(0) rotate(0); opacity: 0; } 50% { transform: scale(1.2) rotate(180deg); opacity: 1; } 100% { transform: scale(0) rotate(360deg); opacity: 0; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .skeleton { background: linear-gradient(90deg, ${C.surface2} 0%, ${C.surface3} 50%, ${C.surface2} 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .slide-up { animation: slideUp 0.4s ease-out; }
  .fade-in { animation: fadeIn 0.3s ease-out; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const PhoneFrame = ({ children }) => (
  <div
    style={{
      width: "100vw",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(ellipse at top, rgba(120, 86, 255, 0.08) 0%, #050508 50%)",
      fontFamily: F.body,
      color: C.text,
      padding: 0,
    }}
  >
    <style>{`
      ${styles}
      .i2-frame-wrapper { padding: 20px; }
      .i2-frame { width: 390px; height: 844px; border-radius: 48px; border: 1px solid ${C.border}; box-shadow: 0 0 100px rgba(120, 86, 255, 0.15), 0 20px 60px rgba(0,0,0,0.8); }
      @media (max-width: 430px) {
        .i2-frame-wrapper { padding: 0; }
        .i2-frame { width: 100vw !important; height: 100vh !important; border-radius: 0 !important; border: none !important; box-shadow: none !important; }
      }
    `}</style>
    <div className="i2-frame-wrapper">
      <div
        className="i2-frame"
        style={{ background: C.bg, overflow: "hidden", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: C.bg,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="16" height="11" viewBox="0 0 16 11">
              <rect x="0" y="4" width="3" height="7" fill={C.text} rx="1" />
              <rect x="4.5" y="3" width="3" height="8" fill={C.text} rx="1" />
              <rect x="9" y="1" width="3" height="10" fill={C.text} rx="1" />
              <rect x="13.5" y="0" width="3" height="11" fill={C.text} rx="1" />
            </svg>
            <svg
              width="16"
              height="11"
              viewBox="0 0 24 16"
              fill="none"
              stroke={C.text}
              strokeWidth="2"
            >
              <path d="M1 8C3 5 7 3 12 3s9 2 11 5M4 11c1.5-1.5 4.5-3 8-3s6.5 1.5 8 3M8 14c1-1 2.5-2 4-2s3 1 4 2" />
              <circle cx="12" cy="16" r="1.5" fill={C.text} stroke="none" />
            </svg>
            <div
              style={{
                width: 24,
                height: 12,
                border: `1.5px solid ${C.text}`,
                borderRadius: 3,
                padding: "1.5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "80%",
                  height: "100%",
                  background: C.text,
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: 44,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  </div>
);

const Header = ({ title, onBack, right }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0,
      background: C.bg,
      minHeight: 52,
    }}
  >
    {onBack && (
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: C.text,
          cursor: "pointer",
          marginRight: 12,
          display: "flex",
          alignItems: "center",
          padding: 4,
        }}
      >
        <Ics.Back />
      </button>
    )}
    <span style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{title}</span>
    {right}
  </div>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  style: s = {},
}) => {
  const isPri = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "15px",
        borderRadius: 12,
        cursor: disabled ? "default" : "pointer",
        background: isPri ? C.gradient : "transparent",
        color: C.text,
        border: isPri ? "none" : `1px solid ${C.border}`,
        fontSize: 15,
        fontWeight: 700,
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
        fontFamily: F.body,
        ...s,
      }}
    >
      {children}
    </button>
  );
};

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  type = "text",
  right,
  error,
}) => (
  <div style={{ marginBottom: 20 }}>
    {label && (
      <label
        style={{
          display: "block",
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
    )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${error ? C.red : C.border}`,
        borderRadius: 10,
        overflow: "hidden",
        background: C.surface2,
      }}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          flex: 1,
          padding: "14px",
          background: "transparent",
          border: "none",
          color: disabled ? C.text2 : C.text,
          fontSize: 14,
          outline: "none",
          fontFamily: F.body,
        }}
      />
      {right && (
        <div style={{ padding: "0 14px", color: C.text2 }}>{right}</div>
      )}
    </div>
    {error && (
      <div style={{ color: C.red, fontSize: 12, marginTop: 4 }}>{error}</div>
    )}
  </div>
);

const FileChip = ({ name, onRemove }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      marginTop: 8,
      background: C.surface2,
    }}
  >
    <span style={{ color: C.text2, fontSize: 14 }}>{name}</span>
    <button
      onClick={onRemove}
      style={{
        background: "none",
        border: "none",
        color: C.text2,
        cursor: "pointer",
        display: "flex",
      }}
    >
      <Ics.Close />
    </button>
  </div>
);

const FileUpload = ({ label, fileName }) => (
  <div style={{ marginBottom: 8 }}>
    {label && (
      <label
        style={{
          display: "block",
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
    )}
    <div style={{ display: "flex", gap: 8 }}>
      <div
        style={{
          flex: 1,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px",
          color: C.text2,
          fontSize: 14,
          background: C.surface2,
        }}
      >
        No File Chosen
      </div>
      <button
        style={{
          background: C.gradient,
          color: C.text,
          padding: "0 20px",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Choose file
      </button>
    </div>
    {fileName && <FileChip name={fileName} />}
  </div>
);

const Avatar = ({ name, size = 40, isOfficial = false }) => {
  // Deterministic color from name, so two Priyas don't look identical
  const palette = [
    "#7856FF",
    "#1D9BF0",
    "#00BA7C",
    "#FFB020",
    "#F04438",
    "#EC4899",
    "#14B8A6",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
  ];
  const hash = (name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = palette[hash % palette.length];
  const bgStyle = isOfficial
    ? `linear-gradient(135deg, ${C.purple}40, ${C.accent}40)`
    : `linear-gradient(135deg, ${color}55, ${color}25)`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgStyle,
        border: isOfficial ? `2px solid ${C.purple}` : `1px solid ${color}60`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        color: isOfficial ? C.purple : C.text,
      }}
    >
      {isOfficial ? (
        <Ics.Shield />
      ) : (
        <span style={{ fontSize: size * 0.4, fontWeight: 700 }}>
          {name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Open: { color: C.accent, bg: "rgba(29, 155, 240, 0.15)", dot: true },
    Pending: { color: C.amber, bg: "rgba(255, 176, 32, 0.15)", dot: true },
    "In Progress": { color: C.purple, bg: C.purpleDim, dot: true },
    Resolved: {
      color: C.green,
      bg: "rgba(0, 186, 124, 0.15)",
      dot: true,
      solid: true,
    },
  };
  const s = map[status] || { color: C.text2, bg: "transparent", dot: false };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {s.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.color,
            animation:
              status === "Open" || status === "Pending"
                ? "blink 1.5s infinite"
                : "none",
            boxShadow: s.solid ? `0 0 0 2px ${s.bg}` : "none",
          }}
        />
      )}
      {status}
    </span>
  );
};

const PostCard = ({
  p,
  onClick,
  onSupport,
  onComment,
  onShare,
  supported,
  blinkCritical = true,
}) => {
  const [sparks, setSparks] = useState(false);
  const handleSupport = (e) => {
    e.stopPropagation();
    onSupport && onSupport(p.id);
    if (!supported) {
      setSparks(true);
      setTimeout(() => setSparks(false), 600);
    }
  };
  const handleComment = (e) => {
    e.stopPropagation();
    onComment && onComment(p);
  };
  const handleShare = async (e) => {
    e.stopPropagation();
    onShare && onShare(p);
  };
  return (
    <article
      onClick={onClick}
      style={{
        padding: "16px",
        borderBottom: `1px solid ${C.border}`,
        cursor: "pointer",
        display: "flex",
        gap: 12,
        position: "relative",
      }}
    >
      <Avatar name={p.author} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>{p.author}</span>
            {p.verified && <Ics.Badge />}
            <span style={{ color: C.text2, fontSize: 13 }}>· {p.date}</span>
          </div>
        </div>
        <div
          style={{
            color: C.text2,
            fontSize: 12,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ics.Pin />{" "}
          <span>
            {p.distance} · @{p.handle}
          </span>
        </div>

        <div
          style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}
        >
          <SeverityTag level={p.severity} blink={blinkCritical} />
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              background: C.surface3,
              color: C.text2,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {p.cat}
          </span>
          <StatusBadge status={p.status} />
        </div>

        <p
          style={{
            margin: "0 0 12px",
            fontSize: 15,
            lineHeight: 1.5,
            color: C.text,
          }}
        >
          {p.desc}
        </p>

        {p.img && (
          <div
            style={{
              width: "100%",
              height: 200,
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 12,
              border: `1px solid ${C.border}`,
              position: "relative",
            }}
          >
            <img
              src={p.img}
              alt={`Issue: ${(p.desc || "").slice(0, 60)}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <div style={{ position: "relative" }}>
            <I2Button
              active={supported}
              count={p.agree + (supported ? 1 : 0)}
              onClick={handleSupport}
            />
            {sparks &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 12 + i * 8,
                    pointerEvents: "none",
                    color: i === 0 ? C.purple : i === 1 ? C.accent : C.amber,
                    animation: `sparkle 0.6s ease-out ${i * 0.1}s forwards`,
                  }}
                >
                  <Ics.Spark size={10 + i * 2} />
                </div>
              ))}
          </div>
          <button
            onClick={handleComment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "6px 12px",
              color: C.text2,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: F.body,
              fontWeight: 600,
            }}
          >
            <Ics.Comment />
            {p.comments}
          </button>
          <button
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "6px 10px",
              color: C.text2,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: F.body,
            }}
          >
            <Ics.Share />
          </button>
        </div>
      </div>
    </article>
  );
};

const RepCard = ({ p, votedIdx, onVote }) => {
  const isPoll = p.cat === "Poll";
  const voted = typeof votedIdx === "number" ? votedIdx : null;
  const handleVote = (idx) => {
    if (voted !== null) return;
    onVote && onVote(p.id, idx);
  };
  // Compute displayed percentages that always total 100 after a vote
  // We add 1% to the chosen option and redistribute -1% proportionally across others
  const computedPcts = (() => {
    if (!isPoll || voted === null)
      return p.options ? p.options.map((o) => o.pct) : [];
    const base = p.options.map((o) => o.pct);
    // Add 1 to voted, subtract from the largest non-voted that has room
    const others = base.map((_, i) => i).filter((i) => i !== voted);
    const donor = others.reduce((a, b) => (base[a] >= base[b] ? a : b));
    const out = [...base];
    out[voted] = Math.min(100, base[voted] + 1);
    out[donor] = Math.max(0, base[donor] - 1);
    return out;
  })();
  return (
    <article
      style={{
        padding: "16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        gap: 12,
        background: `linear-gradient(180deg, ${C.purpleDim} 0%, transparent 80px)`,
      }}
    >
      <Avatar name={p.author} isOfficial={true} size={44} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.purple }}>
                {p.author}
              </span>
              <Ics.Badge />
            </div>
            <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>
              {p.role}
            </div>
          </div>
          <span style={{ fontSize: 12, color: C.text2 }}>{p.date}</span>
        </div>
        <div
          style={{ display: "flex", gap: 6, marginBottom: 10, marginTop: 8 }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              background: isPoll ? C.purpleDim : "rgba(29, 155, 240, 0.15)",
              color: isPoll ? C.purple : C.accent,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            {isPoll ? "ACTIVE POLL" : "OFFICIAL UPDATE"}
          </span>
        </div>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 15,
            lineHeight: 1.5,
            color: C.text,
          }}
        >
          {p.desc}
        </p>

        {isPoll &&
          p.options.map((opt, i) => {
            const displayPct = computedPcts[i];
            const isSelected = voted === i;
            return (
              <div
                key={i}
                onClick={() => handleVote(i)}
                style={{
                  marginBottom: 10,
                  cursor: voted === null ? "pointer" : "default",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    border: `1px solid ${isSelected ? C.purple : C.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    background:
                      voted !== null
                        ? `linear-gradient(90deg, ${
                            isSelected ? C.purpleDim : C.surface2
                          } ${displayPct}%, transparent ${displayPct}%)`
                        : C.surface2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? C.purple : C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: C.purple,
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {voted !== null && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isSelected ? C.purple : C.text2,
                      }}
                    >
                      {displayPct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        {isPoll && (
          <div style={{ color: C.text2, fontSize: 12, marginTop: 6 }}>
            {(p.totalVotes + (voted !== null ? 1 : 0)).toLocaleString()} votes
            {voted !== null && " · ✓ You voted"}
          </div>
        )}
      </div>
    </article>
  );
};

// ─── TUTORIAL COMPONENT ───────────────────────────────────────────────────────
function TutorialSlides({ slides, onDone }) {
  const [step, setStep] = useState(0);
  const s = slides[step];
  return (
    <PhoneFrame>
      <div
        style={{
          padding: "24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          fontFamily: F.body,
          color: C.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onDone}
            style={{
              background: "none",
              border: "none",
              color: C.text2,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
          className="scale-in"
          key={step}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: C.purpleDim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              color: C.purple,
              border: `2px solid ${C.purple}40`,
            }}
          >
            <s.Icon />
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            {s.t}
          </h2>
          <p
            style={{
              color: C.text2,
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 300,
              margin: 0,
            }}
          >
            {s.d}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? C.purple : C.surface3,
                transition: "width 0.3s",
              }}
            />
          ))}
        </div>
        <Btn
          onClick={() =>
            step < slides.length - 1 ? setStep(step + 1) : onDone()
          }
        >
          {step < slides.length - 1 ? "Next" : "Let's Go"}
        </Btn>
      </div>
    </PhoneFrame>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ISquareApp() {
  const [screen, setScreen] = useState("splash");
  const [feedTab, setFeedTab] = useState("speakup");
  const [nav, setNav] = useState("feed");

  const [regData, setRegData] = useState({
    phone: "+91 9876543219",
    name: "",
    username: "",
    gender: "",
    dob: { dd: "", mm: "", yyyy: "" },
    residence: "Saraswathi Colony",
    age: "18 or older",
  });
  const [usernameStatus, setUsernameStatus] = useState("");
  const [locDropdown, setLocDropdown] = useState(false);
  const [activeLocId, setActiveLocId] = useState("resident");
  const [activeLoc, setActiveLoc] = useState(LOCATIONS[0]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postType, setPostType] = useState("public");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState("Public");
  const [voiceStatusFilter, setVoiceStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Critical");
  const [newPostData, setNewPostData] = useState({
    desc: "",
    cat: "Select Category",
    area: "",
    subject: "",
  });
  const [newPostCreated, setNewPostCreated] = useState(null);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  // Persistent support tracking across feed and post detail
  const [supportedPosts, setSupportedPosts] = useState({});
  // Persistent poll votes across navigation
  const [pollVotes, setPollVotes] = useState({});
  // Reply input on post detail
  const [replyText, setReplyText] = useState("");
  const [liveComments, setLiveComments] = useState([]);
  // Anonymous toggle on create form
  const [anonymous, setAnonymous] = useState(false);
  // Send-to selection on personal request
  const [sendTo, setSendTo] = useState("MLA");
  // Confirm discard on back from create form
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // Notifications screen
  const [notifOpen, setNotifOpen] = useState(false);
  // Profile settings actions
  const [settingsSheet, setSettingsSheet] = useState(null); // "about" | "terms" | "security" | "delete" | null
  const [darkTheme, setDarkTheme] = useState(true);
  // Post detail overflow menu
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  // Avatar upload feedback
  const [avatarPicked, setAvatarPicked] = useState(false);

  const handleUsername = (e) => {
    const val = e.target.value;
    setRegData({ ...regData, username: val });
    if (val.length < 3) setUsernameStatus("");
    else if (val.toLowerCase() === "admin") setUsernameStatus("taken");
    else setUsernameStatus("available");
  };

  // Splash auto-advance. Works reliably in Strict Mode (double-effect) sandboxes
  // because we recreate the timer if unmounted, and only fire when still on splash.
  useEffect(() => {
    if (screen !== "splash") return;
    const t = setTimeout(() => {
      setScreen((prev) => (prev === "splash" ? "phone" : prev));
    }, 2400);
    return () => clearTimeout(t);
  }, [screen]);

  const go = (s) => setScreen(s);
  const goFeed = () => {
    setNav("feed");
    setFeedTab("speakup");
    go("feed");
  };

  // Sort posts by severity first, then engagement
  const sortPosts = (posts) => {
    const arr = [...posts];
    if (sortBy === "Critical") {
      const weight = { Critical: 3, High: 2, Routine: 1 };
      arr.sort(
        (a, b) =>
          (weight[b.severity] || 0) - (weight[a.severity] || 0) ||
          b.agree - a.agree
      );
    } else if (sortBy === "Trending") {
      arr.sort((a, b) => b.agree - a.agree);
    } else if (sortBy === "Recent") {
      // already in recent order
    } else if (sortBy === "Unresolved") {
      arr.sort(
        (a, b) =>
          (a.status === "Resolved" ? 1 : 0) - (b.status === "Resolved" ? 1 : 0)
      );
    }
    return arr;
  };

  const allPosts = [...POSTS];
  if (newPostCreated) allPosts.unshift(newPostCreated);

  const filteredPosts = sortPosts(
    allPosts
      .filter((p) => p.locId === activeLocId)
      .filter((p) => {
        if (searchQuery === "") return true;
        const q = searchQuery.toLowerCase();
        return (
          p.desc.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          (p.author || "").toLowerCase().includes(q) ||
          (p.handle || "").toLowerCase().includes(q)
        );
      })
  );
  const filteredReps = REP_POSTS.filter((f) => f.locId === activeLocId);

  const myVoicePosts =
    voiceFilter === "Public" ? MY_VOICE_PUBLIC : MY_VOICE_PRIVATE;
  const filteredMyVoice = myVoicePosts.filter(
    (t) => voiceStatusFilter === "All" || t.status === voiceStatusFilter
  );

  // Shared action handlers
  const toggleSupport = (postId) => {
    setSupportedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };
  const openComments = (post) => {
    setSelectedPost(post);
    go("post");
  };
  const sharePost = async (post) => {
    const shareText = `i² · ${post.cat} issue in ${
      activeLoc.name
    }: ${post.desc.slice(0, 120)}...`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "i² — Your Voice, Your City",
          text: shareText,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      // User dismissed share sheet, do nothing
    }
  };
  const castVote = (pollId, idx) => {
    setPollVotes((prev) => ({ ...prev, [pollId]: idx }));
  };
  const submitReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    setLiveComments((prev) => [
      ...prev,
      {
        postId: selectedPost.id,
        user: regData.name || "You",
        handle: regData.username || "you",
        time: "just now",
        text: replyText.trim(),
        official: false,
      },
    ]);
    setReplyText("");
  };
  const goBackFromCreate = () => {
    if (newPostData.desc.trim() || newPostData.area.trim()) {
      setConfirmDiscard(true);
    } else {
      goFeed();
    }
  };

  // Area stats, derived from the actual filtered dataset
  const areaStats = {
    open: filteredPosts.filter(
      (p) => p.status === "Open" || p.status === "Pending"
    ).length,
    resolved:
      filteredPosts.filter((p) => p.status === "Resolved").length +
      (activeLocId === "resident" ? 3 : 1),
  };
  // Total i² signals across this area (sum of agrees), fallback for visual
  const totalSignals = filteredPosts.reduce(
    (sum, p) => sum + (p.agree || 0),
    0
  );
  const formatSignals = (n) =>
    n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  const BottomNav = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 20px",
        borderTop: `1px solid ${C.border}`,
        background: "rgba(10, 10, 15, 0.95)",
        backdropFilter: "blur(20px)",
        flexShrink: 0,
      }}
    >
      {[
        {
          id: "feed",
          l: "Home",
          I: ({ a }) => (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={a ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
        },
        { id: "create", l: "Create", I: null, isCreate: true },
        { id: "voice", l: "My Voice", I: Ics.Voice },
      ].map((n) => {
        const isActive = nav === n.id;
        if (n.isCreate) {
          return (
            <button
              key={n.id}
              onClick={() => setCreateModalOpen(true)}
              aria-label="Create new post"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: 60,
                color: C.text,
                position: "relative",
              }}
            >
              {/* Cutout background, creates the 'notch' effect visually */}
              <div
                style={{
                  position: "absolute",
                  top: -22,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 64,
                  height: 32,
                  borderRadius: "0 0 32px 32px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderTop: "none",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: C.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 20px rgba(120, 86, 255, 0.45), 0 0 0 3px ${C.bg}`,
                  marginTop: -14,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Ics.Plus />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.text2,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Create
              </span>
            </button>
          );
        }
        return (
          <button
            key={n.id}
            onClick={() => {
              setNav(n.id);
              if (n.id === "feed") go("feed");
              else if (n.id === "voice") go("voice");
            }}
            style={{
              background: "none",
              border: "none",
              color: isActive ? C.purple : C.text2,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              minWidth: 60,
              transition: "color 0.2s",
            }}
          >
            <n.I a={isActive} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>{n.l}</span>
          </button>
        );
      })}
    </div>
  );

  // ── SPLASH ──
  if (screen === "splash") {
    return (
      <PhoneFrame>
        <div
          onClick={() => setScreen("phone")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            position: "relative",
            cursor: "pointer",
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.purple}30 0%, transparent 70%)`,
              filter: "blur(20px)",
              animation: "pulse1 3s ease-in-out infinite",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <I2Logo size={90} animated />
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.text2,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
              animation: "fadeIn 1s ease-out 0.6s both",
            }}
          >
            Your Voice · Your City
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 11,
              color: C.text3,
              letterSpacing: 2,
              animation: "fadeIn 1s ease-out 1.2s both",
            }}
          >
            IMPACT × IGNITE
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // ── PHONE ──
  if (screen === "phone")
    return (
      <PhoneFrame>
        <div
          style={{
            padding: "32px 24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <I2Logo size={56} />
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginBottom: 8,
              marginTop: 0,
              letterSpacing: -0.5,
            }}
          >
            Join your city.
          </h1>
          <p
            style={{
              color: C.text2,
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.5,
            }}
          >
            Enter your WhatsApp number. We'll send a secure OTP to verify it's
            really you.
          </p>
          <div
            style={{
              display: "flex",
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              marginBottom: 20,
              overflow: "hidden",
              background: C.surface2,
            }}
          >
            <div
              style={{
                padding: "15px 16px",
                borderRight: `1px solid ${C.border}`,
                color: C.text2,
                fontSize: 15,
                background: C.surface3,
              }}
            >
              +91
            </div>
            <input
              value={regData.phone.replace("+91 ", "")}
              onChange={(e) =>
                setRegData({ ...regData, phone: "+91 " + e.target.value })
              }
              placeholder="Phone number"
              style={{
                flex: 1,
                padding: "15px",
                background: "none",
                border: "none",
                color: C.text,
                fontSize: 16,
                outline: "none",
                fontFamily: F.body,
              }}
            />
          </div>
          <Btn onClick={() => go("reg")}>Send OTP</Btn>
          <div
            style={{
              textAlign: "center",
              color: C.text3,
              fontSize: 12,
              marginTop: 24,
              lineHeight: 1.6,
            }}
          >
            By continuing, you agree to our
            <br />
            <span style={{ color: C.text2 }}>Terms</span> and{" "}
            <span style={{ color: C.text2 }}>Privacy Policy</span>
          </div>
        </div>
      </PhoneFrame>
    );

  // ── REGISTRATION ──
  if (screen === "reg")
    return (
      <PhoneFrame>
        <Header title="Create your profile" onBack={() => go("phone")} />
        <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div
              onClick={() => setAvatarPicked(true)}
              role="button"
              tabIndex={0}
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: avatarPicked ? C.gradient : C.surface2,
                border: avatarPicked ? "none" : `2px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
                color: avatarPicked ? C.text : C.text2,
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {avatarPicked && regData.name ? (
                regData.name[0].toUpperCase()
              ) : (
                <Ics.User size={40} />
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  background: C.gradient,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${C.bg}`,
                  color: C.text,
                }}
              >
                <Ics.Plus />
              </div>
            </div>
          </div>

          <Input label="Mobile Number *" value={regData.phone} disabled />
          <Input
            label="Full Name *"
            placeholder="e.g. Aditya Kumar"
            value={regData.name}
            onChange={(e) => setRegData({ ...regData, name: e.target.value })}
          />

          <div style={{ marginBottom: 4 }}>
            <label
              style={{
                display: "block",
                color: C.text,
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Username *
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  border: `1px solid ${
                    usernameStatus === "taken"
                      ? C.red
                      : usernameStatus === "available"
                      ? C.green
                      : C.border
                  }`,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: C.surface2,
                }}
              >
                <input
                  placeholder="e.g. aditya_k"
                  value={regData.username}
                  onChange={handleUsername}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: F.body,
                  }}
                />
              </div>
            </div>
          </div>
          {usernameStatus === "taken" && (
            <div
              style={{
                color: C.red,
                fontSize: 12,
                marginBottom: 16,
                marginTop: 4,
              }}
            >
              That username is taken. Try another.
            </div>
          )}
          {usernameStatus === "available" && (
            <div
              style={{
                color: C.green,
                fontSize: 12,
                marginBottom: 16,
                marginTop: 4,
              }}
            >
              ✓ Available
            </div>
          )}
          {usernameStatus === "" && <div style={{ height: 20 }} />}

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: C.text,
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Gender *
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setRegData({ ...regData, gender: g })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: regData.gender === g ? C.purpleDim : C.surface2,
                    border: `1px solid ${
                      regData.gender === g ? C.purple : C.border
                    }`,
                    color: regData.gender === g ? C.purple : C.text,
                    fontSize: 14,
                    fontWeight: regData.gender === g ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: F.body,
                    transition: "all 0.2s",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: C.text,
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Date of Birth
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { p: "DD", k: "dd", m: 2 },
                { p: "MM", k: "mm", m: 2 },
                { p: "YYYY", k: "yyyy", m: 4 },
              ].map((f) => (
                <input
                  key={f.k}
                  placeholder={f.p}
                  value={regData.dob[f.k]}
                  onChange={(e) =>
                    setRegData({
                      ...regData,
                      dob: {
                        ...regData.dob,
                        [f.k]: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                  maxLength={f.m}
                  style={{
                    flex: f.k === "yyyy" ? 2 : 1,
                    padding: "14px",
                    background: C.surface2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 14,
                    outline: "none",
                    textAlign: "center",
                    fontFamily: F.body,
                  }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Residence *"
            value={regData.residence}
            onChange={(e) =>
              setRegData({ ...regData, residence: e.target.value })
            }
            right={<Ics.Pin />}
          />

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                color: C.text,
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {regData.dob.yyyy && parseInt(regData.dob.yyyy) >= 2007
                ? "Student ID"
                : "Voter ID Proof"}
            </label>
            <FileUpload
              fileName={
                regData.dob.yyyy
                  ? parseInt(regData.dob.yyyy) >= 2007
                    ? "Student_ID.jpg"
                    : "Voter_ID.jpg"
                  : null
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              background: C.purpleDim,
              border: `1px solid ${C.purple}30`,
              borderRadius: 10,
              marginTop: 16,
              marginBottom: 24,
              color: C.purple,
              fontSize: 13,
            }}
          >
            <Ics.Shield />
            <span>Your ID will be verified within 24 hours</span>
          </div>

          <Btn
            onClick={() => go("success")}
            disabled={
              usernameStatus === "taken" ||
              !regData.name.trim() ||
              !regData.gender ||
              regData.username.length < 3 ||
              !regData.residence.trim() ||
              !regData.dob.dd ||
              !regData.dob.mm ||
              !regData.dob.yyyy ||
              parseInt(regData.dob.dd) < 1 ||
              parseInt(regData.dob.dd) > 31 ||
              parseInt(regData.dob.mm) < 1 ||
              parseInt(regData.dob.mm) > 12 ||
              parseInt(regData.dob.yyyy) < 1920 ||
              parseInt(regData.dob.yyyy) > 2020
            }
          >
            Create Account
          </Btn>
          <div style={{ height: 20 }} />
        </div>
      </PhoneFrame>
    );

  // ── SUCCESS ──
  if (screen === "success")
    return (
      <PhoneFrame>
        <div
          style={{
            padding: "24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            className="scale-in"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: C.purpleDim,
              border: `3px solid ${C.purple}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <Ics.CheckCircle size={60} color={C.purple} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            Welcome, {regData.name?.split(" ")[0] || "Citizen"}!
          </div>
          <div
            style={{
              fontSize: 15,
              color: C.text2,
              marginBottom: 40,
              lineHeight: 1.6,
              maxWidth: 280,
            }}
          >
            Your i² account is ready. Let's show you how to make your voice
            count.
          </div>
          <Btn onClick={() => go("tutorial")}>Show me around</Btn>
        </div>
      </PhoneFrame>
    );

  // ── TUTORIAL ──
  if (screen === "tutorial") {
    const slides = [
      {
        Icon: () => <Ics.SpeakUp a={true} />,
        t: "Speak Up",
        d: "See something wrong in your area? Raise it publicly. Your neighbors can support it, making it louder for officials to hear.",
      },
      {
        Icon: () => <Ics.Rep a={true} />,
        t: "Personal Request",
        d: "Need private help with a government matter? Send a direct request to your MLA, MP, or Corporator. Track every response.",
      },
      {
        Icon: I2Logo,
        t: "Two i's, one voice",
        d: "When citizens stand together, their voice squares. Support others with i², and watch real change happen in your city.",
      },
    ];
    return <TutorialSlides slides={slides} onDone={goFeed} />;
  }

  // ── FEED (HOME) ──
  if (screen === "feed")
    return (
      <PhoneFrame>
        {/* Top Header */}
        <div
          style={{
            padding: "10px 16px 0",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            position: "relative",
            zIndex: 50,
            background: C.bg,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div
              onClick={() => go("profile")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: C.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.text,
                }}
              >
                {regData.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.text2 }}>
                  Welcome back,
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {regData.name?.split(" ")[0] || "Aditya"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Location dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setLocDropdown(!locDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: C.surface2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    color: C.text,
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: F.body,
                    fontWeight: 600,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={C.green}
                    stroke="none"
                  >
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  <span
                    style={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeLoc.name}
                  </span>
                  <Ics.ChevDown />
                </button>
                {locDropdown && (
                  <>
                    <div
                      onClick={() => setLocDropdown(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 190 }}
                    />
                    <div
                      className="slide-up"
                      style={{
                        position: "absolute",
                        top: 40,
                        right: 0,
                        width: 280,
                        background: C.surface2,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
                        overflow: "hidden",
                        zIndex: 200,
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: `1px solid ${C.border}`,
                          fontSize: 11,
                          color: C.text2,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        Choose location
                      </div>

                      <div
                        onClick={() => {
                          setActiveLocId("resident");
                          setActiveLoc(LOCATIONS[0]);
                          setLocDropdown(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          background:
                            activeLocId === "resident"
                              ? C.purpleDim
                              : "transparent",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                color:
                                  activeLocId === "resident"
                                    ? C.purple
                                    : C.text2,
                              }}
                            >
                              <Ics.Shield />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>
                                My Residence
                              </div>
                              <div style={{ fontSize: 11, color: C.text2 }}>
                                Saraswathi Colony
                              </div>
                            </div>
                          </div>
                          {activeLocId === "resident" && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: C.purple,
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setActiveLocId("current");
                          setActiveLoc({
                            id: "current",
                            name: "Current Area",
                            full: "GPS-based nearby area",
                          });
                          setLocDropdown(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          background:
                            activeLocId === "current"
                              ? C.purpleDim
                              : "transparent",
                          borderTop: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                color:
                                  activeLocId === "current"
                                    ? C.purple
                                    : C.text2,
                              }}
                            >
                              <Ics.Pin />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>
                                Where I am now
                              </div>
                              <div style={{ fontSize: 11, color: C.text2 }}>
                                GPS-based nearby issues
                              </div>
                            </div>
                          </div>
                          {activeLocId === "current" && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: C.purple,
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "10px 16px",
                          borderTop: `1px solid ${C.border}`,
                          background: C.surface3,
                        }}
                      >
                        <button
                          onClick={() => {
                            setLocationSheetOpen(true);
                            setLocDropdown(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: C.purple,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: F.body,
                          }}
                        >
                          How location works <Ics.Info />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => go("notifications")}
                aria-label="Notifications"
                style={{
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.text,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <Ics.Bell />
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.red,
                    border: `2px solid ${C.surface2}`,
                  }}
                />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.surface2,
              borderRadius: 24,
              padding: "10px 16px",
              marginBottom: 12,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ color: C.text2 }}>
              <Ics.Search />
            </div>
            <input
              placeholder="Search issues in your area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                color: C.text,
                fontSize: 14,
                outline: "none",
                fontFamily: F.body,
              }}
            />
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex" }}>
            {[
              { id: "speakup", label: "Speak Up" },
              { id: "representative", label: "From Your Representative" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFeedTab(t.id)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "none",
                  border: "none",
                  color: feedTab === t.id ? C.text : C.text2,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  position: "relative",
                  fontFamily: F.body,
                }}
              >
                {t.label}
                {feedTab === t.id && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "20%",
                      right: "20%",
                      height: 3,
                      background: C.gradient,
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {feedTab === "speakup" && (
            <>
              {/* HERO STATS CARD */}
              {filteredPosts.length > 0 && (
                <div
                  className="fade-in"
                  style={{
                    margin: "12px 16px",
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${C.purple}25 0%, ${C.accent}15 100%)`,
                    border: `1px solid ${C.purple}40`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -40,
                      right: -40,
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${C.purple}40, transparent)`,
                      filter: "blur(20px)",
                    }}
                  />
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.text2,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      Your area · {activeLoc.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "stretch",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          {areaStats.open}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.text2,
                            fontWeight: 600,
                            marginTop: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          Open
                          <br />
                          issues
                        </div>
                      </div>
                      <div style={{ width: 1, background: C.border }} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            lineHeight: 1,
                            color: C.green,
                          }}
                        >
                          {areaStats.resolved}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.text2,
                            fontWeight: 600,
                            marginTop: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          Resolved
                          <br />
                          this week
                        </div>
                      </div>
                      <div style={{ width: 1, background: C.border }} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            lineHeight: 1,
                            color: C.purple,
                          }}
                        >
                          {formatSignals(totalSignals)}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.text2,
                            fontWeight: 600,
                            marginTop: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          i²
                          <br />
                          signals
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sort chips */}
              <div
                style={{
                  padding: "4px 16px 8px",
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {[
                  {
                    id: "Critical",
                    label: "Critical near me",
                    Icon: Ics.Alert,
                    iconColor: C.critical,
                  },
                  { id: "Trending", label: "Trending", Icon: Ics.TrendUp },
                  { id: "Recent", label: "Recent", Icon: Ics.Clock },
                  {
                    id: "Unresolved",
                    label: "Unresolved",
                    Icon: Ics.Hourglass,
                  },
                ].map((s) => {
                  const active = sortBy === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: active ? C.gradient : C.surface2,
                        color: active ? C.text : C.text2,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        border: `1px solid ${
                          active ? "transparent" : C.border
                        }`,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          color: active ? C.text : s.iconColor || C.text2,
                          display: "flex",
                        }}
                      >
                        <s.Icon />
                      </span>
                      {s.label}
                    </div>
                  );
                })}
              </div>

              {filteredPosts.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}
                  >
                    No issues yet
                  </div>
                  <div style={{ color: C.text2, fontSize: 14 }}>
                    Be the first to speak up about your area.
                  </div>
                </div>
              ) : (
                filteredPosts.map((p, idx) => {
                  const firstCriticalIdx = filteredPosts.findIndex(
                    (x) => x.severity === "Critical"
                  );
                  return (
                    <PostCard
                      key={p.id}
                      p={p}
                      onClick={() => {
                        setSelectedPost(p);
                        go("post");
                      }}
                      supported={!!supportedPosts[p.id]}
                      onSupport={toggleSupport}
                      onComment={openComments}
                      onShare={sharePost}
                      blinkCritical={idx === firstCriticalIdx}
                    />
                  );
                })
              )}
            </>
          )}

          {feedTab === "representative" && (
            <>
              <div
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  color: C.text2,
                  background: C.surface2,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Verified posts from your elected representatives in{" "}
                {activeLoc.name}
              </div>
              {filteredReps.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}
                  >
                    No updates yet
                  </div>
                  <div style={{ color: C.text2, fontSize: 14 }}>
                    Your representatives haven't posted anything for this area
                    yet.
                  </div>
                </div>
              ) : (
                filteredReps.map((f, i) => (
                  <RepCard
                    key={f.id || i}
                    p={f}
                    votedIdx={pollVotes[f.id]}
                    onVote={castVote}
                  />
                ))
              )}
            </>
          )}
        </div>

        <BottomNav />

        {/* LOCATION INFO SHEET */}
        {locationSheetOpen && (
          <div
            onClick={() => setLocationSheetOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 2000,
              display: "flex",
              alignItems: "flex-end",
              animation: "fadeIn 0.2s",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="slide-up"
              style={{
                background: C.surface,
                width: "100%",
                borderRadius: "20px 20px 0 0",
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: C.surface3,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>
                How location works
              </h3>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                  <div style={{ color: C.purple }}>
                    <Ics.Shield />
                  </div>
                  <strong style={{ fontSize: 14 }}>My Residence</strong>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: C.text2,
                    fontSize: 13,
                    lineHeight: 1.5,
                    paddingLeft: 28,
                  }}
                >
                  Issues in the area where you're a verified resident. Your
                  reports here route to your registered MLA and Corporator.
                </p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                  <div style={{ color: C.purple }}>
                    <Ics.Pin />
                  </div>
                  <strong style={{ fontSize: 14 }}>Where I am now</strong>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: C.text2,
                    fontSize: 13,
                    lineHeight: 1.5,
                    paddingLeft: 28,
                  }}
                >
                  Issues within 2 km of your current GPS location. Useful when
                  you're visiting another area and spot something.
                </p>
              </div>
              <Btn onClick={() => setLocationSheetOpen(false)}>Got it</Btn>
            </div>
          </div>
        )}

        {/* CREATE MODAL */}
        {createModalOpen && (
          <div
            onClick={() => setCreateModalOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 1000,
              display: "flex",
              alignItems: "flex-end",
              animation: "fadeIn 0.2s",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="slide-up"
              style={{
                background: C.surface,
                width: "100%",
                borderRadius: "20px 20px 0 0",
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: C.surface3,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />
              <div style={{ padding: "0 20px 16px" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  What do you want to do?
                </div>
                <div style={{ fontSize: 13, color: C.text2, marginTop: 4 }}>
                  Choose how your message is shared
                </div>
              </div>

              <div
                onClick={() => {
                  setPostType("public");
                  setCreateModalOpen(false);
                  go("create_form");
                }}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: C.purpleDim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.purple,
                    flexShrink: 0,
                  }}
                >
                  <Ics.SpeakUp a={true} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}
                  >
                    Speak Up
                  </div>
                  <div
                    style={{ fontSize: 13, color: C.text2, lineHeight: 1.4 }}
                  >
                    Share an issue publicly. Neighbors can support it. Bigger
                    voice = faster action.
                  </div>
                </div>
                <div
                  style={{
                    color: C.text2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Ics.ChevRight />
                </div>
              </div>

              <div
                onClick={() => {
                  setPostType("private");
                  setCreateModalOpen(false);
                  go("create_form");
                }}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(29, 155, 240, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accent,
                    flexShrink: 0,
                  }}
                >
                  <Ics.Rep a={true} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}
                  >
                    Personal Request
                  </div>
                  <div
                    style={{ fontSize: 13, color: C.text2, lineHeight: 1.4 }}
                  >
                    Private message to your MLA, MP, or Corporator. Only they
                    see it.
                  </div>
                </div>
                <div
                  style={{
                    color: C.text2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Ics.ChevRight />
                </div>
              </div>

              <div style={{ height: 16 }} />
            </div>
          </div>
        )}
      </PhoneFrame>
    );

  // ── NOTIFICATIONS ──
  if (screen === "notifications") {
    const notifs = [
      {
        id: "n1",
        type: "support",
        icon: "🔥",
        title: "Your issue is gaining traction",
        body: "Your water shortage post crossed 50 i² signals. Keep neighbors posted as it develops.",
        time: "2h ago",
        unread: true,
      },
      {
        id: "n2",
        type: "status",
        icon: "✅",
        title: "Issue marked In Progress",
        body: "Corporator, Ward 12 responded to your sanitation report. Repair team dispatched.",
        time: "5h ago",
        unread: true,
      },
      {
        id: "n3",
        type: "rep",
        icon: "📢",
        title: "New poll from your MLA",
        body: "Rajesh Nayak has posted a new community poll. Your vote matters.",
        time: "1d ago",
        unread: true,
      },
      {
        id: "n4",
        type: "reply",
        icon: "💬",
        title: "New reply on your post",
        body: 'Sarah M replied: "Same issue in our block too..."',
        time: "1d ago",
        unread: false,
      },
      {
        id: "n5",
        type: "resolved",
        icon: "🎉",
        title: "Issue resolved",
        body: "Your widow pension request has been approved by MLA Office, Uppal.",
        time: "3d ago",
        unread: false,
      },
    ];
    return (
      <PhoneFrame>
        <Header title="Notifications" onBack={() => go("feed")} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 16px",
                borderBottom: `1px solid ${C.border}`,
                background: n.unread ? `${C.purple}08` : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.surface2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {n.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 2,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: 11, color: C.text2, flexShrink: 0 }}>
                    {n.time}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: C.text2,
                    lineHeight: 1.4,
                  }}
                >
                  {n.body}
                </p>
              </div>
              {n.unread && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.purple,
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
              )}
            </div>
          ))}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              color: C.text3,
              fontSize: 12,
            }}
          >
            You're all caught up 🎉
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // ── POST DETAIL ──
  if (screen === "post" && selectedPost) {
    const p = selectedPost;
    const isSupported = !!supportedPosts[p.id];
    const postLiveComments = liveComments.filter((c) => c.postId === p.id);
    const totalReplies = p.comments + postLiveComments.length;
    return (
      <PhoneFrame>
        <Header
          title=""
          onBack={() => go("feed")}
          right={
            <button
              onClick={() => setPostMenuOpen(true)}
              aria-label="More options"
              style={{
                background: "none",
                border: "none",
                color: C.text2,
                cursor: "pointer",
                display: "flex",
                padding: 4,
              }}
            >
              <Ics.More />
            </button>
          }
        />
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div
            style={{ padding: "16px", borderBottom: `1px solid ${C.border}` }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <Avatar name={p.author} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {p.author}
                  </span>
                  {p.verified && <Ics.Badge />}
                </div>
                <div style={{ fontSize: 13, color: C.text2 }}>@{p.handle}</div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12,
                    color: C.text2,
                    marginTop: 2,
                    alignItems: "center",
                  }}
                >
                  <Ics.Pin /> <span>{p.distance}</span> ·{" "}
                  <span>{p.fullDate}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <SeverityTag level={p.severity} />
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: C.surface3,
                  color: C.text2,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {p.cat}
              </span>
              <StatusBadge status={p.status} />
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 0 14px" }}>
              {p.desc}
            </p>

            {p.img && (
              <div
                style={{
                  width: "100%",
                  height: 240,
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                <img
                  src={p.img}
                  alt={`Issue: ${(p.desc || "").slice(0, 60)}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {/* Action row */}
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <I2Button
                active={isSupported}
                count={p.agree + (isSupported ? 1 : 0)}
                onClick={() => toggleSupport(p.id)}
              />
              <button
                aria-label="Scroll to replies"
                onClick={() => {
                  const el = document.getElementById("replies-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "6px 12px",
                  color: C.text2,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: F.body,
                  fontWeight: 600,
                }}
              >
                <Ics.Comment />
                {totalReplies}
              </button>
              <button
                aria-label="Share post"
                onClick={() => sharePost(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "6px 10px",
                  color: C.text2,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: F.body,
                }}
              >
                <Ics.Share />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div id="replies-section" style={{ padding: "16px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>
              Replies ({totalReplies})
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${C.border}`,
                borderRadius: 24,
                padding: "8px 14px",
                marginBottom: 20,
                gap: 10,
                background: C.surface2,
              }}
            >
              <button
                aria-label="Attach photo"
                style={{
                  background: "none",
                  border: "none",
                  color: C.text2,
                  padding: 0,
                  display: "flex",
                  cursor: "pointer",
                }}
              >
                <Ics.Camera />
              </button>
              <input
                placeholder="Add your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitReply();
                  }
                }}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: C.text,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: F.body,
                }}
              />
              <button
                onClick={submitReply}
                disabled={!replyText.trim()}
                aria-label="Send reply"
                style={{
                  background: replyText.trim() ? C.gradient : C.surface3,
                  border: "none",
                  color: C.text,
                  cursor: replyText.trim() ? "pointer" : "not-allowed",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: replyText.trim() ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                <Ics.Send />
              </button>
            </div>
            {[...THREAD_COMMENTS, ...postLiveComments].map((c, i) => (
              <div
                key={`${c.handle || c.user}-${c.time}-${i}`}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 20,
                  padding: c.official ? "14px" : 0,
                  borderRadius: c.official ? 14 : 0,
                  background: c.official
                    ? `linear-gradient(135deg, ${C.purple}15, ${C.accent}08)`
                    : "transparent",
                  border: c.official ? `1px solid ${C.purple}40` : "none",
                }}
              >
                <Avatar name={c.user} isOfficial={c.official} size={36} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: c.official ? C.purple : C.text,
                      }}
                    >
                      {c.user}
                    </span>
                    {c.official && <Ics.Badge />}
                    <span style={{ color: C.text2, fontSize: 11 }}>
                      · {c.time}
                    </span>
                  </div>
                  {c.badge && (
                    <div
                      style={{
                        color: C.purple,
                        fontSize: 11,
                        fontWeight: 800,
                        marginBottom: 6,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      ✓ {c.badge}
                    </div>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: c.official ? C.text : C.text2,
                    }}
                  >
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post overflow menu */}
        {postMenuOpen && (
          <div
            onClick={() => setPostMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 2000,
              display: "flex",
              alignItems: "flex-end",
              animation: "fadeIn 0.2s",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="slide-up"
              style={{
                background: C.surface,
                width: "100%",
                borderRadius: "20px 20px 0 0",
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: C.surface3,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />
              {[
                {
                  label: "Share post",
                  action: () => {
                    setPostMenuOpen(false);
                    sharePost(p);
                  },
                },
                {
                  label: "Copy link",
                  action: async () => {
                    setPostMenuOpen(false);
                    try {
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(`i² post: ${p.id}`);
                        alert("Link copied");
                      }
                    } catch {}
                  },
                },
                {
                  label: "Report this post",
                  action: () => {
                    setPostMenuOpen(false);
                    alert(
                      "Report submitted. Our team will review within 24 hours."
                    );
                  },
                },
                {
                  label: "Cancel",
                  action: () => setPostMenuOpen(false),
                  muted: true,
                },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    color: item.muted ? C.text2 : C.text,
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: "left",
                    cursor: "pointer",
                    borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
                    fontFamily: F.body,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </PhoneFrame>
    );
  }

  // ── CREATE FORM ──
  if (screen === "create_form")
    return (
      <PhoneFrame>
        <Header
          title={postType === "public" ? "Speak Up" : "Personal Request"}
          onBack={goBackFromCreate}
        />
        <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              color: postType === "public" ? C.purple : C.accent,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              padding: "10px 12px",
              background:
                postType === "public"
                  ? C.purpleDim
                  : "rgba(29, 155, 240, 0.15)",
              borderRadius: 10,
              border: `1px solid ${
                postType === "public" ? C.purple : C.accent
              }40`,
            }}
          >
            <Ics.Info />
            <span style={{ fontWeight: 600 }}>
              {postType === "public"
                ? "Visible to everyone in your area"
                : "Private , only your representative sees this"}
            </span>
          </div>

          <label
            style={{
              display: "block",
              color: C.text,
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            What's happening? *
          </label>
          <textarea
            placeholder="Describe the issue clearly. More detail = faster action."
            value={newPostData.desc}
            onChange={(e) =>
              setNewPostData({ ...newPostData, desc: e.target.value })
            }
            style={{
              width: "100%",
              padding: "14px",
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontSize: 14,
              outline: "none",
              height: 100,
              resize: "none",
              marginBottom: 20,
              boxSizing: "border-box",
              fontFamily: F.body,
            }}
          />

          <Input
            label="Area *"
            placeholder="Street, landmark, block number"
            value={newPostData.area}
            onChange={(e) =>
              setNewPostData({ ...newPostData, area: e.target.value })
            }
            right={<Ics.Pin />}
          />

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: C.text,
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Category *
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                "Water",
                "Road",
                "Electricity",
                "Sanitation",
                "Traffic",
                "Other",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewPostData({ ...newPostData, cat })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    background:
                      newPostData.cat === cat ? C.purpleDim : C.surface2,
                    border: `1px solid ${
                      newPostData.cat === cat ? C.purple : C.border
                    }`,
                    color: newPostData.cat === cat ? C.purple : C.text,
                    fontSize: 13,
                    fontWeight: newPostData.cat === cat ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: F.body,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <label
            style={{
              display: "block",
              color: C.text,
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Add Photos/Videos{" "}
            <span style={{ color: C.text2, fontWeight: 400 }}>
              (optional, up to 60s video)
            </span>
          </label>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              marginBottom: 20,
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                border: `1.5px dashed ${C.border}`,
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: C.text2,
                flexShrink: 0,
                cursor: "pointer",
                background: C.surface2,
              }}
            >
              <Ics.Camera />
              <span style={{ fontSize: 11, marginTop: 4 }}>Add</span>
            </div>
            {[
              "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=200&q=80",
              "https://images.unsplash.com/photo-1574045559400-3306dbfa48eb?auto=format&fit=crop&w=200&q=80",
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  background: C.surface2,
                  position: "relative",
                  flexShrink: 0,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                }}
              >
                <img
                  src={src}
                  alt={`Attached photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.7)",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {postType === "public" ? (
            <div
              onClick={() => setAnonymous(!anonymous)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
                padding: "12px 14px",
                background: anonymous ? C.purpleDim : C.surface2,
                borderRadius: 10,
                border: `1px solid ${anonymous ? C.purple : C.border}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: `2px solid ${anonymous ? C.purple : C.border}`,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: anonymous ? C.purple : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {anonymous && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: anonymous ? C.purple : C.text2,
                  flex: 1,
                  fontWeight: anonymous ? 700 : 400,
                }}
              >
                Post anonymously (your identity stays hidden)
              </span>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <FileUpload label="Identity Proof" fileName="Identity.jpg" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <FileUpload label="Supporting Documents (optional)" />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Send to *
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Corporator", "MLA", "MP"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSendTo(r)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: sendTo === r ? C.purpleDim : C.surface2,
                        border: `1px solid ${
                          sendTo === r ? C.purple : C.border
                        }`,
                        color: sendTo === r ? C.purple : C.text,
                        fontSize: 13,
                        fontWeight: sendTo === r ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: F.body,
                        flex: 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Btn
            disabled={
              !newPostData.desc.trim() ||
              !newPostData.area.trim() ||
              newPostData.cat === "Select Category"
            }
            onClick={() => {
              const newPost = {
                id: `PD${Math.floor(Math.random() * 900000) + 100000}`,
                locId: activeLocId,
                cat:
                  newPostData.cat !== "Select Category"
                    ? newPostData.cat
                    : "Other",
                severity: "High",
                date: "just now",
                fullDate: "22/04/2026",
                desc: newPostData.desc || "A new issue was raised in the area.",
                status: "Open",
                agree: 0,
                comments: 0,
                type: postType === "public" ? "Public" : "Private",
                author:
                  postType === "public" && anonymous
                    ? "Anonymous"
                    : regData.name || "Aditya Sharma",
                handle:
                  postType === "public" && anonymous
                    ? "anonymous"
                    : regData.username || "aditya_s",
                verified: !(postType === "public" && anonymous),
                distance: "0.2 km",
                routedTo:
                  postType === "private" ? `${sendTo} Office` : undefined,
              };
              if (postType === "public") setNewPostCreated(newPost);
              // Reset form
              setNewPostData({
                desc: "",
                cat: "Select Category",
                area: "",
                subject: "",
              });
              setAnonymous(false);
              go("post_success");
            }}
          >
            {postType === "public" ? "Speak Up" : "Send Request"}
          </Btn>
          <div style={{ height: 20 }} />
        </div>

        {/* Discard confirmation */}
        {confirmDiscard && (
          <div
            onClick={() => setConfirmDiscard(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.2s",
              padding: "0 24px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="scale-in"
              style={{
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px",
                width: "100%",
                maxWidth: 320,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
                Discard changes?
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: C.text2,
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                You have unsaved text. If you leave now, it will be lost.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmDiscard(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: F.body,
                  }}
                >
                  Keep editing
                </button>
                <button
                  onClick={() => {
                    setConfirmDiscard(false);
                    setNewPostData({
                      desc: "",
                      cat: "Select Category",
                      area: "",
                      subject: "",
                    });
                    goFeed();
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: C.red,
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: F.body,
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </PhoneFrame>
    );

  // ── POST SUCCESS ──
  if (screen === "post_success")
    return (
      <PhoneFrame>
        <div
          style={{
            padding: "24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            className="scale-in"
            style={{ position: "relative", marginBottom: 32 }}
          >
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${C.purple}40 0%, transparent 70%)`,
                filter: "blur(20px)",
                animation: "pulse1 2s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: C.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  color: i % 2 ? C.amber : C.purple,
                  animation: `sparkle 1.2s ease-out ${i * 0.1}s infinite`,
                  transform: `rotate(${i * 72}deg) translateY(-70px)`,
                }}
              >
                <Ics.Spark size={14} />
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 10,
              letterSpacing: -0.5,
            }}
          >
            {postType === "public" ? "Your voice is live!" : "Request sent!"}
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.text2,
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 300,
            }}
          >
            {postType === "public"
              ? "Your issue is now visible to everyone in your area. Neighbors can support it with i² to make it louder."
              : "Your personal request has been routed to your MLA's office. You'll be notified of any updates."}
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Btn
              onClick={() => {
                setNav("voice");
                go("voice");
              }}
            >
              Track in My Voice
            </Btn>
            <Btn variant="secondary" onClick={goFeed}>
              Back to Home
            </Btn>
          </div>
        </div>
      </PhoneFrame>
    );

  // ── MY VOICE ──
  if (screen === "voice")
    return (
      <PhoneFrame>
        <div
          style={{
            padding: "14px 16px 0",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            background: C.bg,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: C.purpleDim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.purple,
              }}
            >
              <Ics.Voice a={true} />
            </div>
            <div>
              <div
                style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}
              >
                My Voice
              </div>
              <div style={{ fontSize: 11, color: C.text2 }}>
                Everything you've raised, in one place
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["Public", "Private"].map((f) => (
              <button
                key={f}
                onClick={() => setVoiceFilter(f)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  background: voiceFilter === f ? C.gradient : C.surface2,
                  color: voiceFilter === f ? C.text : C.text2,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: F.body,
                }}
              >
                {f === "Public" ? "Spoke Up" : "Requests"}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 10,
            }}
          >
            {["All", "Open", "Pending", "In Progress", "Resolved"].map((f) => (
              <div
                key={f}
                onClick={() => setVoiceStatusFilter(f)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: voiceStatusFilter === f ? C.text : "transparent",
                  color: voiceStatusFilter === f ? C.bg : C.text2,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1px solid ${
                    voiceStatusFilter === f ? C.text : C.border
                  }`,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredMyVoice.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                No {voiceFilter === "Public" ? "posts" : "requests"} yet
              </div>
              <div style={{ color: C.text2, fontSize: 14, marginBottom: 20 }}>
                {voiceFilter === "Public"
                  ? "Speak up about issues in your area."
                  : "Send a personal request to your representative."}
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                style={{
                  background: C.gradient,
                  color: C.text,
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: F.body,
                }}
              >
                Create now
              </button>
            </div>
          ) : (
            filteredMyVoice.map((t, i) => (
              <article
                key={t.id || i}
                style={{
                  padding: "16px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: C.surface3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.text2,
                    flexShrink: 0,
                  }}
                >
                  {t.type === "Public" ? <Ics.SpeakUp /> : <Ics.Rep />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <SeverityTag level={t.severity} />
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: C.surface3,
                          color: C.text2,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {t.cat}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: C.text2 }}>
                      {t.date}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: C.text,
                    }}
                  >
                    {t.desc}
                  </p>

                  {t.img && (
                    <div
                      style={{
                        width: "100%",
                        height: 140,
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 10,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <img
                        src={t.img}
                        alt={`Your ${t.cat} post: ${(t.desc || "").slice(
                          0,
                          50
                        )}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: t.type === "Public" ? 10 : 0,
                    }}
                  >
                    <StatusBadge status={t.status} />
                    {t.routedTo && (
                      <span style={{ fontSize: 11, color: C.text2 }}>
                        → {t.routedTo}
                      </span>
                    )}
                  </div>

                  {t.type === "Public" && (
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <I2Button count={t.agree} />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: C.text2,
                          fontSize: 12,
                          padding: "6px 10px",
                        }}
                      >
                        <Ics.Comment /> {t.comments}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        <BottomNav />
      </PhoneFrame>
    );

  // ── PROFILE ──
  if (screen === "profile")
    return (
      <PhoneFrame>
        <Header title="Profile" onBack={goFeed} />
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: C.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {regData.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>
                    {regData.name || "Aditya Sharma"}
                  </span>
                  <Ics.Badge />
                </div>
                <div style={{ color: C.text2, fontSize: 13 }}>
                  @{regData.username || "aditya_s"}
                </div>
                <div style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>
                  {regData.phone || "+91 98765 43219"}
                </div>
              </div>
            </div>
            <button
              onClick={() => go("edit_profile")}
              style={{
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 10,
                color: C.text,
                cursor: "pointer",
              }}
            >
              <Ics.Edit />
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <div
              style={{
                flex: 1,
                padding: "14px 10px",
                background: C.surface2,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800 }}>7</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>
                Issues raised
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "14px 10px",
                background: C.surface2,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>
                3
              </div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>
                Resolved
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "14px 10px",
                background: C.surface2,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: C.purple }}>
                459
              </div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>
                i² received
              </div>
            </div>
          </div>

          <div
            onClick={() => go("edit_profile")}
            style={{
              background: `${C.amber}15`,
              border: `1px solid ${C.amber}40`,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              cursor: "pointer",
            }}
          >
            <Ics.Warning />
            <span style={{ color: C.amber, fontSize: 13, flex: 1 }}>
              Please reupload ID Proof for verification
            </span>
            <div style={{ color: C.amber }}>
              <Ics.ChevRight />
            </div>
          </div>

          {[
            {
              icon: Ics.Moon,
              text: "Dark Theme",
              toggle: true,
              action: () => setDarkTheme(!darkTheme),
              toggleOn: darkTheme,
            },
            {
              icon: Ics.Info,
              text: "About i²",
              action: () => setSettingsSheet("about"),
            },
            {
              icon: Ics.File,
              text: "Terms & Privacy",
              action: () => setSettingsSheet("terms"),
            },
            {
              icon: Ics.Shield,
              text: "Security",
              action: () => setSettingsSheet("security"),
            },
            {
              icon: Ics.Trash,
              text: "Delete Account",
              red: true,
              action: () => setSettingsSheet("delete"),
            },
            {
              icon: Ics.Logout,
              text: "Logout",
              red: true,
              action: () => {
                // Reset app state on logout
                setSupportedPosts({});
                setPollVotes({});
                setLiveComments([]);
                setNewPostCreated(null);
                setNav("feed");
                go("phone");
              },
            },
          ].map((item, i, arr) => (
            <div
              key={i}
              onClick={item.action}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: item.red ? C.red : C.text,
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <div style={{ color: item.red ? C.red : C.text2 }}>
                  <item.icon />
                </div>
                {item.text}
              </div>
              {item.toggle && (
                <div
                  style={{
                    width: 44,
                    height: 24,
                    background: item.toggleOn ? C.purple : C.surface3,
                    borderRadius: 12,
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      background: "#fff",
                      borderRadius: "50%",
                      position: "absolute",
                      top: 2,
                      right: item.toggleOn ? 2 : "auto",
                      left: item.toggleOn ? "auto" : 2,
                      transition: "all 0.2s",
                    }}
                  />
                </div>
              )}
              {!item.toggle && (
                <div style={{ color: C.text2 }}>
                  <Ics.ChevRight />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings info sheet */}
        {settingsSheet && (
          <div
            onClick={() => setSettingsSheet(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 2000,
              display: "flex",
              alignItems: "flex-end",
              animation: "fadeIn 0.2s",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="slide-up"
              style={{
                background: C.surface,
                width: "100%",
                borderRadius: "20px 20px 0 0",
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                padding: "20px",
                maxHeight: "80%",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: C.surface3,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />
              {settingsSheet === "about" && (
                <>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      margin: "0 0 12px",
                    }}
                  >
                    About i²
                  </h3>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 12px",
                    }}
                  >
                    i² is a civic-engagement platform built on one idea: when
                    two voices square, they become louder than ten.
                  </p>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 12px",
                    }}
                  >
                    Raise issues in your area, support your neighbors' concerns,
                    and send private requests directly to your elected
                    representatives, all in one place.
                  </p>
                  <p
                    style={{ color: C.text3, fontSize: 12, margin: "12px 0 0" }}
                  >
                    Version 1.0.0 · Made in Hyderabad
                  </p>
                  <div style={{ height: 16 }} />
                  <Btn onClick={() => setSettingsSheet(null)}>Got it</Btn>
                </>
              )}
              {settingsSheet === "terms" && (
                <>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      margin: "0 0 12px",
                    }}
                  >
                    Terms & Privacy
                  </h3>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}
                  >
                    <strong style={{ color: C.text }}>Your data:</strong> We
                    collect only what's needed to verify you're a real resident
                    and route your requests to the right representative.
                  </p>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}
                  >
                    <strong style={{ color: C.text }}>Anonymous posts:</strong>{" "}
                    When you choose anonymous, your identity is never shown
                    publicly, but platform administrators retain audit access
                    for abuse prevention.
                  </p>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}
                  >
                    <strong style={{ color: C.text }}>
                      Personal requests:
                    </strong>{" "}
                    Shared only with the representative you select. Not visible
                    to other users.
                  </p>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}
                  >
                    Full terms at telangana-library.com/terms
                  </p>
                  <div style={{ height: 16 }} />
                  <Btn onClick={() => setSettingsSheet(null)}>Close</Btn>
                </>
              )}
              {settingsSheet === "security" && (
                <>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      margin: "0 0 12px",
                    }}
                  >
                    Security
                  </h3>
                  {[
                    { label: "Two-factor authentication", value: "Off" },
                    { label: "Login alerts", value: "On" },
                    { label: "Active sessions", value: "1 device" },
                    { label: "Last login", value: "Today, 9:41 AM" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{row.label}</span>
                      <span style={{ fontSize: 14, color: C.text2 }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div style={{ height: 20 }} />
                  <Btn onClick={() => setSettingsSheet(null)}>Close</Btn>
                </>
              )}
              {settingsSheet === "delete" && (
                <>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      margin: "0 0 12px",
                      color: C.red,
                    }}
                  >
                    Delete Account?
                  </h3>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 12px",
                    }}
                  >
                    This will permanently remove your profile, all issues you've
                    raised, and all support you've given. Your anonymous posts
                    will remain but cannot be traced back.
                  </p>
                  <p
                    style={{
                      color: C.text2,
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 20px",
                    }}
                  >
                    This action cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setSettingsSheet(null)}
                      style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: 12,
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: F.body,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setSettingsSheet(null);
                        go("phone");
                      }}
                      style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: 12,
                        background: C.red,
                        border: "none",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: F.body,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <BottomNav />
      </PhoneFrame>
    );

  // ── EDIT PROFILE ──
  if (screen === "edit_profile")
    return (
      <PhoneFrame>
        <Header title="Edit Profile" onBack={() => go("profile")} />
        <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <div
              onClick={() => alert("Photo upload coming soon")}
              role="button"
              tabIndex={0}
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: C.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {regData.name?.[0]?.toUpperCase() || "A"}
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  background: C.surface2,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${C.bg}`,
                  color: C.text,
                }}
              >
                <Ics.Edit />
              </div>
            </div>
          </div>

          <Input
            label="Mobile Number"
            value={regData.phone || "+91 9876543219"}
            disabled
          />
          <Input
            label="Full Name"
            value={regData.name || "Aditya Sharma"}
            onChange={(e) => setRegData({ ...regData, name: e.target.value })}
          />
          <Input
            label="Username"
            value={regData.username || "aditya_s"}
            onChange={(e) =>
              setRegData({ ...regData, username: e.target.value })
            }
          />
          <Input
            label="Residence"
            value={regData.residence || "Saraswathi Colony"}
            onChange={(e) =>
              setRegData({ ...regData, residence: e.target.value })
            }
            right={<Ics.Pin />}
          />

          <div style={{ marginBottom: 24 }}>
            <FileUpload label="Re-verify ID" fileName="Voter_ID.jpg" />
          </div>

          <Btn onClick={() => go("edit_success")}>Save Changes</Btn>
          <div style={{ height: 20 }} />
        </div>
      </PhoneFrame>
    );

  // ── EDIT SUCCESS ──
  if (screen === "edit_success")
    return (
      <PhoneFrame>
        <div
          style={{
            padding: "24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            className="scale-in"
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: C.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
            Profile updated
          </div>
          <div style={{ fontSize: 14, color: C.text2, marginBottom: 40 }}>
            Your changes have been saved.
          </div>
          <Btn onClick={() => go("profile")}>Back to Profile</Btn>
        </div>
      </PhoneFrame>
    );

  return null;
}
