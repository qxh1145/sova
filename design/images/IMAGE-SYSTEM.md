# Sova image system — Deep Glass + clay accents

Two layers, one family:

- **Stage (Deep Glass):** backgrounds, headers and decor. Frosted panes in a cool blue aurora on
  near-black. Calm, so white text always reads.
- **Subject (claymorphism):** the hero subjects — service illustrations (H2), the About hero (H3)
  and the projects illustration (H4) — plus the SEO advantages column (S4) and the icons (§6).
  Puffy, matte clay objects in vivid colours on a Sova-blue body. They are the one bright, playful
  thing on a dark page — the accent. (H2 decided 2026-10-28 after P1 review; H3/H4 moved to clay
  the same day so every hero matches.)

Sources live in this folder; `node design/images/build.mjs` regenerates every output from them.

## 1. Palette

| Token | Hex / value | Use |
|---|---|---|
| `base` | `#07080B` | Image ground. Text zones stay at this value (range `#07080B`–`#0E1014`). |
| `base-2` | `#0A0C12` | Right-hand lift of the ground, under the light. |
| `floor` | `#131518` | Bottom 20 % of heroes fade to this, so the seam into the `#181818` page is soft. |
| `navy` | `#0A1A33` / `#0A3A8C` | Shadow side of the aurora, pane interiors. |
| `primary` | `#0065DF` | The dominant light and every accent. Never less than ~70 % of the lit area. |
| `primary-light` | `#4F94FF` | Highlights, small dots, gradient ends. |
| `ice` | `#9CC3FF` | Top of glyph gradients only. |
| `violet` | `#5B4BFF` | Secondary aurora lobe. ≤ 10 % of the lit area, never on its own. |
| `glass-fill` | white 6–14 % | Pane surfaces (gradient top-left 10–14 % → bottom-right 1–3 %). |
| `glass-edge` | white 40–60 % → 4 % | 1.5 px pane rim, brightest at the top-right corner. |
| `ui-bar` | white 12–60 % | Abstract UI: bars, avatars, dividers. Never letters. |
| `text` | `#FEFEFE` | HTML text on images (never drawn into images). |
| `check` | `#28CD41` | Only for the check bullet (I2). |

### Clay palette (illustrations only)

Each clay colour is a `[light, base, shade]` triple (`lib/clay.mjs`). The body colour carries the
biggest shapes; accents mark what the eye should land on.

| Role | Name | Light / base / shade |
|---|---|---|
| Body (largest shapes: windows, phones, cards) | `sova` | `#4D95FF` / `#0065DF` / `#004BB0` |
| Secondary body | `blue` · `violet` | `#7DB4FF` `#2F80FF` `#155FD6` · `#B19BFF` `#7A5CFF` `#5236DB` |
| Accent — the focal point (CTA, cursor, top result) | `coral` · `yellow` | `#FF9F8A` `#FF5E4A` `#D93B2B` · `#FFE592` `#FFC328` `#E39A00` |
| Accent — supporting | `mint` · `pink` · `cyan` | `#86F3CF` `#22D39C` `#0B9C70` · `#FFA3CF` `#FF5AA0` `#D5337A` · `#93E9FF` `#25C4F0` `#0891BC` |
| Surfaces (screens, cards) / placeholder pills | `cream` · `mist` | `#FFFFFF` `#EDF2FC` `#C7D2E8` · `#D9E4FA` `#B5C6EA` `#8FA3CF` |

- Blue (`sova` + `blue`) covers the most area in every illustration; no single accent may.
- One focal accent per scene, placed on the object that says what the service does.
- Use 3–5 accents per scene; never put two accents of similar hue next to each other
  (coral/pink, cyan/mint).

## 2. Light

- **Key light:** upper right, behind the subject. The aurora is 2–3 soft ellipses (primary, violet,
  navy), blurred by 50–120 px at hero scale. Bloom never reaches a text zone or the nav band.
- **Rim:** pane edges catch the key light: a 1.5 px gradient stroke, white 60 % at the top-right
  corner falling to 4 % at the bottom-left.
