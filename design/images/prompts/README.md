# Text-to-image prompts

SVG can only approximate soft 3D, so every illustration ships as an SVG-built WebP/PNG **and** a
prompt here for generating a richer version elsewhere (Midjourney, Imagen, Firefly). The four
service illustrations (H2) are claymorphism; the projects illustration (H4) is Deep Glass. Each
prompt follows its template in `../IMAGE-SYSTEM.md` §8.

How to use the output:

1. Generate at the listed aspect ratio, then upscale/crop to the exact pixel size.
2. These need a transparent background. Midjourney can't do alpha: generate on pure `#07080B`
   and remove the background (keep the soft glow as semi-transparent pixels), or use Firefly /
   Imagen with a transparent-background option.
3. Check: no readable text or letters anywhere, no logos, no people. Clay: blue covers the most
   area and there is one focal accent. Glass: `#0065DF` is the dominant light.
4. Export WebP with alpha ≤ 200 KB (the H4 file stays PNG), same path and name as the file it
   replaces. Re-run the screenshots before shipping.

| File | Prompt |
|---|---|
| H2 website — `vc-zx-dfzfvxfd-scaled-1.webp` 2560×1428 | [h2-website.md](h2-website.md) |
| H2 app mobile — `Mesa-de-trabajo-1-copia-3@4x.webp` 1482×1233 | [h2-mobile.md](h2-mobile.md) |
| H2 SEO — `sdcasdcsvdzfvad.webp` 1300×880 | [h2-seo.md](h2-seo.md) |
| H2 branding — `xcgbxfgb-fcgbg-scaled-1.webp` 2560×2184 | [h2-branding.md](h2-branding.md) |
| H3 About subject — `b803093e046f6c0f65cdc5e8b18780ed.webp` 2000×900 (composite onto the SVG stage) | [h3-about.md](h3-about.md) |
| H4 projects (clay) — `43e3185f955f1d3fca7ffa93786c89a0.png` 652×517 | [h4-projects.md](h4-projects.md) |
| H1 service backgrounds (optional) | [h1-backgrounds.md](h1-backgrounds.md) |
