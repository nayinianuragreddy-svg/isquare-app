import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Avatar, StatusBadge, SeverityTag, I2Button, PostCardSkeleton, BottomSheet } from "../components/shared";
import { Ics, I2Logo } from "../components/icons";
import { C, F } from "../constants/theme";
import { MOCK_POSTS, MOCK_REP_POSTS } from "../data/mockData";

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
  const [pollVotes, setPollVotes] = useState({});
  const [unreadCount, setUnreadCount] = useState(3);

  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(name, username, verified, residence)")
      .eq("type", "public")
      .order("created_at", { ascending: false });

    const dbPosts = (data || []).map(p => ({
      id: p.id,
      locId: "resident",
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
      verified: !p.anonymous && p.profiles?.verified,
      distance: "0.5 km",
      img: p.image_url,
    }));

    const allPosts = [...dbPosts, ...MOCK_POSTS];
    setPosts(allPosts);
    setPostsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    // Real-time subscription for new posts
    const channel = supabase.channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, () => fetchPosts())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchPosts]);

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
      await supabase.from("votes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("posts").update({ agree_count: (posts.find(p => p.id === postId)?.agree || 0) + 1 }).eq("id", postId);
    }
  };

  const sortPosts = (arr) => {
    const copy = [...arr].filter(p => p.locId === activeLocId);
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
  const filteredReps = MOCK_REP_POSTS.filter(f => f.locId === activeLocId);
  const areaStats = {
    open: filteredPosts.filter(p => p.status === "Open" || p.status === "Pending").length,
    resolved: filteredPosts.filter(p => p.status === "Resolved").length + 3,
  };
  const totalSignals = filteredPosts.reduce((s, p) => s + (p.agree || 0), 0);
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  const sharePost = async (post) => {
    const text = `i² · ${post.cat} issue: ${post.desc?.slice(0, 120)}...`;
    try {
      if (navigator.share) await navigator.share({ title: "i² — Your Voice, Your City", text });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); }
    } catch {}
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
      <div style={{ flex: 1, overflowY: "auto" }}>
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
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: F.body }}>No issues yet</div>
                <div style={{ color: C.text2, fontSize: 14, fontFamily: F.body }}>Be the first to speak up about your area.</div>
              </div>
            ) : filteredPosts.map((p, idx) => (
              <PostCard key={p.id} p={p} onClick={() => navigate("/post/" + p.id, { state: { post: p } })} supported={!!supportedPosts[p.id]} onSupport={() => toggleSupport(p.id)} onShare={() => sharePost(p)} blinkCritical={idx === filteredPosts.findIndex(x => x.severity === "Critical")} />
            ))}
          </>
        )}

        {feedTab === "representative" && (
          <>
            <div style={{ padding: "12px 16px", fontSize: 12, color: C.text2, background: C.surface2, borderBottom: `1px solid ${C.border}`, fontFamily: F.body }}>
              Verified posts from your elected representatives in {activeLoc.name}
            </div>
            {filteredReps.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.body }}>No updates yet</div>
              </div>
            ) : filteredReps.map((f, i) => (
              <RepCard key={f.id || i} p={f} votedIdx={pollVotes[f.id]} onVote={(id, idx) => setPollVotes(prev => ({ ...prev, [id]: idx }))} />
            ))}
          </>
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
  return (
    <article onClick={onClick} style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", gap: 12, position: "relative" }}>
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
          <Ics.Pin /> <span>{p.distance} · @{p.handle}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <SeverityTag level={p.severity} blink={blinkCritical} />
          <span style={{ padding: "2px 8px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 11, fontWeight: 600, fontFamily: F.body }}>{p.cat}</span>
          <StatusBadge status={p.status} />
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.5, color: C.text, fontFamily: F.body }}>{p.desc}</p>
        {p.img && (
          <div style={{ width: "100%", height: 200, borderRadius: 14, overflow: "hidden", marginBottom: 12, border: `1px solid ${C.border}` }}>
            <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <I2Button active={supported} count={p.agree + (supported ? 1 : 0)} onClick={handleSupport} />
            {sparks && [0, 1, 2].map(i => (
              <div key={i} style={{ position: "absolute", top: 0, left: 12 + i * 8, pointerEvents: "none", color: i === 0 ? C.purple : i === 1 ? C.accent : C.amber, animation: `sparkle 0.6s ease-out ${i * 0.1}s forwards` }}>
                <Ics.Spark size={10 + i * 2} />
              </div>
            ))}
          </div>
          <button onClick={e => { e.stopPropagation(); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text2, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
            <Ics.Comment />{p.comments}
          </button>
          <button onClick={e => { e.stopPropagation(); onShare(); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 10px", color: C.text2, cursor: "pointer", fontFamily: F.body }}>
            <Ics.Share />
          </button>
        </div>
      </div>
    </article>
  );
}

function RepCard({ p, votedIdx, onVote }) {
  const isPoll = p.cat === "Poll";
  const voted = typeof votedIdx === "number" ? votedIdx : null;
  const computedPcts = (() => {
    if (!isPoll || voted === null) return p.options ? p.options.map(o => o.pct) : [];
    const base = p.options.map(o => o.pct);
    const others = base.map((_, i) => i).filter(i => i !== voted);
    const donor = others.reduce((a, b) => (base[a] >= base[b] ? a : b));
    const out = [...base];
    out[voted] = Math.min(100, base[voted] + 1);
    out[donor] = Math.max(0, base[donor] - 1);
    return out;
  })();

  return (
    <article style={{ padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, background: `linear-gradient(180deg, ${C.purpleDim} 0%, transparent 80px)` }}>
      <Avatar name={p.author} isOfficial={true} size={44} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.purple, fontFamily: F.body }}>{p.author}</span>
              <Ics.Badge />
            </div>
            <div style={{ fontSize: 12, color: C.text2, marginTop: 2, fontFamily: F.body }}>{p.role}</div>
          </div>
          <span style={{ fontSize: 12, color: C.text2, fontFamily: F.body }}>{p.date}</span>
        </div>
        <span style={{ padding: "2px 8px", borderRadius: 4, background: isPoll ? C.purpleDim : "rgba(29,155,240,0.15)", color: isPoll ? C.purple : C.accent, fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 10 }}>{isPoll ? "ACTIVE POLL" : "OFFICIAL UPDATE"}</span>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.5, color: C.text, fontFamily: F.body }}>{p.desc}</p>
        {isPoll && p.options.map((opt, i) => {
          const pct = computedPcts[i];
          const isSelected = voted === i;
          return (
            <div key={i} onClick={() => voted === null && onVote(p.id, i)} style={{ marginBottom: 10, cursor: voted === null ? "pointer" : "default" }}>
              <div style={{ border: `1px solid ${isSelected ? C.purple : C.border}`, borderRadius: 10, padding: "12px 14px", background: voted !== null ? `linear-gradient(90deg, ${isSelected ? C.purpleDim : C.surface2} ${pct}%, transparent ${pct}%)` : C.surface2, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isSelected ? C.purple : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.purple }} />}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, fontFamily: F.body }}>{opt.label}</span>
                </div>
                {voted !== null && <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? C.purple : C.text2, fontFamily: F.body }}>{pct}%</span>}
              </div>
            </div>
          );
        })}
        {isPoll && <div style={{ color: C.text2, fontSize: 12, marginTop: 6, fontFamily: F.body }}>{(p.totalVotes + (voted !== null ? 1 : 0)).toLocaleString()} votes{voted !== null && " · ✓ You voted"}</div>}
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
          <button key={n.id} onClick={() => navigate("/" + (n.id === "feed" ? "feed" : n.id))} style={{ background: "none", border: "none", color: isActive ? C.purple : C.text2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60, transition: "color 0.2s" }}>
            <n.Icon a={isActive} />
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.body }}>{n.label}</span>
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
