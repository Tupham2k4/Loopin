import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";

const PostCard = ({ post }) => {
  const postWithHashtags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );
  const [likes, setLikes] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  const handleLike = async () => {
    try {
      const { data } = await api.post(
        `api/post/like`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setLikes((prev) => {
          if (prev.includes(currentUser._id)) {
            return prev.filter((id) => id !== currentUser._id);
          } else {
            return [...prev, currentUser._id];
          }
        });
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${post.user._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link!");
  };

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
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
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

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

      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer transition-transform active:scale-125 ${
              likes.includes(currentUser._id)
                ? "text-red-500 fill-red-500"
                : "hover:text-red-400"
            }`}
            onClick={handleLike}
          />
          <span>{likes.length}</span>
        </div>

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

        <div
          className="flex items-center gap-1 cursor-pointer hover:text-indigo-500 transition-colors"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </div>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          onClose={() => setShowComments(false)}
          onCountChange={(count) => setCommentCount(count)}
        />
      )}
    </div>
  );
};

export default PostCard;
