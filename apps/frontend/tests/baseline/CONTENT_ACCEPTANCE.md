# Content / Legal Pages Acceptance & Baseline Comparison Matrix

Bảng nghiệm thu trang Nội dung / Pháp lý (`chinh-sach-bao-mat` / `en/privacy-policy`, cùng biến thể điều khoản `dieu-khoan-su-dung` / `en/terms-of-use`, story tracer legal pages) so sánh với baseline clone trên 8 kích thước viewport chuẩn và 2 ngôn ngữ (`vi`, `en`).

| Key | Viewport (px) | Kết quả Local | Kết quả Staging | Phân loại diff | Max diff ratio | Ghi chú & Lý do phân loại |
| --- | --- | --- | --- | --- | --- | --- |
| content-vi | 390 | PASS (diff 0.168) | PENDING | accepted | 0.173 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 549 | PASS (diff 0.128) | PENDING | accepted | 0.134 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 550 | PASS (diff 0.201) | PENDING | accepted | 0.207 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 768 | PASS (diff 0.165) | PENDING | accepted | 0.171 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 849 | PASS (diff 0.134) | PENDING | accepted | 0.139 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 850 | PASS (diff 0.135) | PENDING | accepted | 0.140 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 1280 | PASS (diff 0.081) | PENDING | accepted | 0.087 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-vi | 1440 | PASS (diff 0.073) | PENDING | accepted | 0.078 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 390 | PASS (diff 0.148) | PENDING | regression | 0.153 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 549 | PASS (diff 0.137) | PENDING | regression | 0.142 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 550 | PASS (diff 0.191) | PENDING | regression | 0.197 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 768 | PASS (diff 0.163) | PENDING | regression | 0.169 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 849 | PASS (diff 0.155) | PENDING | regression | 0.160 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 850 | PASS (diff 0.156) | PENDING | regression | 0.161 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 1280 | PASS (diff 0.073) | PENDING | regression | 0.078 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-en | 1440 | PASS (diff 0.065) | PENDING | regression | 0.070 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 390 | PASS (diff 0.169) | PENDING | accepted | 0.175 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 549 | PASS (diff 0.128) | PENDING | accepted | 0.134 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 550 | PASS (diff 0.168) | PENDING | accepted | 0.173 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 768 | PASS (diff 0.143) | PENDING | accepted | 0.149 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 849 | PASS (diff 0.153) | PENDING | accepted | 0.159 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 850 | PASS (diff 0.155) | PENDING | accepted | 0.160 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 1280 | PASS (diff 0.088) | PENDING | accepted | 0.094 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-vi | 1440 | PASS (diff 0.079) | PENDING | accepted | 0.085 | Ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 390 | PASS (diff 0.168) | PENDING | regression | 0.174 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 549 | PASS (diff 0.146) | PENDING | regression | 0.151 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 550 | PASS (diff 0.230) | PENDING | regression | 0.236 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 768 | PASS (diff 0.181) | PENDING | regression | 0.186 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 849 | PASS (diff 0.145) | PENDING | regression | 0.151 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 850 | PASS (diff 0.148) | PENDING | regression | 0.154 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 1280 | PASS (diff 0.085) | PENDING | regression | 0.091 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |
| content-terms-en | 1440 | PASS (diff 0.076) | PENDING | regression | 0.081 | CTA footer EN dùng id VI text-43480091 thay vì CSS EN #text-3886040369 (FooterCTA.tsx), phân loại regression, owner epic-fidelity-and-handoff; ảnh hero banner dùng contact_hero_bg.jpg (A38); font fallback; rebrand Sova |

Max diff ratio = tỉ lệ pixel lệch (`baselineDiffRatio`, hai ảnh pad về cùng kích thước) đo bằng `npm run baseline:sova` ngày 2026-10-10, cộng 0.005 rồi làm tròn lên 3 chữ số. Spec fail khi ảnh khớp baseline (hàng cũ, cần xoá) hoặc khi diff vượt max ratio (regression mới trong ô đã log). Sửa một diff thì chạy lại và cập nhật ratio.
