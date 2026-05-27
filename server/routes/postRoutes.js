import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import {
  addPost,
  checkRepostStatus,
  getFeedPosts,
  likePost,
  repostPost,
} from "../controllers/postController.js";
const postRouter = express.Router();
postRouter.post("/add", upload.array("images", 4), protect, addPost);
postRouter.get("/feed", protect, getFeedPosts);
postRouter.post("/like", protect, likePost);
postRouter.post("/repost", protect, repostPost);
postRouter.post("/repost-status", protect, checkRepostStatus);
export default postRouter;
