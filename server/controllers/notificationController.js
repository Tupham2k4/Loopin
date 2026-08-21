import Notification from "../models/Notification.js";
// Map type -> display message
export const getNotificationMessenge = (type, actorName, previewText) => {
  switch (type) {
    case "like_post":
      return `${actorName} đã thích bài viết của bạn.`;
    case "comment_post":
      return `${actorName} đã bình luận: "${previewText}".`;
    case "reply_comment":
      return `${actorName} đã trả lời bình luận của bạn: "${previewText}".`;
    case "like_comment":
      return `${actorName} đã thích bình luận của bạn.`;
    case "follow":
      return `${actorName} đã theo dõi bạn.`;
    case "repost":
      return `${actorName} đã đăng lại bài viết của bạn.`;
    case "connection_request":
      return `${actorName} đã gửi yêu cầu kết nối.`;
    case "connection_accepted":
      return `${actorName} đã chấp nhận yêu cầu kết nối của bạn.`;
    case "connection_reject":
      return `${actorName} đã từ chối yêu cầu kết nối của bạn.`;
    default:
      return `${actorName} đã tương tác với bạn.`;
  }
};
// Create notification + push SSE real-time
// This function will be called from other controllers (like, comment, follow, etc.)
export const createNotification = async ({
  recipient,
  actor,
  actorName,
  type,
  postId = null,
  commentId = null,
  previewText = "",
  sseConnections = {},
}) => {
  try {
    // Do not create notifications for actions done by the user themselves
    if (recipient === actor) return null;
    const notification = await Notification.create({
      recipient,
      actor,
      type,
      post_id: postId,
      comment_id: commentId,
      is_read: false,
      preview_text: previewText.slice(0, 80),
    });
    // Populate actor to send via SSE
    const populated = await Notification.findById(notification._id)
      .populate("actor", "full_name profile_picture username")
      .populate("post_id", "content image_urls")
      .lean();
    // Push real-time via SSE if the recipient is online
    if (sseConnections[recipient]) {
      sseConnections[recipient].write(
        `event: notification\ndata: ${JSON.stringify(populated)}\n\n`,
      );
    }
    return populated;
  } catch (error) {
    console.log("createNotification error:", error.message);
    return null;
  }
};
// Get list of notifications for the user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.auth();
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate("actor", "full_name profile_picture username")
      .populate("post_id", "content image_urls")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      is_read: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { notificationId } = req.body;

    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { is_read: true },
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//  Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.auth();

    await Notification.updateMany(
      { recipient: userId, is_read: false },
      { is_read: true },
    );

    res.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.auth();
    await Notification.deleteMany({ recipient: userId });
    res.json({ success: true, message: "Đã xóa tất cả thông báo" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
