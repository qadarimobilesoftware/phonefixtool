/* PhoneFixTool — client-side supported-models search.
   Static hosting only: fetches assets/models.json (relative path) and
   filters in the browser. No server needed. */
(function () {
  "use strict";
  var MAX_SHOWN = 100;
  var models = [];
  var searchInput = document.getElementById("model-search");
  var brandFilter = document.getElementById("brand-filter");
  var statusEl = document.getElementById("model-status");
  var rowsEl = document.getElementById("model-rows");
  var totalEl = document.getElementById("total-count");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render(list, total) {
    var shown = list.slice(0, MAX_SHOWN);
    if (!shown.length) {
      rowsEl.innerHTML = '<tr><td colspan="5">No models match your search.</td></tr>';
    } else {
      var html = "";
      for (var i = 0; i < shown.length; i++) {
        var m = shown[i];
        html += "<tr><td>" + esc(m[0]) + "</td><td>" + esc(m[1]) + "</td><td>" +
          esc(m[2]) + "</td><td>" + esc(m[3]) + "</td><td>" + esc(m[4]) + "</td></tr>";
      }
      rowsEl.innerHTML = html;
    }
    var extra = list.length > MAX_SHOWN
      ? " — showing first " + MAX_SHOWN + " of " + list.length + " matches"
      : "";
    statusEl.textContent = list.length.toLocaleString("en-US") +
      " match" + (list.length === 1 ? "" : "es") + " of " +
      total.toLocaleString("en-US") + " models" + extra;
  }

  function filter() {
    var q = searchInput.value.trim().toLowerCase();
    var brand = brandFilter.value;
    var out = [];
    for (var i = 0; i < models.length; i++) {
      var m = models[i];
      if (brand && m[0] !== brand) continue;
      if (q) {
        var hay = (m[0] + " " + m[1] + " " + m[2] + " " + m[3]).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      out.push(m);
    }
    render(out, models.length);
  }

  function load() {
    fetch("assets/models.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        models = data.models || [];
        totalEl.textContent = models.length.toLocaleString("en-US") + " supported models";
        // Brand dropdown, sorted by model count desc.
        var counts = {};
        models.forEach(function (m) { counts[m[0]] = (counts[m[0]] || 0) + 1; });
        Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
          .forEach(function (b) {
            var opt = document.createElement("option");
            opt.value = b;
            opt.textContent = b + " (" + counts[b].toLocaleString("en-US") + ")";
            brandFilter.appendChild(opt);
          });
        render(models, models.length);
      })
      .catch(function (err) {
        statusEl.textContent = "Could not load the model list (" + err.message +
          "). Please reload the page.";
        rowsEl.innerHTML = '<tr><td colspan="5">Model list failed to load.</td></tr>';
      });
  }

  searchInput.addEventListener("input", filter);
  brandFilter.addEventListener("change", filter);
  load();
})();

/* Count-up stats (Design 1 gold hero). */
(function () {
  "use strict";
  var els = document.querySelectorAll(".count");
  els.forEach(function (el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var start = Date.now(), dur = 1400;
    function tick() {
      var p = Math.min(1, (Date.now() - start) / dur);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();
