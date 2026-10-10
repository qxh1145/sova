# Utility Pages Acceptance & Baseline Comparison Matrix

Bảng nghiệm thu các trang Tiện ích (`eras-xin-chan-thanh-cam-on-quy-khach`, `ho-so-nang-luc-eras-vietnam`, `en/porfolio-eras-vietnam`, `sample-page`, story 6.4) so sánh với baseline clone trên 8 kích thước viewport chuẩn và 2 ngôn ngữ (`vi`, `en`).

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

Max diff ratio = tỉ lệ pixel lệch (`baselineDiffRatio`, hai ảnh pad về cùng kích thước) đo bằng `npm run baseline:sova` ngày 2026-10-11, cộng 0.005 rồi làm tròn lên 3 chữ số. Spec fail khi ảnh khớp baseline (hàng cũ, cần xoá) hoặc khi diff vượt max ratio (regression mới trong ô đã log). Sửa một diff thì chạy lại và cập nhật ratio.
