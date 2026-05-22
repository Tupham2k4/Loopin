# Loopin — Client (Frontend)

Ứng dụng frontend của Loopin, xây dựng bằng React + Vite. Phục vụ phần giao diện: feed, profile, chat, stories và notifications.

---

## Tính năng chính

- Trang Feed: hiển thị bài đăng, ảnh, like.
- Profile: chỉnh sửa avatar, cover, bio.
- Connections: follow, pending, accept/reject.
- Chat 1-1: gửi text & ảnh, SSE để nhận message thời gian thực.
- Notifications: custom toast (react-hot-toast) với component `Notification`.

---

## Yêu cầu & biến môi trường

- Node.js >= 18
- `VITE_BASEURL` — URL backend (ví dụ `http://localhost:4000`)
- Clerk config (nếu dùng Clerk cho auth)

---

## Cài đặt & chạy (development)

```bash
cd client
npm install
npm run dev
```

Build production

```bash
npm run build
npm run preview
```

---

## Cấu trúc thư mục (Directory Tree)

```
client/
├─ public/
├─ src/
│  ├─ api/axios.js           # axios instance, baseURL
│  ├─ app/store.js           # Redux store
│  ├─ assets/                # static/dummy data
│  ├─ components/            # UI components (ChatBox, Notification...)
│  ├─ features/              # Redux slices (user, messages,...)
│  └─ pages/                 # Views (Feed, ChatBox, Connections...)
├─ package.json
└─ vite.config.js
```

---

## SSE & Notifications (chi tiết)

- Client kết nối SSE: `new EventSource(`${VITE_BASEURL}/api/message/${user.id}`)` và lắng nghe `onmessage`.
- Khi nhận message mới: nếu đang ở trang chat với người gửi → dispatch thêm message; nếu không → hiển thị custom toast `Notification`.

## Debugging nhanh

- Kiểm tra DevTools → Network → lọc `EventStream` để thấy kết nối SSE.
- Kiểm tra console log cho lỗi parse hoặc lỗi kết nối.

---

Nếu muốn mình có thể thêm hướng dẫn deploy cho frontend (Vercel) hoặc chỉnh animation cho notification.

# Loopin — Client (Frontend)

Đây là ứng dụng frontend của Loopin, xây dựng bằng React + Vite. Giao diện tập trung vào trải nghiệm nhắn tin và feed.

## Tính năng chính (client)

- Giao diện feed, profile, stories.
- Danh sách kết nối, chấp nhận/huỷ kết nối.
- Chat 1-1 với gửi ảnh và text.
- SSE listener để nhận thông báo tin nhắn thời gian thực và hiển thị toast notification.

## Yêu cầu

- Node.js 18+ (hoặc phiên bản tương thích).

## Biến môi trường quan trọng

- `VITE_BASEURL` — URL backend (ví dụ `http://localhost:4000`).
- Các biến Clerk (được cấu hình theo hướng dẫn Clerk) nếu cần đăng nhập cục bộ.

## Cài đặt & chạy (development)

```bash
cd client
npm install
npm run dev
```

Mặc định Vite sẽ mở ở `http://localhost:5173` (hoặc cổng khác do Vite chọn).

## Build production

```bash
npm run build
npm run preview
```

## Cấu trúc thư mục (chỉ mục chính)

- `src/` — mã nguồn chính
  - `api/axios.js` — instance axios dùng `VITE_BASEURL`
  - `app/store.js` — Redux store
  - `components/` — các component UI (ChatBox, Notification, PostCard...)
  - `pages/` — các trang (Feed, ChatBox, Connections...)
  - `features/` — slices Redux (user, messages, connections)

### Directory Tree

```
client/
├─ public/
├─ src/
│  ├─ api/axios.js
│  ├─ app/store.js
│  ├─ assets/
│  ├─ components/
│  ├─ features/
│  └─ pages/
├─ package.json
└─ vite.config.js
```

## SSE & Notifications

- Client tạo `EventSource` tới: `VITE_BASEURL + '/api/message/' + user.id` để nhận tin nhắn thời gian thực.
- Notifications hiển thị bằng `react-hot-toast` với custom component `Notification`.

## Debugging nhanh

- Kiểm tra DevTools → Network → lọc `EventStream` để thấy kết nối SSE.
- Console sẽ log lỗi parse hoặc kết nối.

## Ghi chú

- Một số UI/UX vẫn có thể tinh chỉnh (padding, màu, thời lượng toast).
- Nếu deploy ra môi trường production, cập nhật `VITE_BASEURL` tương ứng.

---

Nếu cần tôi có thể tối ưu style toast để giống Zalo hơn, hoặc thêm animation vào notification.
