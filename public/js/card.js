/* Draws the shareable result image on a <canvas>.
 *   story = 1080 × 1920 (Instagram story)
 *   post  = 1080 × 1350 (Instagram feed post)
 * Layout numbers below are in pixels of the final image. */
(function () {
  "use strict";

  var W = 1080;
  var FONT = '"Baloo 2", system-ui, sans-serif';
  var INK = "#1b0b46";

  var LAYOUTS = {
    story: {
      h: 1920,
      brandY: 230, logoH: 92, brandSize: 56,
      kickerY: 365, kickerSize: 62,
      card: { y: 440, h: 1000 },
      acti: { y: 500, h: 505 },
      cheerSize: 66,
      nameY: 1100, nameSize: 124,
      reasonY: 1180, reasonSize: 50, reasonLine: 62,
      dividerY: 1300,
      alsoY: 1380, alsoSize: 42,
      event1Y: 1540, event1Size: 56,
      event2Y: 1608, event2Size: 44,
      handleY: 1650, handleSize: 44
    },
    post: {
      h: 1350,
      brandY: 92, logoH: 72, brandSize: 46,
      kickerY: 182, kickerSize: 52,
      card: { y: 252, h: 830 },
      acti: { y: 296, h: 404 },
      cheerSize: 54,
      nameY: 790, nameSize: 110,
      reasonY: 862, reasonSize: 44, reasonLine: 54,
      dividerY: 965,
      alsoY: 1036, alsoSize: 38,
      event1Y: 1150, event1Size: 48,
      event2Y: 1204, event2Size: 38,
      handleY: 1236, handleSize: 38
    }
  };

  var cache = {};

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("Could not load " + src)); };
      img.src = src;
    });
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load("800 100px " + FONT),
      document.fonts.load("600 50px " + FONT)
    ]).catch(function () {});
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Shrinks the font until the text fits maxWidth.
  function fitFont(ctx, text, weight, size, maxWidth) {
    do {
      ctx.font = weight + " " + size + "px " + FONT;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    } while (size > 20);
    return size;
  }

  function wrap(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var line = "";
    words.forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function brandGradient(ctx, x0, x1) {
    var g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, "#4a01e0");
    g.addColorStop(0.4, "#b01ab8");
    g.addColorStop(0.75, "#f83840");
    g.addColorStop(1, "#fc8700");
    return g;
  }

  // A tilted white sticker with gradient text, centred on (x, y).
  function drawCheer(ctx, text, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-6 * Math.PI / 180);
    ctx.font = "800 " + size + "px " + FONT;
    var tw = ctx.measureText(text).width;
    var w = tw + size * 0.9;
    var h = size * 1.35;
    ctx.shadowColor = "rgba(27,11,70,0.3)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.3);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = brandGradient(ctx, -tw / 2, tw / 2);
    ctx.textAlign = "center";
    ctx.fillText(text, 0, size * 0.36);
    ctx.restore();
  }

  function draw(format, data, images) {
    var L = LAYOUTS[format];
    var H = L.h;
    var S = data.strings;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Background: purple → magenta → pink → orange
    var bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, "#4a01e0");
    bg.addColorStop(0.42, "#b01ab8");
    bg.addColorStop(0.72, "#f83840");
    bg.addColorStop(1, "#fc8700");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Soft decorative circles
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.arc(W + 60, -40, 420, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-120, H + 40, 380, 0, Math.PI * 2); ctx.fill();

    // Brand row: logo + "ActivateMe Fest"
    ctx.font = "800 " + L.brandSize + "px " + FONT;
    var brandText = S.eventName;
    var logoW = L.logoH * (images.logo.width / images.logo.height);
    var textW = ctx.measureText(brandText).width;
    var gap = 18;
    var startX = (W - (logoW + gap + textW)) / 2;
    ctx.drawImage(images.logo, startX, L.brandY - L.logoH / 2 - 6, logoW, L.logoH);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(brandText, startX + logoW + gap, L.brandY + L.brandSize * 0.32);
    ctx.textAlign = "center";

    // Kicker: "Our kid's perfect match"
    fitFont(ctx, data.kicker, "700", L.kickerSize, W - 120);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.kicker, W / 2, L.kickerY);

    // White card
    var cx = 70, cw = W - 140;
    ctx.save();
    ctx.shadowColor = "rgba(27,11,70,0.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, cx, L.card.y, cw, L.card.h, 64);
    ctx.fill();
    ctx.restore();

    // Soft lilac circle behind Acti
    ctx.fillStyle = "#f3eeff";
    ctx.beginPath();
    ctx.arc(W / 2, L.acti.y + L.acti.h * 0.55, L.acti.h * 0.46, 0, Math.PI * 2);
    ctx.fill();

    // Acti
    var a = images.acti;
    var ah = L.acti.h;
    var aw = ah * (a.width / a.height);
    if (aw > cw - 80) { aw = cw - 80; ah = aw * (a.height / a.width); }
    ctx.drawImage(a, (W - aw) / 2, L.acti.y + (L.acti.h - ah), aw, ah);

    // Cheer sticker across the top edge of the card: "GOAL!"
    if (data.top.cheer) drawCheer(ctx, data.top.cheer, W / 2, L.card.y, L.cheerSize);

    // Activity name with emoji, gradient text
    var name = data.top.emoji + " " + data.top.name;
    var size = fitFont(ctx, name, "800", L.nameSize, cw - 80);
    var nameW = ctx.measureText(name).width;
    ctx.fillStyle = brandGradient(ctx, W / 2 - nameW / 2, W / 2 + nameW / 2);
    ctx.font = "800 " + size + "px " + FONT;
    ctx.fillText(name, W / 2, L.nameY);

    // Reason (up to 2 lines)
    ctx.fillStyle = INK;
    ctx.font = "600 " + L.reasonSize + "px " + FONT;
    var lines = wrap(ctx, data.top.reason, cw - 120).slice(0, 2);
    lines.forEach(function (line, i) {
      ctx.fillText(line, W / 2, L.reasonY + i * L.reasonLine);
    });

    // Divider
    ctx.strokeStyle = "#e6dcfb";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 90, L.dividerY);
    ctx.lineTo(cx + cw - 90, L.dividerY);
    ctx.stroke();

    // Runner-ups
    var also = S.cardAlso + " " + data.runners.map(function (r) { return r.emoji + " " + r.name; }).join("  ·  ");
    fitFont(ctx, also, "700", L.alsoSize, cw - 100);
    ctx.fillStyle = "#5a4d7d";
    ctx.fillText(also, W / 2, L.alsoY);

    // Event line, split into two lines at the first " · "
    var parts = S.eventLine.split(" · ");
    var line1 = parts.shift();
    var line2 = parts.join(" · ");
    ctx.fillStyle = "#ffffff";
    fitFont(ctx, line1, "800", L.event1Size, W - 120);
    ctx.fillText(line1, W / 2, L.event1Y);
    fitFont(ctx, line2, "600", L.event2Size, W - 120);
    ctx.fillText(line2, W / 2, L.event2Y);

    // @activatemefest pill
    ctx.font = "800 " + L.handleSize + "px " + FONT;
    var hw = ctx.measureText(S.instagram).width + 64;
    var hh = L.handleSize + 30;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, (W - hw) / 2, L.handleY, hw, hh, hh / 2);
    ctx.fill();
    ctx.fillStyle = "#4a01e0";
    ctx.fillText(S.instagram, W / 2, L.handleY + hh / 2 + L.handleSize * 0.33);

    return canvas;
  }

  function toResult(canvas, format, data) {
    return new Promise(function (resolve, reject) {
      var dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      var finish = function (blob) {
        if (!blob) return reject(new Error("No image"));
        resolve({
          blob: blob,
          dataUrl: dataUrl,
          filename: "activateme-" + data.top.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + format + ".jpg"
        });
      };
      if (canvas.toBlob) canvas.toBlob(finish, "image/jpeg", 0.9);
      else {
        // Very old browsers: build the blob from the data URL.
        var bin = atob(dataUrl.split(",")[1]);
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        finish(new Blob([arr], { type: "image/jpeg" }));
      }
    });
  }

  function render(format, data) {
    var key = format + "|" + data.top.name + "|" + data.kicker;
    if (!cache[key]) {
      cache[key] = Promise.all([
        loadImage("/assets/acti-card/" + data.top.acti + ".webp"),
        loadImage("/assets/logo.webp"),
        fontsReady()
      ]).then(function (res) {
        return toResult(draw(format, data, { acti: res[0], logo: res[1] }), format, data);
      });
      cache[key].catch(function () { delete cache[key]; });
    }
    return cache[key];
  }

  window.ShareCard = {
    render: render,
    // Pre-builds both images in the background.
    prepare: function (data) {
      render("story", data).then(function () { return render("post", data); }).catch(function () {});
    },
    invalidate: function () { cache = {}; }
  };
})();
