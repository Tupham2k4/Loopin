import React from "react";
import { BadgeCheck } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const RepostCard = ({ originalPost }) => {
  const navigate = useNavigate();

  if (!originalPost) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <p className="text-sm text-gray-400 italic">
          The original article no longer exists.
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/profile/${originalPost.user?._id}`);
      }}
      className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <img
          src={originalPost.user?.profile_picture}
          alt=""
          className="w-7 h-7 rounded-full object-cover shadow-sm"
        />
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">
            {originalPost.user?.full_name}
          </span>
          <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs text-gray-400">
            @{originalPost.user?.username}
          </span>
          <span className="text-xs text-gray-300 mx-1">·</span>
          <span className="text-xs text-gray-400">
            {moment(originalPost.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {originalPost.content && (
        <p className="text-sm text-gray-700 line-clamp-3 mb-2">
          {originalPost.content}
        </p>
      )}

      {originalPost.image_urls?.length > 0 && (
        <div className="mt-1">
          <img
            src={originalPost.image_urls[0]}
            alt=""
            className={`w-full object-cover rounded-lg ${
              originalPost.image_urls.length > 1 ? "h-40" : "max-h-64"
            }`}
          />
          {originalPost.image_urls.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">
              +{originalPost.image_urls.length - 1} Other photo
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RepostCard;
