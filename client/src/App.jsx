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
const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        import.meta.env.VITE_BASEURL + "/api/message/" + user.id,
      );
      eventSource.onmessage = (event) => {
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
      };
      // Keep connection open; close on cleanup
      return () => {
        eventSource.close();
      };
    }
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
