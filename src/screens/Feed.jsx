import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Avatar, SeverityTag, I2Button, PostCardSkeleton, BottomSheet, Lightbox } from "../components/shared";
import { Ics, I2Logo } from "../components/icons";
import { C, F } from "../constants/theme";
import { AnimatedNumber } from "../lib/useCountUp";
import { timeAgo } from "../lib/timeAgo";
import { toast } from "../lib/toast";

const PAGE_SIZE = 20;

export default function Feed() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [feedTab, setFeedTab] = useState("speakup");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Critical");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [supportedPosts, setSupportedPosts] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [newPostsCount, setNewPostsCount] = useState(0);

  const residenceName = profile?.residence?.split(",")[0]?.trim() || "Your Area";

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(name, username, verified, residence, avatar_url)")
        .eq("type", "public")
        .is("merged_into", null)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const dbPosts = (data || []).map(p => ({
        id: p.id,
        cat: p.category,
        severity: p.severity,
        date: timeAgo(p.created_at),
        fullDate: new Date(p.created_at).toLocaleDateString("en-IN"),
        desc: p.description,
        status: p.status,
        agree: p.agree_count,
        comments: p.comments_count,
        type: "Public",
        author: p.anonymous ? "Anonymous" : (p.profiles?.name || "Citizen"),
        handle: p.anonymous ? "anonymous" : (p.profiles?.username || "citizen"),
        verified: !p.anonymous && !!p.profiles?.verified,
        avatar_url: p.anonymous ? null : (p.profiles?.avatar_url || null),
        photos: p.photos || [],
        area: p.area || "",
        author_id: p.author_id,
      }));

      setPosts(dbPosts);
      setNewPostsCount(0);
    } catch (e) {
      console.error("Feed fetch error:", e);
      toast("Couldn't load feed. Pull to retry.", "error");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase.channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts", filter: "type=eq.public" }, () => {
        setNewPostsCount(n => n + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
        // Targeted update — only update the changed post, no full reload
        const updated = payload.new;
        if (!updated) return;
        setPosts(prev => prev.map(p => {
          if (p.id !== updated.id) return p;
          return {
            ...p,
            agree: updated.agree_count ?? p.agree,
            comments: updated.comments_count ?? p.comments,
            status: updated.status ?? p.status,
          };
        }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false).then(({ count }) => setUnreadCount(count || 0));

    const channel = supabase.channel("notif-count-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        setUnreadCount(n => n + 1);
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("votes").select("post_id").eq("user_id", user.id).then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(v => { map[v.post_id] = true; });
        setSupportedPosts(map);
      }
    });
  }, [user]);

  const toggleSupport = async (postId) => {
    if (!user) return;
    const isSupported = supportedPosts[postId];
    // Optimistic update
    setSupportedPosts(prev => ({ ...prev, [postId]: !isSupported }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, agree: p.agree + (isSupported ? -1 : 1) } : p));

    try {
      if (isSupported) {
        const { error } = await supabase.from("votes").delete().eq("post_id", postId).eq("user_id", user.id);
        if (error) throw error;
      } else {
        toast("Your voice added");
        const { error } = await supabase.from("votes").insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (e) {
      // Rollback on failure
      setSupportedPosts(prev => ({ ...prev, [postId]: isSupported }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, agree: p.agree + (isSupported ? 1 : -1) } : p));
      toast("Action failed. Try again.", "error");
    }
  };

  const reportPost = async (postId) => {
    if (!user) return;
    try {
      await supabase.from("reports").insert({ post_id: postId, reporter_id: user.id, reason: "Flagged by user" });
      toast("Report submitted — we'll review it", "info");
    } catch {
      toast("Couldn't submit report. Try again.", "error");
    }
  };

  const sortPosts = (arr) => {
    const copy = [...arr];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return copy.filter(p => p.desc?.toLowerCase().includes(q) || p.cat?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q) || p.area?.toLowerCase().includes(q));
    }
    if (sortBy === "Critical") {
      const w = { Critical: 3, High: 2, Routine: 1 };
      return copy.sort((a, b) => (w[b.severity] || 0) - (w[a.severity] || 0) || b.agree - a.agree);
    }
    if (sortBy === "Trending") return copy.sort((a, b) => b.agree - a.agree);
    if (sortBy === "Unresolved") return copy.sort((a, b) => (a.status === "Resolved" ? 1 : 0) - (b.status === "Resolved" ? 1 : 0));
    return copy;
  };

  const filteredPosts = sortPosts(posts);
  const areaStats = {
    open: filteredPosts.filter(p => p.status === "Open" || p.status === "Pending").length,
    resolved: filteredPosts.filter(p => p.status === "Resolved").length,
  };
  const totalSignals = filteredPosts.reduce((s, p) => s + (p.agree || 0), 0);
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <PhoneFrame>
      {/* Header */}
      <div className="glass-header" style={{ padding: "10px 16px 0", borderBottom: `1px solid ${C.border}`, flexShrink: 0, position: "relative", zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>

          {/* Profile + Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: profile?.avatar_url ? "none" : C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: C.text, overflow: "hidden" }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile?.name?.[0]?.toUpperCase() || "A")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>Good to see you,</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{profile?.name?.split(" ")[0] || "Citizen"}</span>
                <I2Logo size={16} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Location label */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text, fontSize: 12, fontFamily: F.body, fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill={C.green}><circle cx="12" cy="12" r="5" /></svg>
              <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{residenceName}</span>
            </div>

            {/* Map */}
            <button onClick={() => navigate("/map")} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, cursor: "pointer" }}>
              <Ics.Pin />
            </button>
          </div>
        </div>

        {/* Search — collapses on scroll */}
        <div style={{ maxHeight: scrolled && !searchQuery ? 0 : 56, opacity: scrolled && !searchQuery ? 0 : 1, overflow: "hidden", marginBottom: scrolled && !searchQuery ? 0 : 12, transition: "max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s, margin-bottom 0.35s" }}>
          <div className="input-focus-glow" style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, borderRadius: 24, padding: "10px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ color: C.text2 }}><Ics.Search /></div>
            <input placeholder="Search issues, areas, categories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
            {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", display: "flex", padding: 0 }}><Ics.Close /></button>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {[{ id: "speakup", label: "Speak Up" }, { id: "representative", label: "From Your Rep" }].map(t => (
            <button key={t.id} onClick={() => setFeedTab(t.id)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", color: feedTab === t.id ? C.text : C.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", position: "relative", fontFamily: F.body }}>
              {t.label}
              {feedTab === t.id && <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 3, background: C.gradient, borderRadius: 2 }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none" }}
        onScroll={e => setScrolled(e.target.scrollTop > 60)}
        onTouchStart={e => { if (scrollRef.current?.scrollTop === 0) touchStartY.current = e.touches[0].clientY; }}
        onTouchMove={e => { if (!touchStartY.current) return; const d = e.touches[0].clientY - touchStartY.current; if (d > 0 && scrollRef.current?.scrollTop === 0) setPullDist(Math.min(d * 0.35, 70)); }}
        onTouchEnd={() => { if (pullDist > 45 && !refreshing) { setRefreshing(true); fetchPosts().then(() => setRefreshing(false)); toast("Feed refreshed"); } setPullDist(0); touchStartY.current = 0; }}>

        {/* Pull to refresh */}
        {(pullDist > 0 || refreshing) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: refreshing ? 50 : pullDist, overflow: "hidden", transition: pullDist > 0 ? "none" : "height 0.3s" }}>
            <div style={{ opacity: Math.min((pullDist || (refreshing ? 45 : 0)) / 45, 1), transform: refreshing ? "scale(1)" : `scale(${Math.min(pullDist / 60, 1)})`, animation: refreshing ? "pulse1 1s ease-in-out infinite" : "none", transition: refreshing ? "opacity 0.2s" : "none" }}>
              <I2Logo size={26} />
            </div>
          </div>
        )}

        {feedTab === "speakup" && (
          <>
            {/* Stats */}
            {!postsLoading && filteredPosts.length > 0 && (
              <div className="fade-in" style={{ margin: "12px 16px", padding: "14px 16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.purple}25 0%, ${C.accent}15 100%)`, border: `1px solid ${C.purple}40`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}40, transparent)`, filter: "blur(20px)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>{residenceName}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                    {[{ val: areaStats.open, label: "Open\nissues", color: C.text }, { val: areaStats.resolved, label: "Resolved", color: C.green }, { val: totalSignals, label: "i²\nsignals", color: C.purple, format: fmt }].map((stat, i) => (
                      <div key={i} style={{ flex: 1, ...(i > 0 ? { borderLeft: `1px solid ${C.border}`, paddingLeft: 10 } : {}) }}>
                        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: stat.color, fontFamily: F.body }}><AnimatedNumber value={stat.val} format={stat.format} /></div>
                        <div style={{ fontSize: 10, color: C.text2, fontWeight: 600, marginTop: 4, lineHeight: 1.2, fontFamily: F.body, whiteSpace: "pre-line" }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* New posts banner */}
            {newPostsCount > 0 && (
              <div onClick={fetchPosts} className="fade-in" style={{ margin: "8px 16px 0", padding: "10px 16px", borderRadius: 24, background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center", cursor: "pointer", fontFamily: F.body, boxShadow: "0 4px 20px rgba(120,86,255,0.4)" }}>
                ↑ {newPostsCount} new {newPostsCount === 1 ? "issue" : "issues"} — tap to load
              </div>
            )}

            {/* Sort */}
            <div style={{ padding: "4px 16px 8px", display: "flex", gap: 8, overflowX: "auto", borderBottom: `1px solid ${C.border}` }}>
              {[{ id: "Critical", label: "Critical first", Icon: Ics.Alert, iconColor: C.critical }, { id: "Trending", label: "Trending", Icon: Ics.TrendUp }, { id: "Recent", label: "Recent", Icon: Ics.Clock }, { id: "Unresolved", label: "Unresolved", Icon: Ics.Hourglass }].map(s => (
                <div key={s.id} onClick={() => setSortBy(s.id)} style={{ padding: "6px 12px", borderRadius: 999, background: sortBy === s.id ? C.purple : C.surface2, color: sortBy === s.id ? "#fff" : C.text2, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${sortBy === s.id ? C.purple : C.border}`, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: sortBy === s.id ? "#fff" : s.iconColor || C.text2, display: "flex" }}><s.Icon /></span>
                  {s.label}
                </div>
              ))}
            </div>

            {postsLoading ? (
              Array(4).fill(0).map((_, i) => <PostCardSkeleton key={i} />)
            ) : filteredPosts.length === 0 ? (
              <EmptyFeedState onSpeak={() => setCreateModalOpen(true)} />
            ) : filteredPosts.map((p, idx) => (
              <PostCard key={p.id} p={{ ...p, _onLightbox: setLightboxSrc }} onClick={() => navigate("/post/" + p.id, { state: { post: p } })} supported={!!supportedPosts[p.id]} onSupport={() => toggleSupport(p.id)} onReport={() => reportPost(p.id)} listIndex={idx} />
            ))}
          </>
        )}

        {feedTab === "representative" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}20, ${C.purple}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse1 3s ease-in-out infinite" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: F.body, letterSpacing: -0.3 }}>Your rep, in your pocket.</div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.5, fontFamily: F.body, maxWidth: 280, margin: "0 auto 16px" }}>Official posts, polls, and updates from your elected representatives will appear here once they join i².</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: C.accentDim, color: C.accent, fontSize: 12, fontWeight: 700, fontFamily: F.body }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Coming soon
            </div>
          </div>
        )}
      </div>

      <BottomNav active="feed" unreadCount={unreadCount} onCreateClick={() => setCreateModalOpen(true)} onNotifClick={() => { setUnreadCount(0); navigate("/notifications"); }} />

      {/* Create modal */}
      <BottomSheet open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <div style={{ padding: "0 0 16px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: F.body }}>What's on your mind?</div>
          <div style={{ fontSize: 13, color: C.text2, marginTop: 4, fontFamily: F.body }}>Choose how to make your voice count</div>
        </div>
        {[{ type: "public", Icon: () => <Ics.SpeakUp a={true} />, iconBg: C.purpleDim, iconColor: C.purple, title: "Speak Up", desc: "Post publicly — your neighbors can rally behind it with i².", example: "e.g. broken road, water leak, overflowing garbage" },
          { type: "private", Icon: () => <Ics.Rep a={true} />, iconBg: "rgba(29,155,240,0.15)", iconColor: C.accent, title: "Personal Request", desc: "A direct, private message to your MLA, MP, or Corporator.", example: "e.g. ration card, pension scheme, certificate request" }].map(opt => (
          <div key={opt.type} onClick={() => { setCreateModalOpen(false); navigate("/create", { state: { type: opt.type } }); }} style={{ display: "flex", gap: 12, padding: "16px 0", cursor: "pointer", borderTop: `1px solid ${C.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: opt.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: opt.iconColor, flexShrink: 0 }}><opt.Icon /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, fontFamily: F.body }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.4, fontFamily: F.body }}>{opt.desc}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 3, fontStyle: "italic", fontFamily: F.body }}>{opt.example}</div>
            </div>
            <div style={{ color: C.text2, display: "flex", alignItems: "center" }}><Ics.ChevRight /></div>
          </div>
        ))}
      </BottomSheet>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </PhoneFrame>
  );
}

/* ── World-class empty state ── */
function EmptyFeedState({ onSpeak }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}30, ${C.accent}15)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulse1 3s ease-in-out infinite", boxShadow: `0 0 40px ${C.purple}25` }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, fontFamily: F.body, letterSpacing: -0.5, color: C.text }}>Be the first voice.</div>
      <div style={{ color: C.text2, fontSize: 15, lineHeight: 1.6, fontFamily: F.body, marginBottom: 8, maxWidth: 280, margin: "0 auto 8px" }}>
        Your neighborhood is quiet — which means one voice can start everything.
      </div>
      <div style={{ color: C.text3, fontSize: 13, lineHeight: 1.5, fontFamily: F.body, maxWidth: 260, margin: "0 auto 28px" }}>
        Raise a civic issue. Your neighbors will see it, support it, and together you'll get it fixed.
      </div>
      <button onClick={onSpeak} style={{ padding: "14px 32px", borderRadius: 28, background: C.gradient, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body, boxShadow: "0 6px 24px rgba(120,86,255,0.35)", letterSpacing: -0.2 }}>
        Speak Up
      </button>
    </div>
  );
}

