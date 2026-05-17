import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Avatar, StatusBadge, SeverityTag, I2Button, BottomSheet, Lightbox, Skeleton } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";
import { toast } from "../lib/toast";

const STATUS_STEPS = ["Open", "Pending", "In Progress", "Resolved"];

export default function PostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user, profile } = useAuth();

  const [post, setPost] = useState(location.state?.post || null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [supported, setSupported] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [mergeRequests, setMergeRequests] = useState([]);
  const [mergesSent, setMergesSent] = useState({});
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    if (!post) fetchPost();
    loadComments();
    checkVote();
  }, [id]);

  useEffect(() => {
    if (!post || !user) return;
    fetchSimilar();
    fetchMergeRequests();
  }, [post?.cat, user?.id]);

  useEffect(() => {
    const channel = supabase.channel("comments-" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${id}` }, () => loadComments())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(name, username, verified)")
      .eq("id", id)
      .single();
    if (data) setPost({
      id: data.id, cat: data.category, severity: data.severity,
      date: timeAgo(data.created_at), fullDate: new Date(data.created_at).toLocaleDateString("en-IN"),
      desc: data.description, status: data.status, agree: data.agree_count,
      comments: data.comments_count,
      author: data.anonymous ? "Anonymous" : (data.profiles?.name || "Citizen"),
      handle: data.anonymous ? "anonymous" : (data.profiles?.username || "citizen"),
      verified: !data.anonymous && !!data.profiles?.verified,
      distance: "—", photos: data.photos || [], author_id: data.author_id,
    });
  };

  const fetchSimilar = async () => {
    if (!post?.cat || !user) return;
    const { data } = await supabase
      .from("posts")
      .select("id, description, category, agree_count, profiles(name)")
      .eq("category", post.cat)
      .eq("type", "public")
      .neq("id", id)
      .neq("author_id", user.id)
      .is("merged_into", null)
      .limit(3);
    setSimilarPosts(data || []);
  };

  const fetchMergeRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("merge_requests")
      .select("*, posts!requester_post_id(id, description, category, agree_count, profiles(name))")
      .eq("target_post_id", id)
      .eq("status", "pending");
    setMergeRequests(data || []);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(name, username)")
      .eq("post_id", id)
      .order("created_at");
    setComments((data || []).map(c => ({
      user: c.profiles?.name || "Citizen",
      handle: c.profiles?.username || "citizen",
      time: timeAgo(c.created_at),
      text: c.text,
      official: c.is_official || false,
    })));
  };

  const checkVote = async () => {
    if (!user) return;
    const { data } = await supabase.from("votes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle();
    setSupported(!!data);
  };

  const toggleSupport = async () => {
    if (!user || !post) return;
    setSupported(s => !s);
    setPost(p => ({ ...p, agree: p.agree + (supported ? -1 : 1) }));
    if (supported) {
      await supabase.from("votes").delete().eq("post_id", id).eq("user_id", user.id);
      await supabase.from("posts").update({ agree_count: Math.max(0, post.agree - 1) }).eq("id", id);
    } else {
      toast("Your voice added");
      await supabase.from("votes").insert({ post_id: id, user_id: user.id });
      await supabase.from("posts").update({ agree_count: post.agree + 1 }).eq("id", id);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !user) return;
    setLoading(true);
    const text = replyText.trim();
    setReplyText("");
    await supabase.from("comments").insert({ post_id: id, author_id: user.id, text });
    await supabase.from("posts").update({ comments_count: (post?.comments || 0) + 1 }).eq("id", id);
    toast("Reply posted");
    setLoading(false);
  };

  const requestMerge = async (targetId) => {
    if (!user) return;
    setMergesSent(p => ({ ...p, [targetId]: "sending" }));
    await supabase.from("merge_requests").insert({ requester_post_id: id, target_post_id: targetId, requester_id: user.id });
    setMergesSent(p => ({ ...p, [targetId]: "sent" }));
    toast("Merge request sent");
  };

  const handleMerge = async (req, accept) => {
    if (!accept) {
      await supabase.from("merge_requests").update({ status: "rejected" }).eq("id", req.id);
      setMergeRequests(prev => prev.filter(r => r.id !== req.id));
      toast("Merge rejected", "info");
      return;
    }
    const reqPost = req.posts;
    await supabase.from("posts").update({ merged_into: id, status: "Merged", agree_count: 0 }).eq("id", reqPost.id);
    await supabase.from("posts").update({ agree_count: (post?.agree || 0) + (reqPost.agree_count || 0) }).eq("id", id);
    await supabase.from("merge_requests").update({ status: "accepted" }).eq("id", req.id);
    await supabase.from("notifications").insert({ user_id: req.requester_id, type: "merge_accepted", title: "Merge accepted! 🤝", body: `Your ${reqPost.category} post was merged. Combined voices are louder.`, post_id: id });
    setPost(p => ({ ...p, agree: (p?.agree || 0) + (reqPost.agree_count || 0) }));
    setMergeRequests(prev => prev.filter(r => r.id !== req.id));
    toast("Issues merged! Voices combined 🤝");
  };

  const shareWhatsApp = () => {
    const text = `🚨 Civic issue in your area!\n\n*${post?.cat}*: ${post?.desc?.slice(0, 160)}\n\n${post?.agree} people have spoken up. Join them on i² — Your Voice, Your City.\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!post) return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/feed")} />
      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Skeleton width={48} height={48} style={{ borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={12} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Skeleton width={60} height={22} style={{ borderRadius: 4 }} />
          <Skeleton width={80} height={22} style={{ borderRadius: 4 }} />
          <Skeleton width={60} height={22} style={{ borderRadius: 4 }} />
        </div>
        <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={200} style={{ borderRadius: 14, marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton width={80} height={32} style={{ borderRadius: 20 }} />
          <Skeleton width={60} height={32} style={{ borderRadius: 20 }} />
          <Skeleton width={70} height={32} style={{ borderRadius: 20 }} />
        </div>
      </div>
    </PhoneFrame>
  );

  const statusIdx = STATUS_STEPS.indexOf(post.status);

  return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/feed")} right={
        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", display: "flex", padding: 4 }}><Ics.More /></button>
      } />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Merge requests (for post owner) */}
        {mergeRequests.length > 0 && post.author_id === user?.id && mergeRequests.map(req => (
          <div key={req.id} className="fade-in" style={{ margin: "12px 16px 0", padding: "14px", borderRadius: 14, background: `${C.purple}15`, border: `1px solid ${C.purple}40` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 4, fontFamily: F.body }}>🤝 Merge Request</div>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: C.text2, fontFamily: F.body }}>
              <strong style={{ color: C.text }}>{req.posts?.profiles?.name || "Someone"}</strong> wants to merge their {req.posts?.category} issue with yours. Combined i²: {(post.agree || 0) + (req.posts?.agree_count || 0)}
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: C.text, fontFamily: F.body, lineHeight: 1.4 }}>"{req.posts?.description?.slice(0, 100)}..."</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleMerge(req, false)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, color: C.text2, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Reject</button>
              <button onClick={() => handleMerge(req, true)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: C.gradient, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Accept & Merge</button>
            </div>
          </div>
        ))}

        {/* Post content */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
            <Avatar name={post.author} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 15, fontFamily: F.body }}>{post.author}</span>
                {post.verified && <Ics.Badge />}
              </div>
              <div style={{ fontSize: 13, color: C.text2, fontFamily: F.body }}>@{post.handle}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 12, color: C.text2, marginTop: 2, alignItems: "center", fontFamily: F.body }}>
                <Ics.Pin /> <span>{post.distance}</span> · <span>{post.fullDate}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <SeverityTag level={post.severity} />
            <span style={{ padding: "2px 8px", borderRadius: 4, background: C.surface3, color: C.text2, fontSize: 11, fontWeight: 600, fontFamily: F.body }}>{post.cat}</span>
            <StatusBadge status={post.status} />
          </div>

          <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 0 14px", fontFamily: F.body }}>{post.desc}</p>

          {post.photos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
              {post.photos.map((url, i) => (
                <div key={i} onClick={() => setLightboxSrc(url)} style={{ minWidth: post.photos.length === 1 ? "100%" : 200, height: 220, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, flexShrink: 0, cursor: "zoom-in" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <I2Button active={supported} count={post.agree} onClick={toggleSupport} />
            <button onClick={() => document.getElementById("replies-section")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text2, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
              <Ics.Comment />{comments.length}
            </button>
            <button onClick={shareWhatsApp} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.green, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={C.green}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.504 5.812L0 24l6.335-1.482A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.384l-.36-.214-3.732.873.936-3.617-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Share
            </button>
          </div>
        </div>

        {/* Status Timeline */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 14, fontFamily: F.body, textTransform: "uppercase", letterSpacing: 1 }}>Issue Status</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= statusIdx;
              const active = i === statusIdx;
              return (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: active ? 14 : 12, height: active ? 14 : 12, borderRadius: "50%", background: done ? C.purple : C.surface3, border: `2px solid ${done ? C.purple : C.border}`, boxShadow: active ? `0 0 0 4px ${C.purple}25` : "none", transition: "all 0.3s" }} />
                    <span style={{ fontSize: 10, fontWeight: done ? 700 : 400, color: done ? C.text : C.text3, fontFamily: F.body, whiteSpace: "nowrap" }}>{step}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < statusIdx ? C.purple : C.surface3, marginBottom: 16, marginLeft: 4, marginRight: 4, transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div id="replies-section" style={{ padding: "16px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", fontFamily: F.body }}>Replies ({comments.length})</h3>

          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 24, padding: "8px 14px", marginBottom: 20, gap: 10, background: C.surface2 }}>
            <input placeholder="Add your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply()} style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
            <button onClick={submitReply} disabled={!replyText.trim() || loading} style={{ background: replyText.trim() ? C.gradient : C.surface3, border: "none", color: C.text, cursor: replyText.trim() ? "pointer" : "default", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: replyText.trim() ? 1 : 0.5, transition: "all 0.2s" }}>
              <Ics.Send />
            </button>
          </div>

          {comments.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.text2, fontSize: 14, fontFamily: F.body }}>No replies yet. Be the first to respond.</div>
          )}

          {comments.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20, padding: c.official ? "14px" : 0, borderRadius: c.official ? 14 : 0, background: c.official ? `linear-gradient(135deg, ${C.purple}15, ${C.accent}08)` : "transparent", border: c.official ? `1px solid ${C.purple}40` : "none" }}>
              <Avatar name={c.user} isOfficial={c.official} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: c.official ? C.purple : C.text, fontFamily: F.body }}>{c.user}</span>
                  {c.official && <Ics.Badge />}
                  <span style={{ color: C.text2, fontSize: 11, fontFamily: F.body }}>· {c.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: c.official ? C.text : C.text2, fontFamily: F.body }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Similar Issues / Merge */}
        {similarPosts.length > 0 && (
          <div style={{ padding: "16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text2, marginBottom: 12, fontFamily: F.body, textTransform: "uppercase", letterSpacing: 1 }}>Similar Issues Nearby</div>
            {similarPosts.map(s => {
              const state = mergesSent[s.id];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.body, marginBottom: 2 }}>{s.profiles?.name || "Citizen"}</div>
                    <div style={{ fontSize: 12, color: C.text2, fontFamily: F.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.description}</div>
                    <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, marginTop: 2, fontFamily: F.body }}>{s.agree_count} i²</div>
                  </div>
                  <button
                    onClick={() => state ? null : requestMerge(s.id)}
                    disabled={!!state}
                    style={{ padding: "8px 14px", borderRadius: 20, background: state === "sent" ? C.surface3 : C.purpleDim, border: `1px solid ${state === "sent" ? C.border : C.purple}`, color: state === "sent" ? C.text2 : C.purple, fontSize: 12, fontWeight: 700, cursor: state ? "default" : "pointer", fontFamily: F.body, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {state === "sent" ? "Request sent ✓" : state === "sending" ? "..." : "Request Merge"}
                  </button>
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: C.text3, marginTop: 10, lineHeight: 1.5, fontFamily: F.body }}>Merging combines i² counts and makes your voices louder together.</p>
          </div>
        )}
      </div>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        {[{ label: "Share on WhatsApp", action: () => { setMenuOpen(false); shareWhatsApp(); } },
          { label: "Copy link", action: async () => { setMenuOpen(false); try { await navigator.clipboard.writeText(window.location.href); toast("Link copied"); } catch {} } },
          { label: "Report this post", action: () => { setMenuOpen(false); toast("Report submitted", "info"); } },
          { label: "Cancel", action: () => setMenuOpen(false), muted: true }].map((item, i) => (
          <button key={i} onClick={item.action} style={{ width: "100%", padding: "14px 0", background: "none", border: "none", color: item.muted ? C.text2 : C.text, fontSize: 15, fontWeight: 600, textAlign: "left", cursor: "pointer", borderTop: i === 0 ? "none" : `1px solid ${C.border}`, fontFamily: F.body }}>
            {item.label}
          </button>
        ))}
      </BottomSheet>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </PhoneFrame>
  );
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
