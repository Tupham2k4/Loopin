import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { createNotification } from "../controllers/notificationController.js";
import { connections } from "../controllers/messengeController.js";

//Add Post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;
    let image_urls = [];
    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });
          return imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
        }),
      );
    }
    await Post.create({ user: userId, content, image_urls, post_type });
    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Get Posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .populate({
        path: "repost_of",
        populate: { path: "user", model: "User" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Like Post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((u) => u !== userId);
      await post.save();
      return res.json({ success: true, message: "Post unliked" });
    }
    post.likes_count.push(userId);
    await post.save();
    const actor = await User.findById(userId).select("full_name");
    await createNotification({
      recipient: post.user.toString(),
      actor: userId,
      actorName: actor.full_name,
      type: "like_post",
      postId: post._id,
      sseConnections: connections,
    });
    res.json({ success: true, message: "Post liked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Repost Post
export const repostPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, caption } = req.body;
    const targetPost = await Post.findById(postId);
    if (!targetPost)
      return res.json({ success: false, message: "Post not found" });
    const originalPostId =
      targetPost.post_type === "repost" ? targetPost.repost_of : targetPost._id;
    const originalPost = await Post.findById(originalPostId);
    const existingRepost = await Post.findOne({
      user: userId,
      repost_of: originalPostId,
      post_type: "repost",
    });
    if (existingRepost) {
      await Post.findByIdAndDelete(existingRepost._id);
      await Post.findByIdAndUpdate(originalPostId, {
        $inc: { repost_count: -1 },
      });
      return res.json({
        success: true,
        message: "Repost removed",
        action: "removed",
        originalPostId,
      });
    }
    const repost = await Post.create({
      user: userId,
      content: caption || "",
      image_urls: [],
      post_type: "repost",
      repost_of: originalPostId,
      repost_caption: caption || "",
    });
    await Post.findByIdAndUpdate(originalPostId, { $inc: { repost_count: 1 } });
    const actor = await User.findById(userId).select("full_name");
    await createNotification({
      recipient: originalPost.user.toString(),
      actor: userId,
      actorName: actor.full_name,
      type: "repost",
      postId: originalPostId,
      sseConnections: connections,
    });
    const populated = await Post.findById(repost._id)
      .populate("user")
      .populate({
        path: "repost_of",
        populate: { path: "user", model: "User" },
      });
    res.json({
      success: true,
      message: "Reposted successfully",
      action: "added",
      post: populated,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Check if the user has already reposted any articles.
export const checkRepostStatus = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postIds } = req.body;
    if (!Array.isArray(postIds) || postIds.length === 0)
      return res.json({ success: true, repostedIds: [] });
    const reposts = await Post.find({
      user: userId,
      repost_of: { $in: postIds },
      post_type: "repost",
    }).select("repost_of");
    const repostedIds = reposts.map((r) => r.repost_of.toString());
    res.json({ success: true, repostedIds });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Delete Post
export const deletePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (post.post_type === "repost" && post.repost_of) {
      await Post.findByIdAndUpdate(post.repost_of, {
        $inc: { repost_count: -1 },
      });
    } else {
      await Post.deleteMany({ repost_of: postId });
    }

    await Comment.deleteMany({ post_id: postId });
    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