- **Frosting:** inside a pane, the same aurora is drawn again, clipped to the pane and blurred
  ~50 px, over `#0C1019`. That is what makes a pane look like glass rather than a grey card.
- **Shadows:** cast down-left, `#000` 55–60 %, blur 26 px, offset (+16, +30) at hero scale.
- **Depth of field:** back pane 2.5 px blur, front pane sharp, a foreground chip 7 px blur, and
  1–2 bokeh dots. Three depth planes at most.

## 3. Shapes

- **Pane:** rounded rectangle, corner radius ≈ 7 % of the long side (28 px on a 400 px pane),
  tilted −7°. Device panes (app) use a radius of ≈ 12 % and a 9 : 19.5 ratio.
- **Abstract UI inside panes:** pill bars (radius = half the height), circles for avatars, 1 px
  dividers at 14 %, a single `#0065DF` pill as the "action". No readable text, no fake words,
  no logos.
- **Grouping:** 2–3 panes plus one small chip, overlapping, never in a grid.
- Never: rockets, light bulbs, handshakes, gears, people, mascots, glossy pastel 3D.

### 3b. Clay (service illustrations)

- **Volume:** every object gets a diagonal fill (light top-left → base → shade bottom-right), a soft
  white inner highlight on its top-left rim, a soft dark inner shadow on its bottom-right rim and a
  drop shadow cast down (`clayDefs` filters `xs`–`xl`, picked by object size).
- **Pressed areas** (screens, slots, address bars) use the `in` filter: shadow top-left, light
  bottom-right.
- **Shapes:** generous radii (≈ 12 % of the short side on windows and phones, pills everywhere),
  balls, rings, rounded stars and hearts. Corners are always rounded, also on stars and arrows.
- **Matte, saturated:** no specular glints, chrome, glass refraction or pastel washes. This is what
  separates it from the pastel 3D that was replaced.
- **Composition:** one main object (≈ 55 % of the width), tilted −5° to −9°, with 4–7 floating
  props around it at different sizes. A soft blue/violet glow sits behind the group so it reads on
  the dark hero. Keep ≥ 2 % clear margin to every edge.
- **Scale:** each scene is drawn in a 1300-unit-wide space and scaled to the file size, so
  filters look the same at every output size.

### Service motifs

| Service | Hero background (H1) | Illustration (H2, clay) |
|---|---|---|
| Website | Ghost browser frames: pane outlines with chrome dots, a soft grid of card ghosts | A blue clay browser window (traffic-light dots, violet hero block, three cards); **focal: a yellow cursor clicking a coral CTA**; props: mint toggle, cyan layout tile, yellow star, coral heart, balls |
| App mobile | Rounded device silhouettes, two standing, one leaning | A violet onboarding phone and a blue list phone; **focal: a cream notification chip with a coral check tile**; props: yellow chat bubble, pink heart, mint toggle, balls |
| SEO | A rising line through nodes, faint ascending bars | A cream chart card with rising clay bars; **focal: the tallest coral bar with a mint up-arrow badge**, a yellow magnifier; a violet ranking card with the top row in yellow |
| Branding | A swatch system: colour chips and primitive shapes (circle, square, arc) | A cream palette card (six clay swatches), a blue type-scale card; **focal: clay primitives** — pink ball, mint triangle, yellow rounded cube, coral ring — joined by a violet pen-tool curve |
| About (H3) | Aurora haze, walls; the subject is baked into the background | Clay studio desk: a cream browser window, a Sova phone with rising bars; **focal: the yellow star on the tallest bar** ("vươn tầm"); props: palette chip, search chip with mint up badge, coral heart, balls. A dim ink slab is the mobile echo |
| Projects (H4) | A gallery of ghost thumbnail panes | Clay case-study stack: violet / coral / mint project cards fanned out, a Sova phone, a 2×2 gallery tile; **focal: a yellow cursor opening the front case**; props: star, heart, balls |
| Simple + detail headers | Aurora haze and two faint pane rims only; the centre stays empty | — |

## 4. Texture

- Grain: white specks from fractal noise, 5–7 %, masked to the lit area only.
- Dither: `build.mjs` adds ±4 levels of luminance noise before WebP/JPEG encoding, so the
  near-black gradients don't band.
