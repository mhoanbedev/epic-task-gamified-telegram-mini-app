# Epic Task Gamified - Telegram Mini App (Backend)

Đây là phần backend cho ứng dụng quản lý công việc được trò chơi hóa "Epic Task Gamified", được thiết kế để hoạt động như một Telegram Mini App. Mục tiêu của dự án là tăng cường sự hứng thú và động lực cho người dùng trong việc hoàn thành nhiệm vụ hàng ngày thông qua các yếu tố game.

##  Tính năng chính

*   **Xác thực Người dùng:** Đăng nhập/Đăng ký an toàn thông qua dữ liệu người dùng từ Telegram.
*   **Quản lý Nhiệm vụ (CRUD):** Tạo, xem, sửa, xóa và đánh dấu hoàn thành nhiệm vụ.
*   **Hệ thống Gamification:**
    *   **Điểm kinh nghiệm (XP):** Người dùng nhận XP khi hoàn thành nhiệm vụ.
    *   **Lên cấp (Level):** Tăng cấp khi đạt đủ mốc XP.
    *   **Huy hiệu (Badges):** Nhận huy hiệu thành tích khi đạt được các cột mốc nhất định (ví dụ: hoàn thành số lượng task, đạt level cụ thể).
*   **Bảng Xếp Hạng (Leaderboard):** Hiển thị top người dùng dựa trên tổng XP, cập nhật real-time bằng Redis.
*   **Thông tin Profile User:** Hiển thị thông tin cá nhân, level, XP, danh sách task và huy hiệu đã nhận.
*   **Tích hợp Telegram Bot:** Xử lý lệnh `/start` để cung cấp lối vào Mini App và tiềm năng gửi thông báo.

##  Công nghệ sử dụng

*   **Nền tảng:** Node.js
*   **Framework Web:** Express.js
*   **Cơ sở dữ liệu chính:** MongoDB (với Mongoose ODM)
*   **Cơ sở dữ liệu In-memory/Cache:** Redis (với ioredis client)
*   **Quản lý Session:** express-session với connect-mongo
*   **Telegram Bot:** Telegraf.js
*   **Biến môi trường:** dotenv
*   **Xử lý CORS:** cors
*   **(Công cụ phát triển):** Nodemon

##  API Server Trực Tuyến

Backend của ứng dụng này hiện đang được triển khai và hoạt động tại:

**`https://epic-task-gamified-telegram-mini-app.onrender.com`** 


##  Cài đặt và Chạy dự án (Hướng dẫn cho Local Development)

1.  **Clone repository:**
    ```bash
    git clone https://github.com/mhoanbedev/epic-task-gamified-telegram-mini-app.git
    cd tg-gamified-tasks-backend
    ```
2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
3.  **Cấu hình môi trường:**
    *   Tạo file `.env` ở thư mục gốc của dự án.
    *   Nội dung từ file `.env` và thêm:
        ```
        PORT=1338
        MONGO_URI=mongodb://localhost:27017/telegramgame_new  # MongoDB sẽ tự tạo database 'telegramgame_new' nếu chưa có.
        SESSION_SECRET=your_actual_session_secret_here # <--- QUAN TRỌNG: Thay thế bằng secret của bạn
        REDIS_URL=redis://172.25.247.240:6379/0 (nếu Redis chạy local)
        TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here  # QUAN TRỌNG: Thay thế bằng token của bạn
        MINI_APP_URL= https://google.com  # (Hiện tại chưa có giao diện của Frontend, dùng URL placeholder)
        ```
     *   **QUAN TRỌNG:** Đảm bảo bạn đã thay thế các giá trị placeholder `your_actual_session_secret_here` và `your_actual_telegram_bot_token_here` bằng các giá trị bí mật thực tế của bạn. **Không bao giờ commit file `.env` thật lên GitHub.**
4.  **Đảm bảo MongoDB và Redis Server đang chạy** trên máy của bạn hoặc có thể truy cập được.
5.  **Khởi chạy Backend Server:**
    ```bash
    npm run dev
    ```
    Server sẽ chạy trên cổng được định nghĩa trong `PORT` (ví dụ: `http://localhost:1338`).
    
##  Triển khai (Deployment)

Ứng dụng backend này đã được triển khai trên nền tảng **Render**, kết hợp với các dịch vụ đám mây khác để tối ưu hóa hoạt động:

*   **Nền tảng Hosting Backend:** Render (Free Tier)
*   **API Base URL:** `https://epic-task-gamified-telegram-mini-app.onrender.com` 
*   **Cơ sở dữ liệu chính:** MongoDB Atlas (M0 Free Tier)
*   **Dịch vụ Redis (Cho Leaderboard & Session tiềm năng):** Upstash Redis (Free Tier)
    *   *URL kết nối Redis được cấu hình qua biến môi trường `REDIS_URL`.*
