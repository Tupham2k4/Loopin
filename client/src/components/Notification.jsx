import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Notification = ({ t, message }) => {
  const navigate = useNavigate();
  return (
    <div className="w-64 bg-white shadow rounded-lg flex items-center gap-3 p-2 border border-gray-200 hover:scale-105 transition-transform">
      <img
        src={message.from_user_id.profile_picture}
        alt=""
        className="h-8 w-8 rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">
          {message.from_user_id.full_name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {message.text.slice(0, 60)}
        </p>
      </div>
      <button
        onClick={() => {
          navigate(`/messages/${message.from_user_id._id}`);
          toast.dismiss(t.id);
        }}
        className="ml-2 px-2 py-1 text-xs bg-indigo-500 text-white rounded"
        aria-label="Reply"
      >
        Trả lời
      </button>
    </div>
  );
};

export default Notification;
