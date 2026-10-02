#!/usr/bin/env node
/*
 * Clicks through the whole quiz in a headless phone-sized browser and saves
 * screenshots to screenshots/. Needs the local server running (npm run dev)
 * and Playwright installed.
 *
 *   BASE=http://localhost:8788 node scripts/e2e.js
 */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:8788";
const OUT = path.join(__dirname, "..", "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const INSTAGRAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 340.0.0.22.109 (iPhone14,5; iOS 17_5; en_US; en; scale=3.00; 1170x2532; 618401011)";

let failures = 0;
function check(ok, what) {
  console.log((ok ? "  ✅ " : "  ❌ ") + what);
  if (!ok) failures++;
}

async function run(name, contextOpts, answers, opts = {}) {
  console.log(`\n${name}`);
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const shot = (n) => opts.shots && page.screenshot({ path: path.join(OUT, `${opts.prefix}${n}.png`) });

  const t0 = Date.now();
  await page.goto(BASE + "/?src=e2e", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await shot("01-start");
  await page.click("text=Let's go!");

  for (let i = 0; i < answers.length; i++) {
    await page.waitForSelector(`text=Question ${i + 1} of 6`);
    await page.waitForTimeout(700); // let the pop-in animation finish
    // Every answer must be visible without scrolling.
    const fits = await page.evaluate(() => {
      const all = [...document.querySelectorAll(".answer")];
      return all.every((b) => b.getBoundingClientRect().bottom <= window.innerHeight + 1);
    });
    check(fits, `Question ${i + 1}: all answers fit on screen without scrolling`);
    if (opts.shots && [0, 1, 3, 5].includes(i)) await shot(`0${i + 2}-question-${i + 1}`);
    if (i === 2 && opts.testBack) {
      await page.click(".q-back");
      await page.waitForSelector("text=Question 2 of 6");
      check(true, "Back button goes to the previous question");
      await page.click(`.answer >> nth=0`);
      await page.waitForSelector("text=Question 3 of 6");
      await page.waitForTimeout(450);
    }
    await page.click(`.answer:has-text("${answers[i]}")`);
  }
  await page.waitForSelector("text=Acti is thinking");
  if (opts.shots) await shot("08-thinking");
  await page.waitForSelector(".match h1");
  const match = await page.textContent(".match h1");
  const elapsed = (Date.now() - t0) / 1000;
  check(true, `Top match: ${match} (whole run took ${elapsed.toFixed(1)}s including test waits)`);
  if (opts.expect) check(match === opts.expect, `Expected ${opts.expect}`);
  await page.waitForTimeout(opts.shots ? 4800 : 800); // let the confetti finish
  await shot("09-result");

  if (opts.shots) {
    await page.locator(".share").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -60));
    await shot("10-result-share-email");
    await page.locator(".guide").scrollIntoViewIfNeeded();
    await shot("11-result-guide-ar");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await shot("12-result-bottom");
  }

  // Share images
  for (const format of ["story", "post"]) {
    await page.click(`.share-row button:has-text("${format === "story" ? "Story" : "Post"}")`);
    await page.waitForSelector(".overlay img", { timeout: 15000 });
    await page.waitForTimeout(300);
    const info = await page.evaluate(async () => {
      const img = document.querySelector(".overlay img");
      await img.decode();
      return { w: img.naturalWidth, h: img.naturalHeight, src: img.src, buttons: [...document.querySelectorAll(".overlay .btn")].map((b) => b.textContent), hint: !!document.querySelector(".overlay .hint") };
    });
    const want = format === "story" ? [1080, 1920] : [1080, 1350];
    check(info.w === want[0] && info.h === want[1], `${format} image is ${info.w}×${info.h}`);
    check(info.buttons.length >= 2, `${format} overlay buttons: ${info.buttons.join(", ")}${info.hint ? " + press-and-hold hint" : ""}`);
    if (opts.shots) {
      fs.writeFileSync(path.join(OUT, `card-${format}.jpg`), Buffer.from(info.src.split(",")[1], "base64"));
      await shot(`13-share-overlay-${format}`);
    }
    await page.click('.overlay .btn:has-text("Close")');
  }

  // Email sign-up
  if (opts.signup) {
    await page.locator(".signup").scrollIntoViewIfNeeded();
    await page.click(".signup button[type=submit]");
    check(await page.isVisible("text=doesn't look right"), "Empty email shows a friendly error");
    await page.fill("input[name=email]", opts.signup.email);
    await page.fill("input[name=kid]", opts.signup.kid);
    check((await page.textContent(".signup h2")).includes(opts.signup.kid + "'s"), "Heading updates with kid's name");
    await page.check("input[name=optClubs]");
    if (opts.shots) {
      await page.evaluate(() => { document.querySelector(".signup").scrollIntoView(); window.scrollBy(0, -10); });
      await shot("14-email-filled");
    }
    await page.click(".signup button[type=submit]");
    await page.waitForSelector(".thanks");
    check(true, "Sign-up saved, thank-you shown");
    if (opts.shots) await shot("15-email-thanks");
    // Share card now uses the kid's name
    await page.click('.share-row button:has-text("Story")');
    await page.waitForSelector(".overlay img");
    if (opts.shots) {
      const src = await page.getAttribute(".overlay img", "src");
      fs.writeFileSync(path.join(OUT, "card-story-with-name.jpg"), Buffer.from(src.split(",")[1], "base64"));
    }
    await page.click('.overlay .btn:has-text("Close")');
  }

  const arHref = await page.getAttribute(".ar a", "href");
  check(arHref === "https://becomeacti.pages.dev", "AR filter link goes to becomeacti.pages.dev");

  check(errors.length === 0, "No JavaScript errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  await browser.close();
}

async function admin() {
  console.log("\nAdmin page");
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1100, height: 1100 }, acceptDownloads: true });
  await page.goto(BASE + "/admin");
  await page.fill("#password", "wrong");
  await page.click("text=Open");
  await page.waitForSelector("text=Wrong password");
  check(true, "Wrong password is refused");
  await page.screenshot({ path: path.join(OUT, "16-admin-login.png") });
  await page.fill("#password", process.env.ADMIN_PASSWORD || "letmein");
  await page.click("text=Open");
  await page.waitForSelector("#dash:not([hidden])");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "17-admin-dashboard.png"), fullPage: true });
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("text=Sign-ups (CSV)")]);
  const file = path.join(OUT, "signups-sample.csv");
  await download.saveAs(file);
  const csv = fs.readFileSync(file, "utf8");
  check(csv.includes("email") && csv.includes("@"), "Sign-ups CSV downloads with data");
  await browser.close();
}

