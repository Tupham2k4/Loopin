import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Reply, Send, Trash2, X } from "lucide-react";
import moment from "moment";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const CommentItem = ({
  comment,
  currentUser,
  onLike,
  onDelete,
  onReply,
  isReply = false,
}) => {
  const isLiked = comment.likes_count?.includes(currentUser?._id);
  const isOwner = comment.user?._id === currentUser?._id;

  return (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-2" : ""}`}>
      <img
        src={comment.user?.profile_picture}
        alt=""
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-4 py-2.5 inline-block max-w-full">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {comment.user?.full_name}
            <span className="text-gray-400 font-normal text-xs ml-1.5">
              @{comment.user?.username}
            </span>
          </p>
          <p className="text-sm text-gray-800 mt-0.5 break-words">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-1 ml-2">
          <span className="text-xs text-gray-400">
            {moment(comment.createdAt).fromNow()}
          </span>

          <button
            onClick={() => onLike(comment._id)}
            className={`flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
              isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500" : ""}`} />
            {comment.likes_count?.length > 0 && (
              <span>{comment.likes_count.length}</span>
            )}
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment._id, comment.user?.full_name)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => onDelete(comment._id)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!isReply && comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                currentUser={currentUser}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main CommentSection ────────────────────────────────────────────────────────
const CommentSection = ({ postId, onClose, onCountChange }) => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const inputRef = useRef(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/comment/${postId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        const serverComments = data.comments ?? data.comment ?? [];
        const serverCount = data.totalCount ?? data.count ?? 0;
        setComments(serverComments);
        setTotalCount(serverCount);
        console.debug("CommentSection: fetched count", serverCount);
        console.debug("CommentSection: onCountChange present", !!onCountChange);
        // Sync count lên PostCard
        onCountChange?.(serverCount);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        postId,
        content: inputText.trim(),
        ...(replyTo && { parentId: replyTo.id }),
      };
      const { data } = await api.post("/api/comment/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setInputText("");
        setReplyTo(null);
        await fetchComments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const { data } = await api.post(
        "/api/comment/like",
        { commentId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        const updateLikes = (list) =>
          list.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                likes_count: data.liked
                  ? [...c.likes_count, currentUser._id]
                  : c.likes_count.filter((id) => id !== currentUser._id),
              };
            }
            if (c.replies?.length > 0) {
              return { ...c, replies: updateLikes(c.replies) };
            }
            return c;
          });
        setComments((prev) => updateLikes(prev));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const { data } = await api.delete(`/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success("Đã xóa comment");
        await fetchComments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyTo({ id: commentId, name: userName });
    setInputText(`@${userName} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setInputText("");
  };

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-800">
            Comments
            {totalCount > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({totalCount})
              </span>
            )}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          </div>
        ) : (comments?.length ?? 0) === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            Chưa có comment nào. Hãy là người đầu tiên! 👋
          </p>
        ) : (
          (comments ?? []).map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onLike={handleLike}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))
        )}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-indigo-50 rounded-lg text-xs text-indigo-600">
            <span>
              Đang reply <strong>{replyTo.name}</strong>
            </span>
            <button
              onClick={cancelReply}
              className="cursor-pointer hover:text-indigo-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <img
            src={currentUser?.profile_picture}
            alt=""
            className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm"
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmit()
              }
              placeholder={
                replyTo ? `Reply ${replyTo.name}...` : "Viết comment..."
              }
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !inputText.trim()}
              className={`transition cursor-pointer ${
                inputText.trim()
                  ? "text-indigo-500 hover:text-indigo-700"
                  : "text-gray-300"
              }`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