*   **Phiên bản Node.js trên Server (Render):** `20.19.0`
  
##  API Endpoints (Ví dụ một số API chính)
Sử dụng Base URL sau để kiểm tra: `https://epic-task-gamified-telegram-mini-app.onrender.com`
*   `POST /api/v1/auth/telegram`: Xác thực/Đăng ký người dùng.
*   `GET /api/v1/users/me`: Lấy thông tin profile người dùng hiện tại.
*   `POST /api/v1/tasks`: Tạo nhiệm vụ mới.
*   `GET /api/v1/tasks`: Lấy danh sách nhiệm vụ của người dùng.
*   `POST /api/v1/tasks/:id/complete`: Đánh dấu hoàn thành nhiệm vụ.
*   `GET /api/v1/leaderboard`: Lấy bảng xếp hạng.
*   `GET /api/v1/badges`: Lấy danh sách các loại huy hiệu.
  
### Chi tiết một số API quan trọng
#### 1. Xác thực / Đăng ký Người dùng

*   **Endpoint:** `POST /api/v1/auth/telegram`
*   **Mô tả:** Xử lý đăng nhập hoặc đăng ký người dùng mới dựa trên dữ liệu gửi lên từ Telegram.
*   **Xác thực:** Không yêu cầu.
*   **Request Body (application/json):**
    ```json
    {
      "user": {
        "id": "Number (Bắt buộc) - ID người dùng từ Telegram",
        "username": "String (Tùy chọn) - Username Telegram",
        "first_name": "String (Tùy chọn)",
        "last_name": "String (Tùy chọn)",
        "photo_url": "String (Tùy chọn) - URL ảnh đại diện"
      }
    }
    ```
*   **Response Thành Công (200 OK hoặc 201 Created):**
    ```json
    {
      "_id": "objectId",
      "telegramId": "String",
      "username": "String",
      "avatar": "String",
      "level": 1,
      "xp": 0,
      "createdAt": "Date",
      "updatedAt": "Date"
      // ... (Thông tin session cookie sẽ được gửi trong header)
    }
    ```
    
#### 2. Tạo Nhiệm vụ Mới
*   **Endpoint:** `POST /api/v1/tasks`
*   **Mô tả:** Tạo một nhiệm vụ mới cho người dùng đang đăng nhập.
*   **Xác thực:** Yêu cầu session cookie hợp lệ.
*   **Request Body (application/json):**
    ```json
    {
      "title": "String (Bắt buộc) - Tiêu đề của nhiệm vụ",
      "description": "String (Tùy chọn) - Mô tả chi tiết nhiệm vụ",
      "xpReward": "Number (Tùy chọn, mặc định 10) - XP thưởng khi hoàn thành",
      "deadline": "String (Tùy chọn, dạng ISO 8601 Date) - Hạn chót hoàn thành"
    }
    ```
*   **Response Thành Công (201 Created):**
    ```json
    {
      "_id": "objectId",
      "owner": "objectId",
      "title": "String",
      "description": "String",
      "xpReward": "Number",
      "deadline": "Date",
      "completed": false,
      "createdAt": "Date",
      "updatedAt": "Date"
    }
    ```
*   **Response Lỗi:**
    *   `400 Bad Request`: Nếu `title` bị thiếu hoặc dữ liệu không hợp lệ.
    *   `401 Unauthorized`: Nếu người dùng chưa đăng nhập.



##  Hướng phát triển tiếp theo

*   Hoàn thiện xác thực hash từ Telegram.
*   Triển khai gửi thông báo Telegram thực tế.
*   Mở rộng hệ thống huy hiệu với nhiều điều kiện hơn.
*   Xây dựng giao diện Admin (nếu cần).
*   Viết Unit Test và Integration Test.

---

## 💡 Thảo luận thêm & Liên hệ

Cảm ơn bạn đã dành thời gian xem xét dự án "Epic Task Gamified - Telegram Mini App (Backend)". Tôi rất mong muốn có cơ hội được thảo luận sâu hơn về dự án này, các kỹ thuật đã áp dụng, cũng như những thách thức và giải pháp trong quá trình phát triển.

Nếu bạn có bất kỳ câu hỏi nào hoặc muốn trao đổi thêm, vui lòng liên hệ với tôi qua:

*   **Email:** `Hoanvu2k5@gmail.com`
*   **Facebook:** `https://www.facebook.com/Hoannidalee`

Tôi luôn sẵn sàng học hỏi và tiếp thu các ý kiến đóng góp.

Trân trọng,
Vũ Minh Hoàn.
