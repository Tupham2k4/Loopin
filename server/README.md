# Loopin — Server (Backend)

Server API cho Loopin, sử dụng Node.js + Express và MongoDB. Chịu trách nhiệm xác thực, quản lý người dùng, xử lý uploads, nhắn tin và các workflow nền (Inngest).

## Tính năng chính (server)

- REST API cho user, post, story, message.
- Xử lý upload file qua Multer, lưu và chuyển tiếp ảnh lên ImageKit.
- Nhắn tin thời gian thực: SSE endpoint `/api/message/:userId`.
- Các workflow tự động (Inngest): đồng bộ user từ Clerk, gửi email reminder, xóa story sau 24h, v.v.

# Loopin — Server (Backend)

Server của Loopin chịu trách nhiệm cung cấp REST API, xử lý upload media, quản lý dữ liệu người dùng và thông tin nhắn, đồng thời chạy các workflow nền (Inngest) như gửi email nhắc và xóa story.

---

## Tính năng chính

- REST API cho user, post, story, message.
- Upload: Multer xử lý multipart, ảnh được upload/host qua ImageKit.
- Nhắn tin thời gian thực: SSE endpoint `/api/message/:userId`.
- Workflows: Inngest functions cho cron / email / delayed jobs.

---

## Yêu cầu & biến môi trường

- Node.js >= 18
- MongoDB connection URI (`MONGODB_URI`)
- ImageKit: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- Email (Nodemailer): `EMAIL_USER`, `EMAIL_PASS`
- `FRONTEND_URL` — frontend base URL dùng trong email templates

Tất cả biến cấu hình đặt trong file `.env` theo hướng dẫn ở phần cài đặt.

---

## Cài đặt & chạy

```bash
cd server
npm install
# dev
npm run serer
```

---

## API chính (tổng quan)

Tiền tố: `/api`

### User

- `GET /api/user/data` — (protected) lấy dữ liệu user hiện tại.
- `POST /api/user/update` — (protected) cập nhật profile (multipart).
- `POST /api/user/discover` — tìm người theo input.
- `POST /api/user/follow` — follow user.
- `POST /api/user/unfollow` — unfollow user.
- `POST /api/user/connect` — gửi yêu cầu kết nối.
- `POST /api/user/accept` — chấp nhận kết nối.
- `GET /api/user/connections` — lấy connections/followers/following/pending.

### Post

- `POST /api/post/add` — tạo post (multipart).
- `GET /api/post/feed` — lấy feed.
- `POST /api/post/like` — like post.

### Story

- `POST /api/story/create` — tạo story (multipart).
- `GET /api/story/get` — lấy stories.

### Message

- `GET /api/message/:userId` — SSE endpoint cho userId (EventSource).
- `POST /api/message/send` — gửi tin nhắn (multipart).
- `POST /api/message/get` — lấy lịch sử chat 1-1.

---

## Database models (chính)

- `User` — profile, followers, following, connections.
- `Post` — nội dung bài đăng, ảnh, likes.
- `Story` — media tạm thời.
- `Message` — text/image, seen flag.
- `Connection` — trạng thái kết nối.

---

## Inngest (workflows)

- `sync-user-from-clerk` — đồng bộ user khi có sự kiện Clerk.
- `send-new-connection-request-reminder` — gửi email nhắc sau 24h nếu chưa accept.
- `story-delete` — xóa story theo lịch trình.

---

## Thử nghiệm nhanh (curl)

Gửi message (text):

```bash
curl -X POST 'http://localhost:4000/api/message/send' \
  -H "Authorization: Bearer <TOKEN>" \
  -F "to_user_id=<TARGET_USER_ID>" \
  -F "text=Xin chào"
```

Kết nối SSE từ terminal (ví dụ dùng `curl`):

```bash
curl -N http://localhost:4000/api/message/<yourUserId>
```

---

## Cấu trúc thư mục (Directory Tree)

```
server/
├─ configs/
│  ├─ db.js
│  ├─ imageKit.js
│  └─ multer.js
├─ controllers/
│  ├─ messengeController.js
│  ├─ postController.js
│  ├─ storyController.js
│  └─ userController.js
├─ models/
├─ routes/
├─ inngest/
│  └─ index.js
├─ middlewares/
├─ package.json
└─ server.js
```

---

## Roadmap / Các chức năng chưa hoàn thiện

- Admin panel & RBAC (role-based access control).
- Comments & sharing features for posts.
- Push notifications (APNs/FCM) cho mobile apps.
- Rate limiting, validation & security hardening.

---

Nếu bạn muốn, tôi có thể mở rộng phần API reference bằng ví dụ request/response chi tiết cho từng endpoint hoặc viết hướng dẫn deploy server lên Vercel/Render.

© Loopin — Backend docs

- Admin panel + role-based access control.
- Hệ thống comments & chia sẻ (share) cho post.
- Notifications push (APNs / FCM) nếu cần mobile push.

---

Nếu bạn muốn, tôi sẽ:

- Thêm ví dụ chi tiết cho từng endpoint (request/response mẫu).
- Viết hướng dẫn deploy Vercel cho cả client/server (server dạng serverless handler được hỗ trợ).

© Loopin — Backend docs