const CAT_ICON = { Water: "💧", Roads: "🛣️", Electricity: "⚡", Sanitation: "🗑️", Parks: "🌳", Traffic: "🚦", Safety: "🔒", Drainage: "🌊", Waste: "♻️", Noise: "📢", "Public Property": "🏛️", Infrastructure: "🏗️", Other: "📌" };

/* ── Streamlined Post Card ── */
const MILESTONES = [10, 25, 50, 100, 200];
const CONFETTI_PARTS = [
  { x: -28, y: -28, c: "#7856FF", s: 10, d: 0 },   { x: -8,  y: -38, c: "#1D9BF0", s:  8, d: 0.06 },
  { x:  16, y: -34, c: "#FFB020", s: 12, d: 0.03 }, { x:  34, y: -18, c: "#00BA7C", s:  8, d: 0.09 },
  { x:  40, y:   4, c: "#7856FF", s: 10, d: 0.12 }, { x:  32, y:  24, c: "#EC4899", s:  8, d: 0.07 },
  { x:  10, y:  34, c: "#1D9BF0", s: 10, d: 0.15 }, { x: -14, y:  32, c: "#FFB020", s:  8, d: 0.04 },
  { x: -32, y:  20, c: "#00BA7C", s: 12, d: 0.10 }, { x: -38, y:  -2, c: "#EC4899", s:  8, d: 0.08 },
  { x:   2, y: -42, c: "#7856FF", s:  7, d: 0.13 }, { x:  26, y: -10, c: "#FFB020", s:  9, d: 0.02 },
];

