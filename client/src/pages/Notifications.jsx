import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageSquare,
  Repeat2,
  UserPlus,
  UserCheck,
  UserRoundPen,
  Trash2,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import moment from "moment";
import "moment/locale/vi"; // Enable Vietnamese time-ago in moment.js
import {
  fetchNotifications,
  markAllRead,
  markNotificationAsRead,
  clearNotifications,
} from "../features/notifications/notificationsSlice";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

// Configure moment to use Vietnamese locale
moment.locale("vi");

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { notifications } = useSelector((state) => state.notifications);
  const [loading, setLoading] = useState(false);

  const fetchLatest = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      await dispatch(fetchNotifications(token)).unwrap();
    } catch (error) {
      toast.error("Không thể tải thông báo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, [dispatch, getToken]);

  const handleMarkAllRead = async () => {
    try {
      const token = await getToken();
      await dispatch(markAllRead(token)).unwrap();
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo?")) {
      try {
        const token = await getToken();
        await dispatch(clearNotifications(token)).unwrap();
        toast.success("Đã xóa tất cả thông báo");
      } catch (error) {
        toast.error("Lỗi: " + error.message);
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Mark notification as read on DB and local Redux store
    if (!notif.is_read) {
      try {
        const token = await getToken();
        dispatch(markNotificationAsRead({ notificationId: notif._id, token }));
      } catch (error) {
        console.error("Lỗi đánh dấu đã đọc:", error);
      }
    }

    // 2. Navigate based on notification type
    switch (notif.type) {
      case "like_post":
      case "comment_post":
      case "repost":
      case "like_comment":
      case "reply_comment":
        // Navigate to the post author's profile where the post is listed
        navigate(`/profile/${notif.recipient}`);
        break;
      case "follow":
      case "connection_request":
      case "connection_accepted":
        // Navigate to the user profile who sent/triggered the request
        navigate(`/profile/${notif.actor?._id}`);
        break;
      default:
        break;
    }
  };

  // Icon mapping depending on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case "like_post":
      case "like_comment":
        return {
          icon: Heart,
          bgColor: "bg-rose-100",
          iconColor: "text-rose-500 fill-rose-500",
        };
      case "comment_post":
      case "reply_comment":
        return {
          icon: MessageSquare,
          bgColor: "bg-blue-100",
          iconColor: "text-blue-500 fill-blue-100",
        };
      case "follow":
        return {
          icon: UserPlus,
          bgColor: "bg-indigo-100",
          iconColor: "text-indigo-500",
        };
      case "repost":
        return {
          icon: Repeat2,
          bgColor: "bg-emerald-100",
          iconColor: "text-emerald-500",
        };
      case "connection_request":
        return {
          icon: UserRoundPen,
          bgColor: "bg-amber-100",
          iconColor: "text-amber-500",
        };
      case "connection_accepted":
        return {
          icon: UserCheck,
          bgColor: "bg-teal-100",
          iconColor: "text-teal-500",
        };
      default:
        return {
          icon: Bell,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-500",
        };
    }
  };

  // Render text depending on notification type
  const renderNotificationText = (notif) => {
    const actorName = notif.actor?.full_name || "Thành viên Loopin";
    const preview = notif.preview_text || "";

    switch (notif.type) {
      case "like_post":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã thích bài viết của bạn.
          </span>
        );
      case "comment_post":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã bình luận bài viết của bạn:{" "}
            <span className="text-slate-600 italic">"{preview}"</span>
          </span>
        );
      case "reply_comment":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã trả lời bình luận của bạn:{" "}
            <span className="text-slate-600 italic">"{preview}"</span>
          </span>
        );
      case "like_comment":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã thích bình luận của bạn.
          </span>
        );
      case "follow":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã theo dõi bạn.
          </span>
        );
      case "repost":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã chia sẻ lại bài viết của bạn.
          </span>
        );
      case "connection_request":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã gửi yêu cầu kết nối với bạn.
          </span>
        );
      case "connection_accepted":
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã chấp nhận yêu cầu kết nối của bạn.
          </span>
        );
      default:
        return (
          <span>
            <strong className="font-semibold text-slate-900">
              {actorName}
            </strong>{" "}
            đã tương tác với bạn.
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-8 h-8 text-indigo-600" />
              Thông báo
            </h1>
            <p className="text-slate-500 mt-1">
              Quản lý và xem các thông báo hoạt động tài khoản của bạn
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchLatest}
              disabled={loading}
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all duration-200 rounded-lg shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0}
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              Đánh dấu tất cả đã đọc
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 active:scale-95 transition-all duration-200 rounded-lg shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Body content */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-[350px]">
            <Loading />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[350px] transition-all">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Hộp thư thông báo trống
            </h3>
            <p className="text-slate-500 max-w-sm">
              Bạn chưa nhận được thông báo nào. Mọi hoạt động bình luận, kết nối
              mới hoặc bày tỏ cảm xúc sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.type);
              const IconComp = style.icon;
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-4 p-4 sm:p-5 items-start cursor-pointer hover:bg-slate-50/80 transition-all duration-200 relative group ${
                    !notif.is_read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  {/* Unread indicator bar */}
                  {!notif.is_read && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r shadow-sm"></span>
                  )}

                  {/* Avatar and Badge overlay */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        notif.actor?.profile_picture ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                      }
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-white ${style.bgColor}`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${style.iconColor}`} />
                    </div>
                  </div>

                  {/* Notification text details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {renderNotificationText(notif)}
                    </p>
                    <span className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                      {moment(notif.createdAt).fromNow()}
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
