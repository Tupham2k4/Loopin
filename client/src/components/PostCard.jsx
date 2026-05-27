import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
} from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";
import ShareModal from "./ShareModal";
import RepostCard from "./RepostCard";

const PostCard = ({ post: initialPost }) => {
  const [post] = useState(initialPost);
  const [likes, setLikes] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repost_count ?? 0);
  const [isRepostedByMe, setIsRepostedByMe] = useState(
    post.isRepostedByMe ?? false,
  );

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const postWithHashtags = (post.content || "").replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );

  const isRepost = post.post_type === "repost";

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    try {
      const { data } = await api.post(
        "api/post/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        setLikes((prev) =>
          prev.includes(currentUser._id)
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id],
        );
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ── Repost callback ────────────────────────────────────────────────────────
  const handleRepostSuccess = (data) => {
    if (data.action === "added") {
      setRepostCount((prev) => prev + 1);
      setIsRepostedByMe(true);
    } else {
      setRepostCount((prev) => Math.max(0, prev - 1));
      setIsRepostedByMe(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-2xl">
      {/* Badge repost */}
      {isRepost && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 -mb-1">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>
            <span className="font-medium text-gray-600">
              {post.user?.full_name}
            </span>{" "}
            đã repost
          </span>
        </div>
      )}

      {/* User info */}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          alt=""
          className="w-10 h-10 rounded-full shadow"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Repost caption */}
      {isRepost && post.repost_caption && (
        <p className="text-sm text-gray-800">{post.repost_caption}</p>
      )}

      {/* Content bài thường */}
      {!isRepost && post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Bài gốc nếu là repost */}
      {isRepost ? (
        <RepostCard originalPost={post.repost_of} />
      ) : (
        post.image_urls?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.image_urls.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className={`w-full h-48 object-cover rounded-lg ${
                  post.image_urls.length === 1 && "col-span-2 h-auto"
                }`}
              />
            ))}
          </div>
        )
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-100">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <Heart
            className={`w-4 h-4 transition-transform group-active:scale-125 ${
              likes.includes(currentUser._id)
                ? "text-red-500 fill-red-500"
                : "hover:text-red-400"
            }`}
          />
          <span>{likes.length}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className={`flex items-center gap-1 cursor-pointer transition-colors ${
            showComments ? "text-indigo-600" : "hover:text-indigo-500"
          }`}
        >
          <MessageCircle
            className={`w-4 h-4 ${showComments ? "fill-indigo-100" : ""}`}
          />
          <span>{commentCount}</span>
        </button>

        {/* Repost */}
        <button
          onClick={() => setShowShareModal(true)}
          className={`flex items-center gap-1 cursor-pointer transition-colors ${
            isRepostedByMe ? "text-green-500" : "hover:text-green-500"
          }`}
        >
          <Repeat2
            className={`w-4 h-4 ${isRepostedByMe ? "fill-green-100" : ""}`}
          />
          <span>{repostCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1 cursor-pointer hover:text-indigo-500 transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          onClose={() => setShowComments(false)}
          onCountChange={(count) => setCommentCount(count)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          post={{ ...post, isRepostedByMe }}
          onClose={() => setShowShareModal(false)}
          onRepostSuccess={handleRepostSuccess}
        />
      )}
    </div>
  );
};

export default PostCard;