- No photographic texture, no noise in text zones beyond the dither.

## 5. Composition and crops

Every background is drawn with `cover`. Before placing anything, compute the visible window for
each listed viewport (`tools/inspect-hero.mjs` does it and checks the calm zones).

| Slot | Text sits | Calm zone (source) | Focal zone |
|---|---|---|---|
| Service heroes (H1) | left 0–50 % | x 0–64 % plus the mobile strip x 38–59 % | x ≥ 65 %, behind the H2 illustration |
| About (H3) | left half; centred on mobile | x 0–64 %, y 0–13 % (nav) | x 64–95 %, y 15–80 % |
| Projects (H4) | left; top 32 % is cropped on desktop | x 0–64 % | right of x 64 %, lower 2/3 |
| Simple hero (H5) | centred | x 25–75 % across the full height | outer edges only, very faint |
| Detail header (H6) | centred | x 20–80 %, y 20–80 % | corners only, very faint |
| Projects scroll (S1) | heading top-centre; card titles sweep the whole width | everything (≤ `#222`) | only a low horizon glow behind the cards |
| Package / purpose (S2) | heading top-left; translucent cards everywhere | everything | bottom edge aurora, faint pane rims |
| Contact banner (S3) | text left, form right; three crops (`object-position: 0% 100%`) | everything | far top-right corner, bottom edge |
| Footer (F1) | logo + 3 link columns; under a .65 → .95 dark gradient | everything, but the overlay allows ~#3A before it | top-right aurora, dot grid, pane rims |
| SEO advantages (S4) | none — an `<img>` column beside cards | — | a clay scene on an opaque dark glass panel (4 : 5, with srcset sizes) |

- **Text-safe:** under any HTML text the image stays ≤ `#222` (we aim for `#07080B`–`#0E1014`).
  White text must reach ≥ 4.5 : 1 on the worst pixel and should reach ≥ 7 : 1.
- **Mobile echo:** on narrow crops the area below the CTA may carry a faint, low-detail echo of
  the motif — a single pane rim or a soft glow, ≤ `#1A1D24`, still ≥ 7 : 1 against white.
- **Nav band:** the top 13 % stays calm on every hero (the header sits over it).
- **Floor:** heroes fade to `floor` over their bottom 20 %.

## 6. Icons (clay)

Benefit, goal and plan icons share the clay family of the service illustrations (approved after
P2). Sources: `src/p3-icons.mjs` and `src/p3-ui-decor.mjs`, built with `lib/icon.mjs`. Each icon is
drawn in a design space and scaled to the intrinsic size of the file it replaces. Values below are
in tile units (70 u).

| Part | Spec |
|---|---|
| Tile (benefit icons) | 70 × 70 u, full bleed, radius 20, Sova gradient `#4D95FF` → `#0065DF` → `#004BB0` (top-left → bottom-right) |
| Tile volume | inner highlight top-left (white 45 %), inner shadow bottom-right (`#0B0830` 40 %), no drop shadow |
| Objects | cream (`#FFFFFF` → `#EDF2FC` → `#C7D2E8`) main object, same clay filter plus a soft drop shadow (`#002058` on the tile, `#000` on the page) |
| Accents | at most 2 vivid clay colours per icon (coral, yellow, mint, violet, pink, cyan); one marks the part that carries the meaning |
| Props | 1–3 small balls or sparkles in the free corners; never touching the edge |
| Abstract UI | pills in mist `#B5C6EA`, small coloured blocks; no text |
| Budget | 6 KB; a dense icon drops its smallest filter size first (`clayIcon` does it) |

- **Benefit icons (service pages):** tile + cream object + accents. One idea per icon, read from
  the card's title.
- **About goals and plan icons:** free-standing clay objects on the dark page, no tile. Plan icons
  stack 1 / 2 / 3 slabs (the top tier carries the star) and fill ~90 % of the canvas, because the
  card shows them in a 60 × 40 box.
- **Contact-info icons and the call button:** a Sova clay disc with a white glyph (pin, handset,
  envelope).
