import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhoneFrame from "../components/PhoneFrame";
import { Header, Avatar, StatusBadge, SeverityTag, I2Button, BottomSheet } from "../components/shared";
import { Ics } from "../components/icons";
import { C, F } from "../constants/theme";
import { MOCK_COMMENTS, MOCK_POSTS } from "../data/mockData";

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
    if (!post) {
      const mock = MOCK_POSTS.find(p => p.id === id);
      if (mock) setPost(mock);
    }
    loadComments();
    checkVote();
  }, [id]);

  useEffect(() => {
    const channel = supabase.channel("comments-" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${id}` }, payload => {
        if (!payload.new.post_id.startsWith("PD")) return;
        loadComments();
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  const loadComments = async () => {
    const { data } = await supabase.from("comments").select("*, profiles(name, username)").eq("post_id", id).order("created_at");
    if (data && data.length > 0) {
      setComments(data.map(c => ({ user: c.profiles?.name || "Citizen", handle: c.profiles?.username || "citizen", time: timeAgo(c.created_at), text: c.text, official: c.is_official })));
    } else {
      setComments(MOCK_COMMENTS);
    }
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
    } else {
      await supabase.from("votes").insert({ post_id: id, user_id: user.id });
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !user) return;
    setLoading(true);
    const newComment = { user: profile?.name || "You", handle: profile?.username || "you", time: "just now", text: replyText.trim(), official: false };
    setComments(prev => [...prev, newComment]);
    setReplyText("");
    if (!id.startsWith("PD")) {
      await supabase.from("comments").insert({ post_id: id, author_id: user.id, text: replyText.trim() });
    }
    setLoading(false);
  };

  const sharePost = async () => {
    const text = `i² · ${post?.cat} issue: ${post?.desc?.slice(0, 120)}...`;
    try {
      if (navigator.share) await navigator.share({ title: "i²", text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!post) return null;

  return (
    <PhoneFrame>
      <Header title="" onBack={() => navigate("/feed")} right={
        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: C.text2, cursor: "pointer", display: "flex", padding: 4 }}><Ics.More /></button>
      } />

      <div style={{ flex: 1, overflowY: "auto" }}>
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

          {post.img && (
            <div style={{ width: "100%", height: 240, borderRadius: 14, overflow: "hidden", marginBottom: 14, border: `1px solid ${C.border}` }}>
              <img src={post.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <I2Button active={supported} count={post.agree + (supported ? 1 : 0)} onClick={toggleSupport} />
            <button onClick={() => document.getElementById("replies-section")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 12px", color: C.text2, cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600 }}>
              <Ics.Comment />{post.comments + comments.filter(c => c.time === "just now").length}
            </button>
            <button onClick={sharePost} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 10px", color: C.text2, cursor: "pointer", fontFamily: F.body }}>
              <Ics.Share />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div id="replies-section" style={{ padding: "16px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", fontFamily: F.body }}>Replies ({post.comments + comments.filter(c => c.time === "just now").length})</h3>

          {/* Reply input */}
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 24, padding: "8px 14px", marginBottom: 20, gap: 10, background: C.surface2 }}>
            <button style={{ background: "none", border: "none", color: C.text2, padding: 0, display: "flex", cursor: "pointer" }}><Ics.Camera /></button>
            <input placeholder="Add your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply()} style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 14, outline: "none", fontFamily: F.body }} />
            <button onClick={submitReply} disabled={!replyText.trim()} style={{ background: replyText.trim() ? C.gradient : C.surface3, border: "none", color: C.text, cursor: replyText.trim() ? "pointer" : "default", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: replyText.trim() ? 1 : 0.5, transition: "all 0.2s" }}>
              <Ics.Send />
            </button>
          </div>

          {/* Comment list */}
          {comments.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20, padding: c.official ? "14px" : 0, borderRadius: c.official ? 14 : 0, background: c.official ? `linear-gradient(135deg, ${C.purple}15, ${C.accent}08)` : "transparent", border: c.official ? `1px solid ${C.purple}40` : "none" }}>
              <Avatar name={c.user} isOfficial={c.official} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: c.official ? C.purple : C.text, fontFamily: F.body }}>{c.user}</span>
                  {c.official && <Ics.Badge />}
                  <span style={{ color: C.text2, fontSize: 11, fontFamily: F.body }}>· {c.time}</span>
                </div>
                {c.badge && <div style={{ color: C.purple, fontSize: 11, fontWeight: 800, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: F.body }}>✓ {c.badge}</div>}
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: c.official ? C.text : C.text2, fontFamily: F.body }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overflow menu */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        {[{ label: "Share post", action: () => { setMenuOpen(false); sharePost(); } },
          { label: "Copy link", action: async () => { setMenuOpen(false); try { await navigator.clipboard.writeText(`i² post: ${id}`); } catch {} } },
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
