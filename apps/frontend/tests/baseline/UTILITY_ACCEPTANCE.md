# Utility Pages Acceptance & Baseline Comparison Matrix

Bảng nghiệm thu các trang Tiện ích (`eras-xin-chan-thanh-cam-on-quy-khach`, `ho-so-nang-luc-eras-vietnam`, `en/porfolio-eras-vietnam`, `sample-page`, `login-eras`, `huong-dan-thanh-toan`, `en/payment-guide`, story 6.4, 6.7, 6.9) so sánh với baseline clone trên 8 kích thước viewport chuẩn và 2 ngôn ngữ (`vi`, `en`).

| Key | Viewport (px) | Kết quả Local | Kết quả Staging | Phân loại diff | Max diff ratio | Ghi chú & Lý do phân loại |
| --- | --- | --- | --- | --- | --- | --- |
| profile-vi | 390 | PASS (diff 0.266) | PENDING | accepted | 0.272 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 549 | PASS (diff 0.233) | PENDING | accepted | 0.239 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 550 | PASS (diff 0.414) | PENDING | accepted | 0.420 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 768 | PASS (diff 0.400) | PENDING | accepted | 0.405 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 849 | PASS (diff 0.401) | PENDING | accepted | 0.407 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 850 | PASS (diff 0.404) | PENDING | accepted | 0.409 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 1280 | PASS (diff 0.330) | PENDING | accepted | 0.336 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-vi | 1440 | PASS (diff 0.319) | PENDING | accepted | 0.325 | Lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 390 | PASS (diff 0.254) | PENDING | regression | 0.259 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 549 | PASS (diff 0.237) | PENDING | regression | 0.242 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 550 | PASS (diff 0.492) | PENDING | regression | 0.498 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 768 | PASS (diff 0.465) | PENDING | regression | 0.470 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 849 | PASS (diff 0.416) | PENDING | regression | 0.422 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 850 | PASS (diff 0.419) | PENDING | regression | 0.424 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 1280 | PASS (diff 0.336) | PENDING | regression | 0.341 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| profile-en | 1440 | PASS (diff 0.321) | PENDING | regression | 0.326 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; lược bỏ flipbook/PDF (A43); lược bỏ breadcrumb (A44); font fallback; rebrand Sova |
| thank-you-vi | 390 | PASS (diff 0.126) | PENDING | accepted | 0.131 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 549 | PASS (diff 0.110) | PENDING | accepted | 0.116 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 550 | PASS (diff 0.190) | PENDING | accepted | 0.196 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 768 | PASS (diff 0.164) | PENDING | accepted | 0.170 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 849 | PASS (diff 0.149) | PENDING | accepted | 0.155 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 850 | PASS (diff 0.151) | PENDING | accepted | 0.157 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 1280 | PASS (diff 0.065) | PENDING | accepted | 0.071 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| thank-you-vi | 1440 | PASS (diff 0.059) | PENDING | accepted | 0.064 | Nhãn demo badge hiển thị có điều kiện (A45); font fallback; rebrand Sova |
| sample-vi | 390 | PASS (diff 0.125) | PENDING | accepted | 0.130 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 549 | PASS (diff 0.126) | PENDING | accepted | 0.131 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 550 | PASS (diff 0.211) | PENDING | accepted | 0.216 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 768 | PASS (diff 0.212) | PENDING | accepted | 0.218 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 849 | PASS (diff 0.181) | PENDING | accepted | 0.186 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 850 | PASS (diff 0.182) | PENDING | accepted | 0.187 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 1280 | PASS (diff 0.090) | PENDING | accepted | 0.095 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| sample-vi | 1440 | PASS (diff 0.082) | PENDING | accepted | 0.087 | Link dashboard trỏ /wp-admin/; font fallback; rebrand Sova |
| login-vi | 390 | PASS (diff 0.726) | PENDING | accepted | 0.731 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 549 | PASS (diff 0.727) | PENDING | accepted | 0.732 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 550 | PASS (diff 0.727) | PENDING | accepted | 0.732 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 768 | PASS (diff 0.740) | PENDING | accepted | 0.745 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 849 | PASS (diff 0.939) | PENDING | accepted | 0.944 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 850 | PASS (diff 0.939) | PENDING | accepted | 0.944 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 1280 | PASS (diff 0.863) | PENDING | accepted | 0.868 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| login-vi | 1440 | PASS (diff 0.834) | PENDING | accepted | 0.839 | Baseline chụp source không có Bootstrap 5.0.2 (capture chặn mọi host ngoài mirror, gồm cdn.jsdelivr.net — tests/baseline/source.ts:88) nên source xếp dọc, font serif; Sova dựng đúng layout `.row` hai cột bằng subset (A48); SVG icon thay dashicons (A50); wordmark thay logo Eras (A51); lược bỏ redirect_to/testcookie (A52) |
| payment-vi | 390 | PASS (diff 0.168) | PENDING | accepted | 0.174 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 549 | PASS (diff 0.186) | PENDING | accepted | 0.192 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 550 | PASS (diff 0.216) | PENDING | accepted | 0.221 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 768 | PASS (diff 0.178) | PENDING | accepted | 0.183 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 849 | PASS (diff 0.173) | PENDING | accepted | 0.179 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 850 | PASS (diff 0.165) | PENDING | accepted | 0.170 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 1280 | PASS (diff 0.101) | PENDING | accepted | 0.106 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-vi | 1440 | PASS (diff 0.093) | PENDING | accepted | 0.099 | Mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 390 | PASS (diff 0.159) | PENDING | regression | 0.164 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 549 | PASS (diff 0.190) | PENDING | regression | 0.195 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 550 | PASS (diff 0.218) | PENDING | regression | 0.223 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 768 | PASS (diff 0.218) | PENDING | regression | 0.223 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 849 | PASS (diff 0.182) | PENDING | regression | 0.188 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 850 | PASS (diff 0.182) | PENDING | regression | 0.188 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 1280 | PASS (diff 0.103) | PENDING | regression | 0.108 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |
| payment-en | 1440 | PASS (diff 0.085) | PENDING | regression | 0.091 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; mock account; QR slot ngân hàng và MoMo missing-media (A47); step-2 đặt sau account row (A47); font fallback; rebrand Sova |

Max diff ratio = tỉ lệ pixel lệch (`baselineDiffRatio`, hai ảnh pad về cùng kích thước) đo bằng `npm run baseline:sova` ngày 2026-10-11, cộng 0.005 rồi làm tròn lên 3 chữ số. Spec fail khi ảnh khớp baseline (hàng cũ, cần xoá) hoặc khi diff vượt max ratio (regression mới trong ô đã log). Sửa một diff thì chạy lại và cập nhật ratio.

## Hướng dẫn nghiệm thu Staging (HITL)

Sau khi deploy lên Vercel:

1. Chạy lệnh:
   ```bash
   cd apps/frontend
   STAGING_URL=https://<your-preview>.vercel.app npm run test:e2e:staging
   ```
   (Thêm `VERCEL_AUTOMATION_BYPASS_SECRET=<secret>` nếu project bật SSO / Deployment Protection).
2. Khi toàn bộ 84 test E2E staging đều PASS (bao gồm acceptance Home, Collections, Services/About, và Utility cho cả `vi` và `en`): điền `PASS` vào cột **Kết quả Staging** cho toàn bộ 56 hàng ở trên, cùng các bảng nghiệm thu Content, FAQ, và Contact liên quan.