- **UI icons** (menu, contact book, arrows, chevrons): flat line style, round caps and joins,
  stroke ≈ 7.5 % of the canvas (38 on 512), `currentColor` with `color="#FEFEFE"` on the root,
  because an `<img>` or CSS background does not inherit the page colour. Icons that CSS recolours
  (`filter: brightness(0) invert(1)`) keep a dark stroke.
- **Decor** behind text (lattices, separators) stays flat: no filters, white at low opacity with
  a few `#0065DF` dots.
- **Third-party marks** (Messenger, Zalo) keep their official shapes and colours (`lib/marks.mjs`);
  only the white fill behind the Messenger bolt is added, so it stays white on any background.
- Pure SVG: no `<image>`, no base64, no editor metadata, `viewBox` = intrinsic size, ≤ 6 KB.
  Raster exceptions keep their format: `Mask-group.png` (75 × 75, shown at 25) and the 16 × 9
  chevron that CSS shows at its intrinsic size.

## 7. Formats

| Kind | Format | Budget |
|---|---|---|
| Backgrounds | WebP q≈78 (H5 stays JPEG, q≈80) | ≤ 250 KB (≤ 350 KB at 2560 px) |
| Illustrations | WebP with alpha | ≤ 200 KB |
| Icons | SVG | ≤ 6 KB |

Same path, same name, same aspect ratio, at least the listed size. A format change updates
`src/data/assets.ts` and every hardcoded reference in the same change.

## 8. Text-to-image prompts

SVG can only approximate soft 3D. The illustrations ship as SVG-built files and each comes with a
prompt in `prompts/`. Service illustrations (H2) use the clay template:

> 3D claymorphism illustration, soft puffy matte clay objects with rounded edges, `<subject>`,
> main body in cobalt blue #0065DF, vivid accents coral #FF5E4A, sunny yellow #FFC328, mint #22D39C,
> pink #FF5AA0, cyan #25C4F0, violet #7A5CFF, cream white screens, abstract UI made of rounded pills
> with no readable text, soft studio light from the upper left, gentle inner shadows, soft contact
> shadows, isolated on a transparent background, playful but premium, `<aspect>`
> --no text, letters, numbers, logos, people, rockets, light bulbs, gears, glossy plastic,
> chrome, glass, pastel washed-out colours, watermark.

The About (H3) and projects (H4) subjects use the same clay template. Backgrounds and headers
(stage) are built in SVG only; when a stage needs a reference image, use the glass template:

> Dark-theme background, frosted glass panes floating in a soft blue aurora,
> `<subject>`, abstract UI made of pill bars and circles with no readable text, key light from the
> upper right, rim light on pane edges, shallow depth of field, near-black,
> palette #07080B #0A1A33 #0065DF #4F94FF with a touch of #5B4BFF, premium and calm,
> `<aspect>` --no text, letters, logos, people, rockets, light bulbs, gears, pastel, glossy plastic,
> watermark.

## 9. Do / Don't

**Do**
- Keep `#0065DF` the dominant light everywhere, and the dominant clay colour in illustrations.
- Give every clay scene exactly one focal accent on the object that names the service.
- Put the light behind the subject, upper right; keep text zones flat near-black.
- Check every crop (desktop and mobile) before shipping; run the contrast script.
- Build abstract UI from bars, circles and one blue pill.
- Use three depth planes at most: back (soft), front (sharp), one foreground chip (soft).
- Keep icons to at most two accents, one on the part that carries the meaning.

**Don't**
- No readable or fake text, logos, watermarks, or the word "Eras" in any image.
- No people, stock photos, rockets, bulbs, handshakes, gears, or pastel glossy 3D.
- No light, bokeh or grain inside text zones or the nav band.
- No violet on its own or as the main light.
- No raster inside SVG icons; no icon with more than two accents.
- No circular vignettes around text (they band into rings); use linear walls instead.
- No clay in text zones, simple/detail headers or section backgrounds: clay is for hero subjects
  (H2–H4), the S4 column and the icons (§6); everything behind text stays glass and calm.
- No glossy highlights, sharp corners or washed-out pastels on clay.