function PostCard({ p, onClick, onSupport, onReport, supported, listIndex = 0 }) {
  const [sparks, setSparks] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSupport = (e) => {
    e.stopPropagation();
    if (!supported) {
      setSparks(true);
      setTimeout(() => setSparks(false), 700);
      if (MILESTONES.includes(p.agree + 1)) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1000);
        toast(`🎉 ${p.agree + 1} voices united!`, "success");
      }
    }
    if (navigator.vibrate) navigator.vibrate(12);
    onSupport();
  };

  const heatClass = p.agree >= 50 ? "heat-hot" : p.agree >= 25 ? "heat-warm" : p.agree >= 10 ? "heat-rising" : "";
  const heatIcon = p.agree >= 50 ? "🔥" : p.agree >= 25 ? "⚡" : p.agree >= 10 ? "📈" : null;
  const isCritical = p.severity === "Critical";

  const shareWhatsApp = () => {
    const text = `🚨 Civic issue: ${p.cat}\n\n${p.desc?.slice(0, 160)}\n\n${p.agree} people have spoken up. Join them on i².\n${window.location.origin}/post/${p.id}`;
    if (navigator.share) navigator.share({ title: "i² — Civic Issue", text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <article onClick={onClick} className={`pressable${heatClass ? ` ${heatClass}` : ""}`} style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", gap: 12, position: "relative", borderLeft: isCritical ? `3px solid ${C.critical}` : "3px solid transparent", animation: `listIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(listIndex * 50, 300)}ms both` }}>
      <Avatar name={p.author} src={p.avatar_url} verified={p.verified} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name line */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center", minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: F.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.author}</span>
            {p.verified && <Ics.Badge />}
            <span style={{ color: C.text3, fontSize: 12, fontFamily: F.body, flexShrink: 0 }}>· {p.date}</span>
          </div>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ background: "none", border: "none", color: C.text3, cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}><Ics.More /></button>
        </div>

        {/* Area + tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ color: C.text2, fontSize: 12, fontFamily: F.body, display: "flex", alignItems: "center", gap: 3 }}>
            <Ics.Pin />{p.area || "Nearby"}
          </span>
          <span style={{ color: C.text3 }}>·</span>
          <SeverityTag level={p.severity} blink={isCritical} />
          <span style={{ padding: "2px 7px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 10, fontWeight: 600, fontFamily: F.body }}>{CAT_ICON[p.cat] ? `${CAT_ICON[p.cat]} ` : ""}{p.cat}</span>
        </div>

        {/* Description */}
        <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.5, color: C.text, fontFamily: F.body, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>

        {/* Photo */}
        {p.photos?.[0] && (
          <div onClick={e => { e.stopPropagation(); p._onLightbox?.(p.photos[0]); }} style={{ width: "100%", height: 200, borderRadius: 14, overflow: "hidden", marginBottom: 10, border: `1px solid ${C.border}`, cursor: "zoom-in", position: "relative" }}>
            {!imgLoaded && <div className="skeleton" style={{ position: "absolute", inset: 0 }} />}
            <img src={p.photos[0]} alt="" onLoad={() => setImgLoaded(true)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s" }} />
          </div>
        )}

        {/* Action bar */}
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <I2Button active={supported} count={p.agree} onClick={handleSupport} />
            {sparks && !confetti && [
              { x: -6, y: -10, color: C.purple, size: 12, delay: 0 },
              { x: 8,  y: -14, color: C.accent, size: 10, delay: 0.05 },
              { x: 20, y: -8,  color: C.amber,  size: 14, delay: 0.1 },
              { x: -4, y: 4,   color: C.purple, size: 8,  delay: 0.07 },
              { x: 22, y: 6,   color: C.green,  size: 10, delay: 0.13 },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", top: s.y, left: s.x, pointerEvents: "none", color: s.color, animation: `sparkle 0.7s ease-out ${s.delay}s forwards` }}>
                <Ics.Spark size={s.size} />
              </div>
            ))}
            {confetti && CONFETTI_PARTS.map((cp, i) => (
              <div key={i} style={{ position: "absolute", top: cp.y, left: cp.x, width: cp.s, height: cp.s, borderRadius: i % 3 === 0 ? "50%" : 2, background: cp.c, animation: `confettiBurst 0.9s ease-out ${cp.d}s forwards`, pointerEvents: "none" }} />
            ))}
          </div>
          {heatIcon && <span style={{ fontSize: 14 }}>{heatIcon}</span>}
          <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text2, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
            <Ics.Comment />{p.comments}
          </button>
        </div>

        {/* Inline menu */}
        {menuOpen && (
          <>
            <div onClick={e => { e.stopPropagation(); setMenuOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            <div className="slide-up" onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 16, top: 40, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.6)", overflow: "hidden", zIndex: 100, minWidth: 160 }}>
              {[{ label: "Share on WhatsApp", icon: "💬", action: shareWhatsApp },
                { label: "Copy link", icon: "🔗", action: async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/post/${p.id}`); toast("Link copied"); } catch {} } },
                { label: "Report issue", icon: "⚠️", action: () => { setMenuOpen(false); onReport(); } }].map((item, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setMenuOpen(false); item.action(); }} style={{ width: "100%", padding: "11px 14px", background: "none", border: "none", borderTop: i > 0 ? `1px solid ${C.border}` : "none", color: C.text, fontSize: 13, fontWeight: 500, textAlign: "left", cursor: "pointer", fontFamily: F.body, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/* ── Bottom Navigation ── */
function BottomNav({ active, unreadCount = 0, onCreateClick, onNotifClick }) {
  const navigate = useNavigate();
  return (
    <div className="glass-nav" style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      {[{ id: "feed", label: "Home", Icon: Ics.Home, path: "/feed" },
        { id: "notifications", label: "Alerts", Icon: Ics.Bell, path: "/notifications", badge: unreadCount },
        { id: "create", label: "Create", isCreate: true },
        { id: "voice", label: "My Voice", Icon: Ics.Voice, path: "/voice" }].map(n => {
        const isActive = active === n.id;
        if (n.isCreate) return (
          <button key="create" onClick={onCreateClick || (() => navigate("/create"))} aria-label="Create" style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52, color: C.text, position: "relative" }}>
            <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 56, height: 28, borderRadius: "0 0 28px 28px", background: C.bg, border: `1px solid ${C.border}`, borderTop: "none", pointerEvents: "none" }} />
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(120,86,255,0.45), 0 0 0 3px ${C.bg}`, marginTop: -12, position: "relative", zIndex: 1 }}><Ics.Plus /></div>
            <span style={{ fontSize: 9, fontWeight: 600, color: C.text2, position: "relative", zIndex: 1, fontFamily: F.body }}>Create</span>
          </button>
        );
        const handleClick = () => {
          if (navigator.vibrate) navigator.vibrate(8);
          if (n.id === "notifications" && onNotifClick) { onNotifClick(); return; }
          navigate(n.path);
        };
        return (
          <button key={n.id} onClick={handleClick} style={{ background: "none", border: "none", color: isActive ? C.purple : C.text2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52, transition: "color 0.2s", position: "relative" }}>
            <div className={isActive ? "nav-active-icon" : ""} style={{ display: "flex", position: "relative" }}>
              <n.Icon a={isActive} />
              {n.badge > 0 && (
                <div style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", padding: "0 4px", border: `2px solid ${C.bg}` }}>
                  {n.badge > 9 ? "9+" : n.badge}
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, fontFamily: F.body }}>{n.label}</span>
            {isActive && <div style={{ position: "absolute", bottom: -4, width: 4, height: 4, borderRadius: "50%", background: C.purple }} />}
          </button>
        );
      })}
    </div>
  );
}
