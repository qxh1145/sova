# Site Shell Acceptance Matrix

Bảng nghiệm thu khung giao diện (Site Shell) trên 8 kích thước viewport chuẩn và 2 ngôn ngữ (`vi`, `en`).

| Viewport (px) | Locale / Route     | Kết quả Local | Kết quả Staging                                                 | Phân loại diff vs clone | Ghi chú & Lý do phân loại                                                                                                                |
| ------------- | ------------------ | ------------- | --------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 390           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Brand/wordmark/copy Sova thay thế Eras theo thiết kế; không tràn ngang; không trùng lặp ID; menu drawer & consult popup hoạt động chuẩn. |
| 549           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Điểm ngắt mobile tối đa: header wrapper ẩn khi stuck theo CSS source; layout vừa vặn không tràn.                                         |
| 550           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Điểm ngắt tablet nhỏ: header wrapper hiển thị dạng stuck (70px); nav icon mobile.                                                        |
| 768           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Tablet chuẩn: accordion menu drawer ẩn ở breakpoint này; cấu trúc shell khớp nguồn.                                                      |
| 849           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Điểm ngắt tablet tối đa: mobile nav vẫn hiển thị; desktop nav ẩn; không tràn ngang.                                                      |
| 850           | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Điểm ngắt desktop tối thiểu: chuyển sang desktop nav đầy đủ cùng language switcher inline.                                               |
| 1280          | `vi` (`/`)         | PASS          | PASS                                                            | accepted                | Desktop tiêu chuẩn: container 1170px căn giữa; sticky header 90px → 70px mượt mà.                                                        |
| 1440          | `vi` (`/`)         | PASS          | FAIL (acceptance.spec.ts:231 Client navigation between locales) | accepted                | Desktop màn rộng: shell ổn định, sticky header 90px → 70px; không tràn ngang.                                                            |
| 390           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh mobile: nhãn tiếng Anh, form consult tiếng Anh ("Demo — no data was sent"); không tràn ngang.                              |
| 549           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh mobile breakpoint tối đa: header stuck ẩn đúng quy tắc legacy CSS.                                                         |
| 550           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh tablet nhỏ: header stuck 70px; không lỗi console hay trùng ID.                                                             |
| 768           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh tablet: language switcher trỏ về VI (`/`); drawer hiển thị tiếng Anh.                                                      |
| 849           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh tablet tối đa: mobile nav tiếng Anh; không tràn ngang.                                                                     |
| 850           | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh desktop tối thiểu: desktop nav tiếng Anh hiển thị; switcher inline sẵn sàng.                                               |
| 1280          | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh desktop: sticky header 90px → 70px; cấu trúc shell đối xứng bản VI.                                                        |
| 1440          | `en` (`/en/home/`) | PASS          | PASS                                                            | accepted                | Bản tiếng Anh màn rộng: hoàn tất nghiệm thu local; không lỗi layout.                                                                     |

## Hướng dẫn nghiệm thu Staging (HITL)

Sau khi deploy lên Vercel:

1. Chạy lệnh:
   ```bash
   cd apps/frontend
   STAGING_URL=https://<your-preview>.vercel.app npm run test:e2e:staging
   ```
   (Thêm `VERCEL_AUTOMATION_BYPASS_SECRET=<secret>` nếu project bật SSO / Deployment Protection).
2. Điền cột **Kết quả Staging** cho từng hàng: `PASS` khi mọi test `test:e2e:staging` phủ hàng đó đạt; `FAIL (<test id>)` khi một test phủ hàng đó thất bại, kể cả khi test dừng trước bước của hàng.
