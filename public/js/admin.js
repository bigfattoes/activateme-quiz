/* Admin page: log in with the ADMIN_PASSWORD, see counts, download CSVs. */
(function () {
  "use strict";
  var KEY = "activateme-admin";
  var password = "";
  try { password = sessionStorage.getItem(KEY) || ""; } catch (e) { /* private mode */ }

  var $ = function (id) { return document.getElementById(id); };

  function api(path) {
    return fetch(path, { headers: { authorization: "Bearer " + password }, cache: "no-store" }).then(function (r) {
      if (r.status === 401) throw new Error("Wrong password");
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (b) {
          throw new Error(b.error || "Error " + r.status);
        });
      }
      return r;
    });
  }

  function label(id) {
    var a = window.QUIZ && window.QUIZ.activities[id];
    return a ? a.emoji + " " + a.name : id || "(none)";
  }

  function fillTable(tbody, rows) {
    tbody.innerHTML = "";
    var max = rows.reduce(function (m, r) { return Math.max(m, r.count); }, 0) || 1;
    // Show every activity, even ones with 0.
    var counts = {};
    rows.forEach(function (r) { counts[r.result] = r.count; });
    var ids = Object.keys((window.QUIZ && window.QUIZ.activities) || {});
    rows.forEach(function (r) { if (ids.indexOf(r.result) < 0) ids.push(r.result); });
    ids.sort(function (a, b) { return (counts[b] || 0) - (counts[a] || 0); });
    ids.forEach(function (id) {
      var n = counts[id] || 0;
      var tr = document.createElement("tr");
      var td1 = document.createElement("td"); td1.textContent = label(id);
      var td2 = document.createElement("td"); td2.className = "bar-cell";
      var bar = document.createElement("div"); bar.className = "bar"; bar.style.width = (n / max) * 100 + "%";
      td2.appendChild(bar);
      var td3 = document.createElement("td"); td3.className = "num"; td3.textContent = n;
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tbody.appendChild(tr);
    });
  }

  function load() {
    $("login-err").textContent = "";
    return api("/api/admin/stats").then(function (r) { return r.json(); }).then(function (d) {
      try { sessionStorage.setItem(KEY, password); } catch (e) { /* ignore */ }
      $("login").hidden = true;
      $("dash").hidden = false;
      $("t-quizzes").textContent = d.totals.quizzes;
      $("t-signups").textContent = d.totals.signups;
      $("t-clubs").textContent = d.totals.opt_in_clubs;
      $("t-news").textContent = d.totals.opt_in_news;
      fillTable($("results"), d.results);
      fillTable($("signups"), d.signups);
    }).catch(function (e) {
      try { sessionStorage.removeItem(KEY); } catch (x) { /* ignore */ }
      $("login").hidden = false;
      $("dash").hidden = true;
      $("login-err").textContent = e.message;
    });
  }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    password = $("password").value;
    load();
  });
  $("refresh").addEventListener("click", load);

  Array.prototype.forEach.call(document.querySelectorAll("[data-export]"), function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-export");
      $("dl-err").textContent = "";
      api("/api/admin/export?type=" + type).then(function (r) {
        var name = (r.headers.get("content-disposition") || "").match(/filename="([^"]+)"/);
        return r.blob().then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = name ? name[1] : type + ".csv";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
        });
      }).catch(function (e) { $("dl-err").textContent = e.message; });
    });
  });

  if (password) load();
})();
