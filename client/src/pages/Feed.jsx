import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMesssages from "../components/RecentMesssages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setloading] = useState(true);
  const { getToken } = useAuth();
  const fetchFeeds = async () => {
    try {
      setloading(true);
      const { data } = await api.get("api/post/feed", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        const posts = data.posts ?? [];
        // Fetch comment counts for all posts and attach to each post for initial display
        try {
          const ids = posts.map((p) => p._id);
          const { data: countsData } = await api.post(
            "api/comment/counts",
            { postIds: ids },
            { headers: { Authorization: `Bearer ${await getToken()}` } },
          );
          const counts = countsData.success ? countsData.counts : {};
          posts.forEach((p) => {
            p.comment_count = counts[p._id] ?? p.comment_count ?? 0;
          });
        } catch (err) {
          console.debug("Could not fetch comment counts:", err.message);
        }
        setFeeds(posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setloading(false);
  };
  useEffect(() => {
    fetchFeeds();
  }, []);
  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/*Stories and post list*/}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
      {/*Right Sidebar*/}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className="w-75 h-50 rounded-md"
            alt=""
          ></img>
          <p className="text-slate-600">Email marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>
        <RecentMesssages />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
