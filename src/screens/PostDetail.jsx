import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Avatar, StatusBadge, SeverityTag, I2Button, BottomSheet } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";

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

  useEffect(() => {
    if (!post) fetchPost();
    loadComments();
    checkVote();
  }, [id]);

  useEffect(() => {
    const channel = supabase.channel("comments-" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${id}` }, () => {
        loadComments();
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(name, username, verified)")
      .eq("id", id)
      .single();
    if (data) {
      setPost({
        id: data.id,
        cat: data.category,
        severity: data.severity,
        date: timeAgo(data.created_at),
        fullDate: new Date(data.created_at).toLocaleDateString("en-IN"),
        desc: data.description,
        status: data.status,
        agree: data.agree_count,
        comments: data.comments_count,
        author: data.anonymous ? "Anonymous" : (data.profiles?.name || "Citizen"),
        handle: data.anonymous ? "anonymous" : (data.profiles?.username || "citizen"),
        verified: !data.anonymous && !!data.profiles?.verified,
        distance: "—",
        photos: data.photos || [],
      });
    }
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
    setLoading(false);
  };

  const sharePost = async () => {
    const text = `i² · ${post?.cat} issue: ${post?.desc?.slice(0, 120)}...`;
    try {
      if (navigator.share) await navigator.share({ title: "i²", text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!post) return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/feed")} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.text2, fontSize: 14, fontFamily: F.body }}>
        Loading...
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/feed")} right={
        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", display: "flex", padding: 4 }}><Ics.More /></button>
      } />

      <div style={{ flex: 1, overflowY: "auto" }}>
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
                <div key={i} style={{ minWidth: post.photos.length === 1 ? "100%" : 200, height: 220, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, flexShrink: 0 }}>
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
            <button onClick={sharePost} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 10px", color: C.text2, cursor: "pointer", fontFamily: F.body }}>
              <Ics.Share />
            </button>
          </div>
        </div>

        <div id="replies-section" style={{ padding: "16px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", fontFamily: F.body }}>Replies ({comments.length})</h3>

          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 24, padding: "8px 14px", marginBottom: 20, gap: 10, background: C.surface2 }}>
            <input placeholder="Add your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply()} style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
            <button onClick={submitReply} disabled={!replyText.trim() || loading} style={{ background: replyText.trim() ? C.gradient : C.surface3, border: "none", color: C.text, cursor: replyText.trim() ? "pointer" : "default", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: replyText.trim() ? 1 : 0.5, transition: "all 0.2s" }}>
              <Ics.Send />
            </button>
          </div>

          {comments.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.text2, fontSize: 14, fontFamily: F.body }}>
              No replies yet. Be the first to respond.
            </div>
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
      </div>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        {[{ label: "Share post", action: () => { setMenuOpen(false); sharePost(); } },
          { label: "Copy link", action: async () => { setMenuOpen(false); try { await navigator.clipboard.writeText(window.location.href); } catch {} } },
          { label: "Report this post", action: () => { setMenuOpen(false); alert("Report submitted. Our team will review within 24 hours."); } },
          { label: "Cancel", action: () => setMenuOpen(false), muted: true }].map((item, i) => (
          <button key={i} onClick={item.action} style={{ width: "100%", padding: "14px 0", background: "none", border: "none", color: item.muted ? C.text2 : C.text, fontSize: 15, fontWeight: 600, textAlign: "left", cursor: "pointer", borderTop: i === 0 ? "none" : `1px solid ${C.border}`, fontFamily: F.body }}>
            {item.label}
          </button>
        ))}
      </BottomSheet>
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
