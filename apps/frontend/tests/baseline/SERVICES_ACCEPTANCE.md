# Mobile App Service Pages Acceptance & Baseline Comparison Matrix

Bảng nghiệm thu trang dịch vụ Mobile App (`thiet-ke-app-mobile` / `en/app-mobile-development`) so sánh với baseline clone trên 8 kích thước viewport chuẩn và 2 ngôn ngữ (`vi`, `en`).

| Key       | Viewport (px) | Kết quả Local     | Kết quả Staging  | Phân loại diff | Max diff ratio | Ghi chú & Lý do phân loại                                                                                                                     |
| --------- | ------------- | ----------------- | ---------------- | -------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| mobile-vi | 390           | PASS (diff 0.282) | (chờ owner HITL) | accepted       | 0.302          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 slider carousel thay tab; ảnh SVG/WebP; font fallback & responsive wrap.   |
| mobile-vi | 549           | PASS (diff 0.289) | (chờ owner HITL) | accepted       | 0.309          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 slider carousel thay tab; ảnh SVG/WebP; font fallback & responsive wrap.   |
| mobile-vi | 550           | PASS (diff 0.276) | (chờ owner HITL) | accepted       | 0.296          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-vi | 768           | PASS (diff 0.314) | (chờ owner HITL) | accepted       | 0.334          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-vi | 849           | PASS (diff 0.303) | (chờ owner HITL) | accepted       | 0.323          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-vi | 850           | PASS (diff 0.304) | (chờ owner HITL) | accepted       | 0.324          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-vi | 1280          | PASS (diff 0.306) | (chờ owner HITL) | accepted       | 0.326          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-vi | 1440          | PASS (diff 0.314) | (chờ owner HITL) | accepted       | 0.334          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; font fallback & responsive wrap.             |
| mobile-en | 390           | PASS (diff 0.250) | (chờ owner HITL) | accepted       | 0.270          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 slider carousel thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).         |
| mobile-en | 549           | PASS (diff 0.274) | (chờ owner HITL) | accepted       | 0.294          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 slider carousel thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).         |
| mobile-en | 550           | PASS (diff 0.305) | (chờ owner HITL) | accepted       | 0.325          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |
| mobile-en | 768           | PASS (diff 0.291) | (chờ owner HITL) | accepted       | 0.311          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |
| mobile-en | 849           | PASS (diff 0.272) | (chờ owner HITL) | accepted       | 0.292          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |
| mobile-en | 850           | PASS (diff 0.272) | (chờ owner HITL) | accepted       | 0.292          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |
| mobile-en | 1280          | PASS (diff 0.262) | (chờ owner HITL) | accepted       | 0.282          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |
| mobile-en | 1440          | PASS (diff 0.269) | (chờ owner HITL) | accepted       | 0.289          | Section dự án tiêu biểu để trống chờ Story 9; rebrand Sova; A04 grid thay tab; ảnh SVG/WebP; duplicate FAQ item 2 & 3 (A26).                     |

Max diff ratio = tỉ lệ pixel lệch (`baselineDiffRatio`, hai ảnh pad về cùng kích thước) đo bằng `npm run baseline:sova` ngày 2026-10-07, cộng 0.02. Spec fail khi ảnh khớp baseline (hàng cũ, cần xoá) hoặc khi diff vượt max ratio (regression mới trong ô đã log). Sửa một diff thì chạy lại và cập nhật ratio.

## Hướng dẫn nghiệm thu Staging (HITL)

Sau khi deploy lên Vercel:

1. Chạy lệnh:
   ```bash
   cd apps/frontend
   STAGING_URL=https://<your-preview>.vercel.app npm run test:e2e:staging
   ```
   (Thêm `VERCEL_AUTOMATION_BYPASS_SECRET=<secret>` nếu project bật SSO / Deployment Protection).
2. Khi toàn bộ 33 test E2E staging đều PASS (bao gồm acceptance Mobile service pages cho cả `vi` và `en`): điền `PASS` vào cột **Kết quả Staging** cho toàn bộ 16 hàng ở trên.
