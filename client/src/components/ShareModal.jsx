import React, { useState } from "react";
import { Link, Repeat2, X, CheckCheck } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";

const ShareModal = ({ post, onClose, onRepostSuccess }) => {
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const originalPost = post.post_type === "repost" ? post.repost_of : post;
  const isAlreadyReposted = post.isRepostedByMe;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${originalPost._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("I have copied the article link!");
  };

  const handleRepost = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(
        "/api/post/repost",
        { postId: originalPost._id, caption },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(
          data.action === "added"
            ? "The article has been reposted!"
            : "Unreposted!",
        );
        onRepostSuccess?.(data);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Share</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview bài gốc */}
        <div className="mx-5 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={originalPost?.user?.profile_picture}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-gray-700">
              {originalPost?.user?.full_name}
            </span>
            <span className="text-xs text-gray-400">
              @{originalPost?.user?.username}
            </span>
          </div>
          {originalPost?.content && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {originalPost.content}
            </p>
          )}
          {originalPost?.image_urls?.length > 0 && (
            <img
              src={originalPost.image_urls[0]}
              alt=""
              className="mt-2 w-full h-24 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Caption input */}
        <div className="px-5 mt-4">
          <div className="flex items-start gap-3">
            <img
              src={currentUser?.profile_picture}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add your thoughts... (optional)"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none bg-transparent min-h-[60px]"
              maxLength={280}
            />
          </div>
          {caption && (
            <p className="text-right text-xs text-gray-400 mt-1">
              {caption.length}/280
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 mt-2 space-y-2">
          <button
            onClick={handleRepost}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition active:scale-95 cursor-pointer ${
              isAlreadyReposted
                ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Repeat2 className="w-4 h-4" />
            )}
            {isAlreadyReposted ? "Quit reposting" : "Repost to your page"}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition active:scale-95 cursor-pointer text-gray-700"
          >
            {copied ? (
              <CheckCheck className="w-4 h-4 text-green-500" />
            ) : (
              <Link className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy the article link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
