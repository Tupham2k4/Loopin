import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
// Add Comment or Reply
export const addComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, content, parentId } = req.body;
    if (!content || !content.trim()) {
      return res.json({ success: false, message: "Content is required" });
    }
    // Check if the post exists.
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    //If it's a reply, check that the parent comment exists and hasn't been deleted.
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent || parent.is_deleted) {
        return res.json({
          success: false,
          message: "Parent comment not found",
        });
      }
      //Only level 1 replies are allowed (no replies to replies).
      if (parent.parent_id !== null) {
        return res.json({ success: false, message: "Cannot reply to a reply" });
      }
    }
    const comment = await Comment.create({
      post_id: postId,
      user: userId,
      content: content.trim(),
      parent_id: parentId || null,
    });
    //Populate user info to return immediately
    const populated = await Comment.findById(comment._id).populate("user");
    res.json({ success: true, comment: populated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Get comments from a post (top-level + replies)
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    //Get all top-level comments from the post.
    const topLevelComments = await Comment.find({
      post_id: postId,
      parent_id: null,
      is_deleted: false,
    })
      .populate("user")
      .sort({ createdAt: -1 });
    //Get all replies to that post
    const replies = await Comment.find({
      post_id: postId,
      parent_id: { $ne: null },
      is_deleted: false,
    })
      .populate("user")
      .sort({ createdAt: -1 }); //Replies are displayed in order from oldest -> newest.
    //Attach replies to each top-level comment.
    const commentsWithReplies = topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      commentObj.replies = replies.filter(
        (reply) => reply.parent_id.toString() === comment._id.toString(),
      );
      return commentObj;
    });
    //Count the total number of comments (top-level + replies)
    const totalCount = await Comment.countDocuments({
      post_id: postId,
      is_deleted: false,
    });
    res.json({ success: true, comment: commentsWithReplies, totalCount });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Like/Unlike Comment
export const likeComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { commentId } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.json({ success: false, message: "Comment not found" });
    }
    const alreadyLiked = comment.likes_count.includes(userId);
    if (alreadyLiked) {
      comment.likes_count = comment.likes_count.filter((id) => id !== userId);
      await comment.save();
      return res.json({
        success: true,
        message: "Comment unliked",
        liked: true,
      });
    } else {
      comment.likes_count.push(userId);
      await comment.save();
      return res.json({ success: true, message: "Comment liked", liked: true });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.json({ success: false, message: "Comment not found" });
    }

    // Only the commenter can delete the comment.
    if (comment.user !== userId) {
      return res.json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    comment.is_deleted = true;
    comment.content = "[Comment đã bị xóa]";
    await comment.save();

    // If it's a top-level comment, soft delete the replies as well.
    if (comment.parent_id === null) {
      await Comment.updateMany(
        { parent_id: comment._id },
        { is_deleted: true, content: "[Comment đã bị xóa]" },
      );
    }

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Count comments on multiple posts at the same time (feed)
export const getCommentCounts = async (req, res) => {
  try {
    const { postIds } = req.body; // array of postId strings

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.json({ success: true, counts: {} });
    }

    const counts = await Comment.aggregate([
      {
        $match: {
          post_id: {
            $in: postIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          is_deleted: false,
        },
      },
      { $group: { _id: "$post_id", count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    counts.forEach(({ _id, count }) => {
      countsMap[_id.toString()] = count;
    });

    res.json({ success: true, counts: countsMap });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
