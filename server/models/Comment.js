import mongoose from "mongoose";
const commentSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: { type: String, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, //null = top-level comment, ObjectId = reply
    likes_count: [{ type: String, ref: "User" }],
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false },
);
//Index for quick queries by post and parent.
commentSchema.index({ post_id: 1, parent_id: 1, createdAt: -1 });
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
