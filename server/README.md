# Loopin — Server (Backend)

Server API cho Loopin, sử dụng Node.js + Express và MongoDB. Chịu trách nhiệm xác thực, quản lý người dùng, xử lý uploads, nhắn tin và các workflow nền (Inngest).

## Tính năng chính (server)

- REST API cho user, post, story, message.
- Xử lý upload file qua Multer, lưu và chuyển tiếp ảnh lên ImageKit.
- Nhắn tin thời gian thực: SSE endpoint `/api/message/:userId`.
- Các workflow tự động (Inngest): đồng bộ user từ Clerk, gửi email reminder, xóa story sau 24h, v.v.

## Yêu cầu

- Node.js 18+
- MongoDB URI (Atlas hoặc local)

## Biến môi trường quan trọng

- `MONGODB_URI` — kết nối MongoDB.
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` — nếu dùng ImageKit.
- `NODEMAILER_*` — thông tin SMTP để gửi mail (nếu sử dụng).
- `FRONTEND_URL` — URL frontend (dùng trong email template).
- `VERCEL` — biến môi trường để chuyển sang chế độ serverless nếu cần.

## Cài đặt & chạy (development)

```bash
cd server
npm install
# development
npm run dev
# hoặc production
npm start
```

## Endpoints chính (tổng quan)

> tất cả tiền tố đều bắt đầu với `/api`

### User (`/api/user`)

- `GET /api/user/data` — (protected) lấy dữ liệu user hiện tại.
- `POST /api/user/update` — (protected, multipart) cập nhật profile (profile/cover image).
- `POST /api/user/discover` — (protected) tìm người dùng theo input.
- `POST /api/user/follow` — (protected) follow user.
- `POST /api/user/unfollow` — (protected) unfollow user.
- `POST /api/user/connect` — (protected) gửi yêu cầu kết nối.
- `POST /api/user/accept` — (protected) chấp nhận kết nối.
- `GET /api/user/connections` — (protected) lấy danh sách connections / followers / following / pending.
- `POST /api/user/profiles` — lấy profile public (không protected).
- `GET /api/user/recent-messages` — (protected) recent messages list.

### Post (`/api/post`)

- `POST /api/post/add` — (protected, multipart) tạo post (upload images).
- `GET /api/post/feed` — (protected) lấy feed.
- `POST /api/post/like` — (protected) like post.

### Story (`/api/story`)

- `POST /api/story/create` — (protected, multipart) tạo story (upload media).
- `GET /api/story/get` — (protected) lấy stories của user + connections.

### Message (`/api/message`)

- `GET /api/message/:userId` — SSE endpoint để client lắng nghe tin nhắn đến cho `userId`.
- `POST /api/message/send` — (protected, multipart) gửi tin nhắn (text hoặc image).
- `POST /api/message/get` — (protected) lấy lịch sử chat 1-1 với `to_user_id` trong body.

## Database (models chính)

- `User` — người dùng (profile, followers, following, connections).
- `Post` — bài đăng, ảnh, likes.
- `Story` — story tạm thời.
- `Message` — lưu tin nhắn 1-1 (text, image, seen flag).
- `Connection` — trạng thái kết nối giữa người dùng.

## Inngest workflows

- `sync-user-from-clerk` — sync user sau khi được tạo/updated/deleted từ Clerk.
- `send-new-connection-request-reminder` — gửi email nhắc trong 24h nếu chưa accept.
- `story-delete` — xóa story sau 24h.

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

## Ví dụ nhanh (gửi tin)

```bash
curl -X POST 'http://localhost:4000/api/message/send' \
  -H "Authorization: Bearer <TOKEN>" \
  -F "to_user_id=<TARGET_USER_ID>" \
  -F "text=Xin chào"
```

## SSE test

- Kết nối SSE từ client: `new EventSource('<BASEURL>/api/message/<yourId>')` và lắng nghe `onmessage`.

## Các công việc tiếp theo / limitations

- Thiết lập rate-limiting / validation nâng cao cho API.
- Admin panel + role-based access control.
- Hệ thống comments & chia sẻ (share) cho post.
- Notifications push (APNs / FCM) nếu cần mobile push.

---

Nếu bạn muốn, tôi sẽ:

- Thêm ví dụ chi tiết cho từng endpoint (request/response mẫu).
- Viết hướng dẫn deploy Vercel cho cả client/server (server dạng serverless handler được hỗ trợ).

© Loopin — Backend docs
