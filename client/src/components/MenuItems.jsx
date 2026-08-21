import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const MenuItems = ({ setSidebarOpen }) => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl ${isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`
          }
        >
          <Icon className="w-5 h-5" />
          <span className="flex-1">{label}</span>
          {label === "Notifications" && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
