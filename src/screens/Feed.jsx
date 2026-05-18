import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Avatar, StatusBadge, SeverityTag, I2Button, PostCardSkeleton, BottomSheet, Lightbox } from "../components/shared";
import { Ics, I2Logo } from "../components/icons";
import { C, F } from "../constants/theme";
import { toast } from "../lib/toast";

const LOCATIONS = [
  { id: "saraswathi", name: "Saraswathi Colony", full: "Saraswathi Colony, Uppal, Hyderabad" },
  { id: "quthbullapur", name: "Quthbullapur", full: "Quthbullapur, Hyderabad, Telangana" },
  { id: "medchal", name: "Medchal Malkajgiri", full: "Medchal Malkajgiri, Telangana" },
];

export default function Feed() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const [feedTab, setFeedTab] = useState("speakup");
  const [activeLocId, setActiveLocId] = useState("resident");
  const [activeLoc, setActiveLoc] = useState(LOCATIONS[0]);
  const [locDropdown, setLocDropdown] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
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

  const [newPostsCount, setNewPostsCount] = useState(0);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(name, username, verified, residence, avatar_url)")
      .eq("type", "public")
      .is("merged_into", null)
      .order("created_at", { ascending: false });

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
      photos: p.photos || [],
      area: p.area || "",
      author_id: p.author_id,
    }));

    setPosts(dbPosts);
    setPostsLoading(false);
    setNewPostsCount(0);
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase.channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts", filter: "type=eq.public" }, () => {
        setNewPostsCount(n => n + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, () => fetchPosts())
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
    // Load user's votes
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
    setSupportedPosts(prev => ({ ...prev, [postId]: !isSupported }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, agree: p.agree + (isSupported ? -1 : 1) } : p));

    if (isSupported) {
      await supabase.from("votes").delete().eq("post_id", postId).eq("user_id", user.id);
      await supabase.from("posts").update({ agree_count: posts.find(p => p.id === postId)?.agree - 1 }).eq("id", postId);
    } else {
      toast("Your voice added");
      await supabase.from("votes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("posts").update({ agree_count: (posts.find(p => p.id === postId)?.agree || 0) + 1 }).eq("id", postId);
    }
  };

  const sortPosts = (arr) => {
    const copy = [...arr];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return copy.filter(p => p.desc?.toLowerCase().includes(q) || p.cat?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q));
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

  const sharePost = (post) => {
    const text = `🚨 Civic issue in your area!\n\n*${post.cat}*: ${post.desc?.slice(0, 160)}\n\n${post.agree} people have spoken up. Join them on i² — Your Voice, Your City.\n${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: "i² — Civic Issue", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <PhoneFrame>
      {/* Header */}
      <div style={{ padding: "10px 16px 0", borderBottom: `1px solid ${C.border}`, flexShrink: 0, position: "relative", zIndex: 50, background: C.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>

          {/* Profile */}
          <div onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: C.text }}>
              {profile?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>Welcome back,</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{profile?.name?.split(" ")[0] || "Citizen"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Location */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setLocDropdown(!locDropdown)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={C.green}><circle cx="12" cy="12" r="5" /></svg>
                <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeLoc.name}</span>
                <Ics.ChevDown />
              </button>

              {locDropdown && (
                <>
                  <div onClick={() => setLocDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 190 }} />
                  <div className="slide-up" style={{ position: "absolute", top: 40, right: 0, width: 280, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.8)", overflow: "hidden", zIndex: 200 }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text2, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Choose location</div>
                    {[{ id: "resident", label: "My Residence", sub: activeLoc.name, icon: <Ics.Shield /> },
                      { id: "current", label: "Where I am now", sub: "GPS-based nearby issues", icon: <Ics.Pin /> }].map(opt => (
                      <div key={opt.id} onClick={() => { setActiveLocId(opt.id); if (opt.id === "current") setActiveLoc({ id: "current", name: "Current Area", full: "GPS-based" }); else setActiveLoc(LOCATIONS[0]); setLocDropdown(false); }} style={{ padding: "12px 16px", cursor: "pointer", background: activeLocId === opt.id ? C.purpleDim : "transparent", borderTop: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ color: activeLocId === opt.id ? C.purple : C.text2 }}>{opt.icon}</div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{opt.label}</div>
                              <div style={{ fontSize: 11, color: C.text2, fontFamily: F.body }}>{opt.sub}</div>
                            </div>
                          </div>
                          {activeLocId === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.purple }} />}
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: C.surface3 }}>
                      <button onClick={() => { setLocationSheetOpen(true); setLocDropdown(false); }} style={{ background: "none", border: "none", color: C.purple, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: F.body }}>
                        How location works <Ics.Info />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Map */}
            <button onClick={() => navigate("/map")} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, cursor: "pointer" }}>
              <Ics.Pin />
            </button>

            {/* Notifications */}
            <button onClick={() => navigate("/notifications")} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, cursor: "pointer", position: "relative" }}>
              <Ics.Bell />
              {unreadCount > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: C.red, border: `2px solid ${C.surface2}` }} />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, borderRadius: 24, padding: "10px 16px", marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.text2 }}><Ics.Search /></div>
          <input placeholder="Search issues in your area..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
          {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", display: "flex", padding: 0 }}><Ics.Close /></button>}
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
        onTouchStart={e => { if (scrollRef.current?.scrollTop === 0) touchStartY.current = e.touches[0].clientY; }}
        onTouchMove={e => { if (!touchStartY.current) return; const d = e.touches[0].clientY - touchStartY.current; if (d > 0 && scrollRef.current?.scrollTop === 0) setPullDist(Math.min(d * 0.35, 70)); }}
        onTouchEnd={() => { if (pullDist > 45 && !refreshing) { setRefreshing(true); fetchPosts().then(() => setRefreshing(false)); toast("Feed refreshed"); } setPullDist(0); touchStartY.current = 0; }}>

        {/* Pull to refresh indicator */}
        {(pullDist > 0 || refreshing) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: refreshing ? 50 : pullDist, overflow: "hidden", transition: pullDist > 0 ? "none" : "height 0.3s" }}>
            <div style={{ width: 24, height: 24, border: `2px solid ${C.purple}`, borderTop: `2px solid transparent`, borderRadius: "50%", animation: refreshing ? "pullSpin 0.6s linear infinite" : "none", transform: !refreshing ? `rotate(${pullDist * 4}deg)` : undefined, opacity: Math.min(pullDist / 50, 1) }} />
          </div>
        )}

        {feedTab === "speakup" && (
          <>
            {/* Stats */}
            {!postsLoading && filteredPosts.length > 0 && (
              <div className="fade-in" style={{ margin: "12px 16px", padding: "14px 16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.purple}25 0%, ${C.accent}15 100%)`, border: `1px solid ${C.purple}40`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}40, transparent)`, filter: "blur(20px)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8, fontFamily: F.body }}>Your area · {activeLoc.name}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                    {[{ val: areaStats.open, label: "Open\nissues", color: C.text }, { val: areaStats.resolved, label: "Resolved\nthis week", color: C.green }, { val: fmt(totalSignals), label: "i²\nsignals", color: C.purple }].map((stat, i) => (
                      <div key={i} style={{ flex: 1, ...(i > 0 ? { borderLeft: `1px solid ${C.border}`, paddingLeft: 10 } : {}) }}>
                        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: stat.color, fontFamily: F.body }}>{stat.val}</div>
                        <div style={{ fontSize: 10, color: C.text2, fontWeight: 600, marginTop: 4, lineHeight: 1.2, fontFamily: F.body, whiteSpace: "pre-line" }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* New posts banner */}
            {newPostsCount > 0 && (
              <div onClick={fetchPosts} className="fade-in" style={{ margin: "8px 16px 0", padding: "10px 16px", borderRadius: 24, background: C.gradient, color: C.text, fontSize: 13, fontWeight: 700, textAlign: "center", cursor: "pointer", fontFamily: F.body, boxShadow: "0 4px 20px rgba(120,86,255,0.4)" }}>
                ↑ {newPostsCount} new {newPostsCount === 1 ? "issue" : "issues"} — tap to load
              </div>
            )}

            {/* Sort */}
            <div style={{ padding: "4px 16px 8px", display: "flex", gap: 8, overflowX: "auto", borderBottom: `1px solid ${C.border}` }}>
              {[{ id: "Critical", label: "Critical near me", Icon: Ics.Alert, iconColor: C.critical }, { id: "Trending", label: "Trending", Icon: Ics.TrendUp }, { id: "Recent", label: "Recent", Icon: Ics.Clock }, { id: "Unresolved", label: "Unresolved", Icon: Ics.Hourglass }].map(s => (
                <div key={s.id} onClick={() => setSortBy(s.id)} style={{ padding: "6px 12px", borderRadius: 999, background: sortBy === s.id ? C.gradient : C.surface2, color: sortBy === s.id ? C.text : C.text2, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${sortBy === s.id ? "transparent" : C.border}`, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: sortBy === s.id ? C.text : s.iconColor || C.text2, display: "flex" }}><s.Icon /></span>
                  {s.label}
                </div>
              ))}
            </div>

            {postsLoading ? (
              Array(4).fill(0).map((_, i) => <PostCardSkeleton key={i} />)
            ) : filteredPosts.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}20, ${C.accent}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulse1 3s ease-in-out infinite" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: F.body, letterSpacing: -0.3 }}>Your neighborhood is quiet</div>
                <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.5, fontFamily: F.body, marginBottom: 20, maxWidth: 260, margin: "0 auto 20px" }}>Be the first to raise a civic issue. One voice starts the movement.</div>
                <button onClick={() => setCreateModalOpen(true)} style={{ padding: "12px 28px", borderRadius: 24, background: C.gradient, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body, boxShadow: "0 4px 20px rgba(120,86,255,0.3)" }}>Speak Up</button>
              </div>
            ) : filteredPosts.map((p, idx) => (
              <PostCard key={p.id} p={{ ...p, _onLightbox: setLightboxSrc }} onClick={() => navigate("/post/" + p.id, { state: { post: p } })} supported={!!supportedPosts[p.id]} onSupport={() => toggleSupport(p.id)} onShare={() => sharePost(p)} blinkCritical={idx === filteredPosts.findIndex(x => x.severity === "Critical")} />
            ))}
          </>
        )}

        {feedTab === "representative" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}20, ${C.purple}10)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "pulse1 3s ease-in-out infinite" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: F.body, letterSpacing: -0.3 }}>Representative updates</div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.5, fontFamily: F.body, maxWidth: 280, margin: "0 auto 16px" }}>Verified posts and polls from your elected officials will appear here once they join i².</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: C.accentDim, color: C.accent, fontSize: 12, fontWeight: 700, fontFamily: F.body }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Coming soon
            </div>
          </div>
        )}
      </div>

      <BottomNav active="feed" onCreate={() => setCreateModalOpen(true)} />

      {/* Location sheet */}
      <BottomSheet open={locationSheetOpen} onClose={() => setLocationSheetOpen(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px", fontFamily: F.body }}>How location works</h3>
        {[{ icon: <Ics.Shield />, title: "My Residence", desc: "Issues in the area where you're a verified resident. Your reports route to your registered MLA and Corporator." }, { icon: <Ics.Pin />, title: "Where I am now", desc: "Issues within 2 km of your current GPS location. Useful when visiting another area." }].map((item, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <div style={{ color: C.purple }}>{item.icon}</div>
              <strong style={{ fontSize: 14, fontFamily: F.body }}>{item.title}</strong>
            </div>
            <p style={{ margin: 0, color: C.text2, fontSize: 13, lineHeight: 1.5, paddingLeft: 28, fontFamily: F.body }}>{item.desc}</p>
          </div>
        ))}
        <div style={{ height: 16 }} />
        <button onClick={() => setLocationSheetOpen(false)} style={{ width: "100%", padding: "15px", borderRadius: 12, background: C.gradient, color: C.text, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Got it</button>
      </BottomSheet>

      {/* Create modal */}
      <BottomSheet open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <div style={{ padding: "0 0 16px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: F.body }}>What do you want to do?</div>
          <div style={{ fontSize: 13, color: C.text2, marginTop: 4, fontFamily: F.body }}>Choose how your message is shared</div>
        </div>
        {[{ type: "public", Icon: () => <Ics.SpeakUp a={true} />, iconBg: C.purpleDim, iconColor: C.purple, title: "Speak Up", desc: "Share an issue publicly. Neighbors can support it. Bigger voice = faster action." },
          { type: "private", Icon: () => <Ics.Rep a={true} />, iconBg: "rgba(29,155,240,0.15)", iconColor: C.accent, title: "Personal Request", desc: "Private message to your MLA, MP, or Corporator. Only they see it." }].map(opt => (
          <div key={opt.type} onClick={() => { setCreateModalOpen(false); navigate("/create", { state: { type: opt.type } }); }} style={{ display: "flex", gap: 12, padding: "16px 0", cursor: "pointer", borderTop: `1px solid ${C.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: opt.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: opt.iconColor, flexShrink: 0 }}><opt.Icon /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, fontFamily: F.body }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.4, fontFamily: F.body }}>{opt.desc}</div>
            </div>
            <div style={{ color: C.text2, display: "flex", alignItems: "center" }}><Ics.ChevRight /></div>
          </div>
        ))}
      </BottomSheet>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </PhoneFrame>
  );
}

function PostCard({ p, onClick, onSupport, onShare, supported, blinkCritical }) {
  const [sparks, setSparks] = useState(false);
  const handleSupport = (e) => {
    e.stopPropagation();
    if (!supported) { setSparks(true); setTimeout(() => setSparks(false), 600); }
    onSupport();
  };
  const heatClass = p.agree >= 50 ? "heat-hot" : p.agree >= 25 ? "heat-warm" : p.agree >= 10 ? "heat-rising" : "";
  const heatIcon = p.agree >= 50 ? "🔥" : p.agree >= 25 ? "⚡" : p.agree >= 10 ? "📈" : null;

  const shareWhatsApp = (e) => {
    e.stopPropagation();
    const text = `🚨 Civic issue in your area!\n\n*${p.cat}*: ${p.desc?.slice(0, 160)}\n\n${p.agree} people have spoken up. Join them on i².\n${window.location.origin}/post/${p.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <article onClick={onClick} className={heatClass} style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", gap: 12, position: "relative", transition: "border-color 0.3s" }}>
      <Avatar name={p.author} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: F.body }}>{p.author}</span>
            {p.verified && <Ics.Badge />}
            <span style={{ color: C.text2, fontSize: 13, fontFamily: F.body }}>· {p.date}</span>
          </div>
        </div>
        <div style={{ color: C.text2, fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontFamily: F.body }}>
          <Ics.Pin /> <span>{p.area || "Nearby"} · @{p.handle}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <SeverityTag level={p.severity} blink={blinkCritical} />
          <span style={{ padding: "2px 8px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 11, fontWeight: 600, fontFamily: F.body }}>{p.cat}</span>
          <StatusBadge status={p.status} />
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.5, color: C.text, fontFamily: F.body }}>{p.desc}</p>
        {p.photos?.[0] && (
          <div onClick={e => { e.stopPropagation(); p._onLightbox?.(p.photos[0]); }} style={{ width: "100%", height: 200, borderRadius: 14, overflow: "hidden", marginBottom: 12, border: `1px solid ${C.border}`, cursor: "zoom-in" }}>
            <img src={p.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s" }} />
          </div>
        )}
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <I2Button active={supported} count={p.agree} onClick={handleSupport} />
            {sparks && [0, 1, 2].map(i => (
              <div key={i} style={{ position: "absolute", top: 0, left: 12 + i * 8, pointerEvents: "none", color: i === 0 ? C.purple : i === 1 ? C.accent : C.amber, animation: `sparkle 0.6s ease-out ${i * 0.1}s forwards` }}>
                <Ics.Spark size={10 + i * 2} />
              </div>
            ))}
          </div>
          {heatIcon && <span style={{ fontSize: 14 }}>{heatIcon}</span>}
          <button onClick={e => { e.stopPropagation(); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text2, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
            <Ics.Comment />{p.comments}
          </button>
          <button onClick={shareWhatsApp} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 10px", color: C.green, cursor: "pointer", fontFamily: F.body, fontWeight: 700, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.green}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.504 5.812L0 24l6.335-1.482A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.384l-.36-.214-3.732.873.936-3.617-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            Share
          </button>
        </div>
      </div>
    </article>
  );
}

function BottomNav({ active, onCreate }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 20px", borderTop: `1px solid ${C.border}`, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", flexShrink: 0 }}>
      {[{ id: "feed", label: "Home", Icon: Ics.Home },
        { id: "create", label: "Create", isCreate: true },
        { id: "voice", label: "My Voice", Icon: Ics.Voice }].map(n => {
        const isActive = active === n.id;
        if (n.isCreate) return (
          <button key="create" onClick={onCreate} aria-label="Create" style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60, color: C.text, position: "relative" }}>
            <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", width: 64, height: 32, borderRadius: "0 0 32px 32px", background: C.bg, border: `1px solid ${C.border}`, borderTop: "none", pointerEvents: "none" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(120,86,255,0.45), 0 0 0 3px ${C.bg}`, marginTop: -14, position: "relative", zIndex: 1 }}><Ics.Plus /></div>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text2, position: "relative", zIndex: 1, fontFamily: F.body }}>Create</span>
          </button>
        );
        return (
          <button key={n.id} onClick={() => { if (navigator.vibrate) navigator.vibrate(8); navigate("/" + (n.id === "feed" ? "feed" : n.id)); }} style={{ background: "none", border: "none", color: isActive ? C.purple : C.text2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60, transition: "color 0.2s", position: "relative" }}>
            <div className={isActive ? "nav-active-icon" : ""} style={{ display: "flex" }}>
              <n.Icon a={isActive} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.body }}>{n.label}</span>
            {isActive && <div style={{ position: "absolute", bottom: -4, width: 4, height: 4, borderRadius: "50%", background: C.gradient }} />}
          </button>
        );
      })}
    </div>
  );
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
