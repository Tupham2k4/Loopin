import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: String, ref: "User", required: true },
    actor: { type: String, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "like_post",
        "comment_post",
        "reply_comment",
        "like_comment",
        "follow",
        "repost",
        "connection_request",
        "connection_accepted",
      ],
      required: true,
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    is_read: { type: Boolean, default: false },
    // Text preview
    preview_text: { type: String, default: "" },
  },
  { timestamps: true, minimize: false },
);
notificationSchema.index({ recipient: 1, is_read: 1, createdAt: -1 });
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
