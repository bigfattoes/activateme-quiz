/* ActivateMe Fest quiz: screens and flow. Wording lives in /data/strings.js,
 * questions and scoring in /data/quiz.js, clubs in /data/clubs.js. */
(function () {
  "use strict";

  var S = window.STRINGS;
  var QUIZ = window.QUIZ;
  var CLUBS = window.CLUBS || {};
  var app = document.getElementById("app");

  var state = {
    step: -1,         // -1 = start, 0..5 = questions, 6 = result
    answers: {},      // { questionId: answerId }
    ranked: null,
    kidName: "",
    signedUp: false
  };

  // Where the visitor came from, e.g. ?src=ig-story or ?utm_source=instagram
  var source = "";
  try {
    var params = new URLSearchParams(location.search);
    source = (params.get("src") || params.get("utm_source") || "").slice(0, 40);
  } catch (e) { /* old browser: no source */ }

  /* ---------- Helpers ---------- */

  // Fill {placeholders} in a string.
  function t(text, vars) {
    return String(text).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] !== undefined ? vars[k] : m;
    });
  }
  function kid() { return state.kidName || S.yourKid; }
  function kids() {
    if (!state.kidName) return S.yourKids;
    return state.kidName + (/s$/i.test(state.kidName) ? "'" : "'s");
  }

  // Tiny element builder: el("p", { class: "x" }, ["text", otherEl])
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "text") node.textContent = v;
        else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function actiImg(pose, cls, alt) {
    return el("img", {
      class: "acti " + (cls || ""),
      src: "/assets/acti/" + pose + ".webp",
      alt: alt || "",
      decoding: "async"
    });
  }
  function preload(src) { var i = new Image(); i.src = src; }

  function show(screen) {
    app.innerHTML = "";
    app.appendChild(screen);
    window.scrollTo(0, 0);
  }

  function post(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  /* ---------- Browser back button support ---------- */
  // Each question gets a history entry so the phone's back button goes
  // back one question instead of leaving the quiz.
  function pushStep(step) {
    try { history.pushState({ step: step }, ""); } catch (e) { /* ignore */ }
  }
  window.addEventListener("popstate", function (e) {
    var step = e.state && typeof e.state.step === "number" ? e.state.step : -1;
    if (step >= QUIZ.questions.length) step = QUIZ.questions.length - 1;
    goTo(step, true);
  });

  function goTo(step, fromHistory) {
    state.step = step;
    if (step < 0) renderStart();
    else if (step < QUIZ.questions.length) renderQuestion(step);
    if (!fromHistory) pushStep(step);
  }

  /* ---------- Start ---------- */
  function renderStart() {
    var screen = el("section", { class: "screen screen-start" }, [
      el("div", { class: "brand" }, [
        el("img", { src: "/assets/logo-small.webp", alt: "", width: "40", height: "36" }),
        el("span", { text: S.eventName })
      ]),
      actiImg("front", "acti-hero bob", "Acti, the ActivateMe mascot"),
      el("p", { class: "kicker", text: S.startKicker }),
      el("h1", { text: S.startTitle }),
      el("p", { class: "lead", text: S.startText }),
      el("button", { class: "btn btn-big", type: "button", text: S.startButton, onclick: startQuiz }),
      el("p", { class: "note", text: S.startNote })
    ]);
    show(screen);
  }

  function startQuiz() {
    state.answers = {};
    state.ranked = null;
    goTo(0);
  }

  /* ---------- Questions ---------- */
  function renderQuestion(i) {
    var q = QUIZ.questions[i];
    var total = QUIZ.questions.length;
    var locked = false;

    // Warm up the next Acti pose so it appears instantly.
    var next = QUIZ.questions[i + 1];
    if (next) preload("/assets/acti/" + next.acti + ".webp");

    var answers = el("div", { class: "answers" + (q.answers.length >= 4 ? " grid-2" : ""), role: "list" },
      q.answers.map(function (a) {
        var btn = el("button", {
          class: "answer" + (state.answers[q.id] === a.id ? " picked" : ""),
          type: "button",
          role: "listitem",
          onclick: function () {
            if (locked) return;
            locked = true;
            state.answers[q.id] = a.id;
            btn.classList.add("picked");
            setTimeout(function () {
              if (i + 1 < total) goTo(i + 1);
              else finish();
            }, 260);
          }
        }, [el("span", { class: "emoji", "aria-hidden": "true", text: a.emoji }), el("span", { text: a.label })]);
        return btn;
      })
    );

    var back = el("button", {
      class: "q-back", type: "button", "aria-label": S.back, text: "←",
      onclick: function () { history.back(); }
    });
    if (i === 0) back.hidden = true;

    var screen = el("section", { class: "screen screen-question" }, [
      el("div", { class: "q-top" }, [
        back,
        el("div", { class: "q-progress", "aria-hidden": "true" }, [
          el("span", { style: "width:" + Math.round(((i + 1) / total) * 100) + "%" })
        ]),
        el("span", { class: "q-count", text: t(S.questionCount, { n: i + 1, total: total }) })
      ]),
      el("div", { class: "q-head" }, [
        actiImg(q.acti || "front"),
        el("h2", { text: q.title })
      ]),
      answers
    ]);
    show(screen);
  }

  /* ---------- Thinking, then result ---------- */
  function finish() {
    var r = window.scoreQuiz(state.answers, QUIZ);
    state.ranked = r.ranked.slice(0, 3);
    state.step = QUIZ.questions.length;
    var top = QUIZ.activities[state.ranked[0]];
    preload("/assets/acti/" + top.acti + ".webp");

    show(el("section", { class: "screen screen-thinking" }, [
      actiImg("hmm"),
      el("p", { text: S.thinking }),
      el("div", { class: "dots", "aria-hidden": "true" }, [el("span"), el("span"), el("span")])
    ]));

    // Count this result (anonymous). Never blocks the quiz if it fails.
    post("/api/result", {
      result: state.ranked[0],
      runnerUps: state.ranked.slice(1),
      answers: state.answers,
      source: source
    }).catch(function () {});

    setTimeout(renderResult, 1300);
  }

  function renderResult() {
    var ids = state.ranked;
    var top = QUIZ.activities[ids[0]];
    var vars = function () { return { activity: top.name, kid: kid(), kids: kids() }; };

    var runners = el("div", { class: "runners" }, [el("p", { class: "runners-title", text: S.runnerUpsTitle })]
      .concat(ids.slice(1).map(function (id) {
        var a = QUIZ.activities[id];
        return el("div", { class: "runner" }, [
          el("div", { class: "emoji", "aria-hidden": "true", text: a.emoji }),
          el("b", { text: a.name }),
          el("span", { text: a.short })
        ]);
      })));

    var hero = el("div", { class: "result-hero" }, [
      el("p", { class: "kicker", text: S.resultKicker }),
      actiImg(top.acti, "", "Acti celebrating"),
      el("div", { class: "card match" }, [
        el("div", { class: "emoji", "aria-hidden": "true", text: top.emoji }),
        el("h1", { text: top.name }),
        el("p", { class: "reason", text: top.reason }),
        runners
      ])
    ]);

    // Share
    var share = el("div", { class: "card share" }, [
      el("h2", { text: S.shareTitle }),
      el("div", { class: "share-row" }, [
        el("button", { class: "btn btn-grad", type: "button", onclick: function () { openShare("story"); } }, ["📱 ", S.shareStory]),
        el("button", { class: "btn btn-grad", type: "button", onclick: function () { openShare("post"); } }, ["🖼️ ", S.sharePost])
      ])
    ]);

    // Guide + clubs
    var clubs = (CLUBS[ids[0]] || []).filter(function (c) {
      return c && c.name && c.name.trim().charAt(0) !== "[";
    });
    var guide = el("div", { class: "card guide" }, [
      el("h2", { text: t(S.guideTitle, vars()) }),
      el("dl", null, [
        el("dt", { text: S.guideBuilds }), el("dd", { text: top.builds }),
        el("dt", { text: S.guideTryAtHome }), el("dd", { text: top.tryAtHome })
      ]),
      clubs.length ? el("h2", { text: S.clubsTitle, style: "margin-top:18px" }) : null,
      clubs.length ? el("ul", { class: "clubs" }, clubs.map(clubItem)) : null
    ]);

    var screen = el("section", { class: "screen screen-result" }, [
      hero,
      share,
      signupCard(),
      guide,
      el("div", { class: "card ar" }, [
        el("img", { src: "/assets/acti/face.webp", alt: "", loading: "lazy" }),
        el("h2", { text: S.arTitle }),
        el("p", { text: S.arText }),
        el("a", { class: "btn btn-grad", href: S.arUrl, target: "_blank", rel: "noopener", text: S.arButton })
      ]),
      el("div", { class: "card fest" }, [
        el("h2", { text: S.festTitle }),
        el("p", { text: t(S.festText, vars()) }),
        el("p", { class: "when", text: S.eventDates + " · " + S.eventPlace }),
        el("p", null, [
          el("a", { href: S.websiteUrl, target: "_blank", rel: "noopener", text: S.website }),
          " · ",
          el("a", { href: S.instagramUrl, target: "_blank", rel: "noopener", text: S.instagram })
        ])
      ]),
      el("div", { class: "footer-actions" }, [
        el("button", { class: "btn btn-ghost", type: "button", text: S.retake, onclick: startQuiz })
      ])
    ]);
    show(screen);
    confetti();
    // Build the share images quietly in the background so they're instant.
    setTimeout(function () { window.ShareCard.prepare(cardData()); }, 1200);
  }

  function clubItem(c) {
    var links = [];
    if (c.website) links.push(el("a", { href: c.website, target: "_blank", rel: "noopener", text: "Website" }));
    if (c.instagram) links.push(el("a", {
      href: "https://instagram.com/" + String(c.instagram).replace(/^@/, ""),
      target: "_blank", rel: "noopener", text: "@" + String(c.instagram).replace(/^@/, "")
    }));
    return el("li", null, [
      el("b", { text: c.name }),
      el("small", { text: [c.area, c.ages ? S.clubAges + " " + c.ages : ""].filter(Boolean).join(" · ") }),
      links.length ? el("small", null, links) : null
    ]);
  }

  /* ---------- Email sign-up ---------- */
  function signupCard() {
    var card = el("div", { class: "card signup" });
    if (state.signedUp) {
      card.appendChild(thanks());
      return card;
    }
    var title = el("h2", { text: t(S.emailTitle, { kids: kids() }) });
    var email = el("input", { type: "email", name: "email", autocomplete: "email", inputmode: "email", required: true, maxlength: "120" });
    var kidName = el("input", { type: "text", name: "kid", autocomplete: "off", maxlength: "40", value: state.kidName });
    var optClubs = el("input", { type: "checkbox", name: "optClubs" });
    var optNews = el("input", { type: "checkbox", name: "optNews" });
    var honey = el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" });
    var msg = el("p", { class: "form-msg", role: "status" });
    var btn = el("button", { class: "btn btn-grad", type: "submit", text: S.emailButton });

    email.addEventListener("input", function () { msg.textContent = ""; msg.className = "form-msg"; });
    kidName.addEventListener("input", function () {
      state.kidName = kidName.value.trim().slice(0, 40);
      title.textContent = t(S.emailTitle, { kids: kids() });
      window.ShareCard.invalidate();
    });

    var form = el("form", { novalidate: true }, [
      title,
      el("label", { class: "field" }, [el("span", { text: S.emailEmail }), email]),
      el("label", { class: "field" }, [el("span", { text: S.emailKid }), kidName]),
      el("label", { class: "hp", "aria-hidden": "true" }, ["Website", honey]),
      el("label", { class: "check" }, [optClubs, el("span", { text: S.emailOptClubs })]),
      el("label", { class: "check" }, [optNews, el("span", { text: S.emailOptNews })]),
      btn,
      msg,
      el("p", { class: "privacy", text: S.emailPrivacy })
    ]);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = email.value.trim();
      msg.className = "form-msg";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        msg.className = "form-msg err";
        msg.textContent = S.emailBadEmail;
        email.focus();
        return;
      }
      btn.disabled = true;
      btn.textContent = S.emailSending;
      msg.textContent = "";
      post("/api/signup", {
        email: value,
        kidName: state.kidName,
        optInClubs: optClubs.checked,
        optInNews: optNews.checked,
        result: state.ranked[0],
        runnerUps: state.ranked.slice(1),
        answers: state.answers,
        source: source,
        website: honey.value
      }).then(function () {
        state.signedUp = true;
        card.innerHTML = "";
        card.appendChild(thanks());
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = S.emailButton;
        msg.className = "form-msg err";
        msg.textContent = S.emailError;
      });
    });
    card.appendChild(form);
    return card;
  }

  function thanks() {
    return el("div", null, [
      el("img", { src: "/assets/acti/wave.webp", alt: "", class: "acti", style: "width:90px;margin:0 auto 6px" }),
      el("p", { class: "thanks", text: t(S.emailThanks, { kids: kids() }) })
    ]);
  }

  /* ---------- Share ---------- */
  function cardData() {
    var top = QUIZ.activities[state.ranked[0]];
    return {
      top: top,
      runners: state.ranked.slice(1).map(function (id) { return QUIZ.activities[id]; }),
      kicker: state.kidName ? t(S.cardKicker, { kids: kids() }) : S.cardKickerDefault,
      strings: S
    };
  }

  function openShare(format) {
    var spinner = el("div", { class: "spinner", role: "status", "aria-label": S.shareMaking });
    var overlay = el("div", { class: "overlay", role: "dialog", "aria-modal": "true" }, [
      spinner, el("p", { class: "hint", text: S.shareMaking })
    ]);
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);

    window.ShareCard.render(format, cardData()).then(function (img) {
      overlay.innerHTML = "";
      var top = QUIZ.activities[state.ranked[0]];
      var file = null;
      try {
        file = new File([img.blob], img.filename, { type: "image/jpeg" });
      } catch (e) { file = null; }
      var canShareFile = !!(file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] }));
      var inApp = /Instagram|FBAN|FBAV|FB_IAB|Line\/|; wv\)|WebView/i.test(navigator.userAgent);

      var buttons = [];
      if (canShareFile) {
        buttons.push(el("button", {
          class: "btn btn-grad", type: "button", text: S.shareButton,
          onclick: function () {
            navigator.share({ files: [file], title: top.name }).catch(function () { /* cancelled */ });
          }
        }));
      }
      if (!inApp || !canShareFile) {
        buttons.push(el("button", {
          class: "btn", type: "button", text: S.saveButton,
          onclick: function () { download(img.blob, img.filename); }
        }));
      }
      overlay.appendChild(el("img", { src: img.dataUrl, alt: top.name + " share image" }));
      if (!canShareFile || inApp) overlay.appendChild(el("p", { class: "hint", text: S.saveHint }));
      overlay.appendChild(el("div", { class: "row" }, buttons.concat([
        el("button", { class: "btn btn-ghost", type: "button", text: S.close, onclick: close })
      ])));
    }).catch(function () {
      overlay.innerHTML = "";
      overlay.appendChild(el("p", { class: "hint", text: S.emailError }));
      overlay.appendChild(el("button", { class: "btn", type: "button", text: S.close, onclick: close }));
    });
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }

  /* ---------- Confetti ---------- */
  function confetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var colors = ["#4a01e0", "#b01ab8", "#f83840", "#fc8700", "#ffffff", "#ffd23f"];
    var box = el("div", { class: "confetti", "aria-hidden": "true" });
    for (var i = 0; i < 45; i++) {
      box.appendChild(el("i", {
        style: "left:" + Math.random() * 100 + "%;background:" + colors[i % colors.length] +
          ";animation-duration:" + (1.8 + Math.random() * 1.6) + "s;animation-delay:" + Math.random() * 0.6 + "s"
      }));
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4500);
  }

  /* ---------- Go ---------- */
  try { history.replaceState({ step: -1 }, ""); } catch (e) { /* ignore */ }
  var startBtn = document.getElementById("start-btn");
  if (startBtn) startBtn.addEventListener("click", startQuiz);
  preload("/assets/acti/" + QUIZ.questions[0].acti + ".webp");
  // Expose for testing.
  window.__quiz = { state: state };
})();
