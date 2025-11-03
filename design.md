Here’s a concise summary of your **app goals**, paired with the **tech design task list** from before for a complete overview.

---

## 🎯 **App Goals**

1. **Create shareable photo collages**

   * Combine up to **5 photos** into neat, predesigned layouts.
   * Export as a high-quality **JPEG** ready for Instagram (feed, story, reel formats).

2. **Stay lightweight & personal**

   * **No login, no backend**, all processing happens **locally in browser**.
   * Fast load, clean UI, and simple enough for single-user use.

3. **Offer flexible layout control**

   * Choose from a few **preset layouts** (2-up, 3-up, 2×2 grid, mosaic).
   * Adjust **aspect ratio, gutter, corner radius, and background color**.

4. **Enable quick sharing**

   * Download final collage or use **Web Share API** on mobile.
   * Remember last-used options for convenience.

5. **Run anywhere for free**

   * Hosted on **Vercel / Netlify / Cloudflare Pages**.
   * No cloud compute or storage costs.

---

## 🧱 **Tech Design Tasks (Summary)**

1. **Setup**

   * Vite + React + TypeScript + Tailwind
   * Add `pica` (resizing), optionally `comlink` (worker rendering)

2. **Upload Flow**

   * File picker (max 5), decode to ImageBitmap, downscale via `pica`

3. **Layout System**

   * Define normalized layouts (`x, y, w, h`)
   * Add aspect ratios: 1:1, 4:5, 9:16

4. **Controls**

   * Layout picker, aspect, gutter, corner radius, background color
   * Persist in `localStorage`

5. **Rendering**

   * Draw images to canvas according to layout and settings
   * Export to JPEG Blob

6. **Output**

   * Preview in UI
   * Download / share result

7. **Hosting**

   * Static build + deploy to Vercel

8. **Polish (optional)**

   * Web Worker for heavy renders
   * Auto layout selection
   * PWA install support

---

Would you like me to turn this into a short **README-style document** (for your repo), summarizing the goals, stack, and build steps?
