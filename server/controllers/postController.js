import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
//Add post
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
          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
          return url;
        }),
      );
    }
    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });
    res.json({ success: true, message: "post created successfully" });
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
    //User connections and followings
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
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      res.json({ success: true, message: "Post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      res.json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Repost
export const repostPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, caption } = req.body;
    //Get the original post — if the postID is already a repost, then get the actual original post
    const targetPost = await Post.findById(postId);
    if (!targetPost) {
      return res.json({ success: false, message: "Post not found" });
    }
    //Always repost the original post, not repost of a repost.
    const originalPostId =
      targetPost.post_type === "repost" ? targetPost.repost_of : targetPost._id;
    //Check if the user has already reposted this article.
    const existingRepost = await Post.findOne({
      user: userId,
      repost_of: originalPostId,
      post_type: "repost",
    });
    if (existingRepost) {
      //If reposted -> undo repost (delete)
      await Post.findByIdAndDelete(existingRepost._id);
      //Reduce the repost_count of the original post.
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
    //Create new repost
    const repost = await Post.create({
      user: userId,
      content: caption || "",
      image_urls: [],
      post_type: "repost",
      repost_of: originalPostId,
      repost_caption: caption || "",
    });
    //Increase the repost_count of the original post.
    await Post.findByIdAndUpdate(originalPostId, {
      $inc: { repost_count: 1 },
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

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.json({ success: true, repostedIds: [] });
    }

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