(async () => {
  const iphone = devices["iPhone 13"];
  await run("iPhone, Instagram in-app browser, full run with screenshots", { ...iphone, userAgent: INSTAGRAM_UA },
    ["4–6", "Bouncing off the walls", "Loves being in a team", "Winning!", "Outdoors", "Speed"],
    { shots: true, prefix: "", expect: "Football", testBack: true, signup: { email: "test.parent@example.com", kid: "Sara" } });
  await run("Small Android phone (360×640), Android WebView", {
    viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 13; SM-A135F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
  }, ["10–14", "Calm and thoughtful", "Best with a buddy", "Figuring things out", "Indoors", "Brain power"],
    { shots: true, prefix: "small-", expect: "Chess" });
  await run("VR & Esports path", { ...iphone },
    ["10–14", "Calm and thoughtful", "Best with a buddy", "Winning!", "Indoors", "Imagination"], { expect: "VR & Esports" });
  await run("Swimming path", { ...iphone },
    ["4–6", "Busy, but can focus", "Happy doing their own thing", "Making things", "In the water", "Speed"], { expect: "Swimming" });
  await admin();
  console.log(failures ? `\n❌ ${failures} check(s) failed\n` : "\n✅ All checks passed\n");
  process.exit(failures ? 1 : 0);
})();
