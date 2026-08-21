import React, { useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messenges from "./pages/Messenges";
import ChatBox from "./pages/ChatBox";
import Connection from "./pages/Connection";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import { useUser, useAuth } from "@clerk/clerk-react";
import Notification from "./components/Notification";
import Layout from "./pages/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { fetchUser } from "./features/user/userSlice";
import { useDispatch } from "react-redux";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { addMessage } from "./features/messages/messagesSlice";
import {
  addNotification,
  fetchNotifications,
} from "./features/notifications/notificationsSlice";

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const dispatch = useDispatch();

  // Fetch user data + connections + notifications khi login
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
        dispatch(fetchNotifications(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // SSE listener — xử lý cả message lẫn notification
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      import.meta.env.VITE_BASEURL + "/api/message/" + user.id,
    );

    // Event: message
    eventSource.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);
        if (pathnameRef.current === "/messages/" + message.from_user_id._id) {
          dispatch(addMessage(message));
        } else {
          toast.custom((t) => <Notification t={t} message={message} />, {
            position: "bottom-right",
          });
        }
      } catch (e) {
        console.error("Failed to parse SSE message", e);
      }
    });

    // Event: notification ← MỚI
    eventSource.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data);
        dispatch(addNotification(notification));

        // Hiển thị toast thông báo
        let messageText = "";
        const actorName = notification.actor?.full_name || "Ai đó";
        const preview = notification.preview_text || "";
        switch (notification.type) {
          case "like_post":
            messageText = `${actorName} đã thích bài viết của bạn.`;
            break;
          case "comment_post":
            messageText = `${actorName} đã bình luận: "${preview}".`;
            break;
          case "reply_comment":
            messageText = `${actorName} đã trả lời bình luận của bạn: "${preview}".`;
            break;
          case "like_comment":
            messageText = `${actorName} đã thích bình luận của bạn.`;
            break;
          case "follow":
            messageText = `${actorName} đã theo dõi bạn.`;
            break;
          case "repost":
            messageText = `${actorName} đã đăng lại bài viết của bạn.`;
            break;
          case "connection_request":
            messageText = `${actorName} đã gửi yêu cầu kết nối.`;
            break;
          case "connection_accepted":
            messageText = `${actorName} đã chấp nhận yêu cầu kết nối.`;
            break;
          default:
            messageText = `${actorName} đã tương tác với bạn.`;
        }
        toast(messageText, { icon: "🔔", position: "bottom-right" });
      } catch (e) {
        console.error("Failed to parse SSE notification", e);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messenges />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connection />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
