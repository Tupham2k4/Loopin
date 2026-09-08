import {
  BadgeCheck,
  Heart,
  History,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Share2,
  Trash2,
  X,
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

const PostCard = ({ post: initialPost, onDelete }) => {
  const [post, setPost] = useState(initialPost);
  const [likes, setLikes] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repost_count ?? 0);
  const [isRepostedByMe, setIsRepostedByMe] = useState(
    post.isRepostedByMe ?? false,
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const isOwner =
    currentUser?._id &&
    (post.user?._id === currentUser._id || post.user === currentUser._id);

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

  // ── Delete Post ────────────────────────────────────────────────────────────
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      const { data } = await api.post(
        "api/post/delete",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success("Bài viết đã được xóa thành công");
        if (onDelete) onDelete(post._id);
      } else {
        toast.error(data.message || "Không thể xóa bài viết");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Edit Post ──────────────────────────────────────────────────────────────
  const handleOpenEdit = () => {
    setEditContent(isRepost ? post.repost_caption || "" : post.content || "");
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleUpdatePost = async () => {
    try {
      setIsUpdating(true);
      const token = await getToken();
      const { data } = await api.post(
        "api/post/update",
        { postId: post._id, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success("Cập nhật bài viết thành công!");
        setPost(data.post);
        setShowEditModal(false);
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
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
    <div className="bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-2xl relative">
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

      {/* User info & Options */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => navigate("/profile/" + post.user._id)}
          className="inline-flex items-center gap-3 cursor-pointer"
        >
          <img
            src={post.user.profile_picture}
            alt=""
            className="w-10 h-10 rounded-full shadow object-cover"
          />
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{post.user.full_name}</span>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-gray-500 text-sm flex items-center flex-wrap gap-1">
              <span>
                @{post.user.username} · {moment(post.createdAt).fromNow()}
              </span>
              {post.is_edited && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistoryModal(true);
                  }}
                  className="text-xs text-gray-400 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
                  title="Xem lịch sử chỉnh sửa"
                >
                  (Đã chỉnh sửa)
                </button>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Tùy chọn"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button
                  onClick={handleOpenEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa bài viết</span>
                </button>
              </div>
            )}
          </div>
        )}
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

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Chỉnh sửa bài viết</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập nội dung bài viết..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isUpdating}
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isUpdating}
                onClick={handleUpdatePost}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800 text-lg">Lịch sử chỉnh sửa</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 no-scrollbar">
              {post.edit_history && post.edit_history.length > 0 ? (
                post.edit_history
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 text-sm space-y-1"
                    >
                      <p className="text-gray-700 whitespace-pre-line">
                        {item.content || "(Nội dung trống)"}
                      </p>
                      <span className="text-xs text-gray-400 block pt-1 border-t border-gray-200/60">
                        Đã sửa vào:{" "}
                        {moment(item.editedAt).format("HH:mm - DD/MM/YYYY")}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có lịch sử chỉnh sửa nào.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">Xóa bài viết?</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeletePost}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;




