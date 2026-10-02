#!/usr/bin/env node
// Makes public/assets/og.jpg (the preview image when the link is shared in
// WhatsApp, iMessage etc). Needs the local server: npm run dev
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:8788";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const tmp = path.join(__dirname, "..", "public", "og-template-tmp.html");
  fs.writeFileSync(tmp, `<!doctype html><html><head><base href="/"><link rel="stylesheet" href="css/style.css">
  <style>body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--gradient);display:flex;align-items:center;padding:0 70px;gap:30px;color:#fff}
  .t{flex:1}.t h1{font-size:84px;line-height:1;font-weight:800;margin:14px 0}.t p{font-size:34px;font-weight:600}
  .b{display:flex;align-items:center;gap:12px;font-size:36px;font-weight:800}.b img{width:64px}
  .pill{display:inline-block;margin-top:22px;background:#fff;color:var(--purple);border-radius:99px;padding:6px 28px;font-size:32px;font-weight:800}
  .a{height:600px;align-self:flex-end;filter:drop-shadow(0 12px 18px rgba(27,11,70,.35))}</style></head>
  <body><div class="t"><div class="b"><img src="assets/logo.webp">ActivateMe Fest</div><h1>What should my kid try?</h1>
  <p>Take Acti's 1-minute quiz!</p><span class="pill">16–17 Jan 2027 · DSO</span></div><img class="a" src="assets/acti-card/wave.webp"></body></html>`);
  await page.goto(BASE + "/og-template-tmp.html", { waitUntil: "networkidle" });
  fs.unlinkSync(tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, "..", "public", "assets", "og.jpg"), type: "jpeg", quality: 85 });
  await browser.close();
})();
