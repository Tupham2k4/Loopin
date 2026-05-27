# Loopin — Ứng dụng Mạng Xã Hội (Social Network)

Loopin là một ứng dụng mạng xã hội hướng đến trải nghiệm kết nối và nhắn tin thời gian thực, thiết kế để mô phỏng các tương tác xã hội hiện đại (Messenger, Instagram, Zalo). Dự án tách thành hai phần chính: `client` (React + Vite) và `server` (Node.js + Express + MongoDB).

📌 Mục tiêu: xây dựng nền tảng nhẹ, mở rộng được, tập trung vào kết nối 1-1, chia sẻ nội dung và trải nghiệm nhắn tin mượt mà.

## ✨ Tính năng chính

- Đăng nhập & quản lý user (Clerk).
- Hồ sơ người dùng: avatar, cover, bio, username.
- Kết nối: follow, connect requests, accept/reject.
- Nhắn tin 1-1: text & image, lưu lịch sử, đánh dấu seen.
- Thông báo thời gian thực: SSE (EventSource) + toast notification.
- Feed & Post: đăng ảnh, like.
- Stories tạm thời: tự động xóa sau 24 giờ (Inngest workflows).

## 🚀 Cài đặt nhanh (dev)

1. Clone repository

```bash
git clone <repo-url>
cd Social-Media
```

2. Chạy server

```bash
cd server
npm install
npm run dev
```

3. Chạy client

```bash
cd client
npm install
npm run dev
```

Ghi chú: cấu hình các biến môi trường (Xem `client/README.md` và `server/README.md`).

## 📁 Cấu trúc thư mục (Directory Tree)

```
Social-Media/
├─ client/                 # Frontend React + Vite
│  ├─ public/
│  ├─ src/
│  │  ├─ api/ (axios instance)
│  │  ├─ app/ (redux store)
│  │  ├─ components/
│  │  ├─ features/ (redux slices)
│  │  └─ pages/
│  ├─ package.json
│  └─ vite.config.js
├─ server/                 # Backend Node.js + Express
│  ├─ configs/ (db, multer, imagekit)
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ inngest/ (inngest functions)
│  ├─ middlewares/
│  ├─ package.json
│  └─ server.js
└─ README.md
```

# Loopin — Social Networking App

Loopin là một ứng dụng mạng xã hội nhẹ, tập trung vào kết nối, nhắn tin thời gian thực và chia sẻ nội dung ngắn. Dự án được tách thành hai phần chính: `client` (frontend React/Vite) và `server` (API Node.js/Express + MongoDB).

**Mục tiêu dự án**

- Cung cấp trải nghiệm tương tác giống các ứng dụng mạng xã hội hiện đại (như Messenger, Instagram, Zalo).
- Hỗ trợ kết nối, theo dõi, nhắn tin thời gian thực, stories và post feed.

---

**Tính năng chính**

- Đăng nhập đồng bộ với Clerk (user management).
- Hồ sơ người dùng: avatar, cover, bio, username.
- Kết nối (follow / connect / accept request).
- Nhắn tin 1-1 với SSE (Server-Sent Events) cho thông báo tin nhắn thời gian thực.
- Feed bài viết, upload ảnh (một số giới hạn).
- Stories tạm thời (auto-delete sau 24h qua Inngest).

**Các chức năng chưa hoàn thiện / roadmap**

- Admin dashboard và quyền quản trị.
- Hệ thống bình luận đầy đủ (comment threads, like comment).
- Chia sẻ post (reshare / repost) và chia sẻ qua link.
- Notification center trên server (push notifications đa nền tảng).

---

**Kiến trúc tổng quan**

- Frontend: React + Vite, state quản lý bằng Redux.
- Backend: Node.js + Express, MongoDB (mongoose).
- Auth: Clerk (SSO).
- File uploads: Multer + ImageKit (image hosting / URLs).
- Nhắn tin thời gian thực: SSE trên endpoint `/api/message/:userId`.
- Jobs & workflow: Inngest functions (user sync, email reminders, cron tasks).

---

**Tài nguyên**

- Client: [client README](client/README.md)
- Server: [server README](server/README.md)

## Cấu trúc thư mục (Directory Tree)

```
Social-Media/
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ api/axios.js
│  │  ├─ app/store.js
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ features/
│  │  └─ pages/
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ configs/
│  ├─ controllers/
│  │  ├─ messengeController.js
│  │  └─ userController.js
│  ├─ models/
│  ├─ routes/
│  ├─ inngest/
│  ├─ package.json
│  └─ server.js
```
© Loopin — demo version 1.0
