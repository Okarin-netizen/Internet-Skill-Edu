/* 共通エンジン：どの単元も「スタート → 体験 → 考える（クイズ） → まとめ」の同じ流れで動く。
   単元のページは Unit.run({...}) に内容を渡すだけで、画面の作りはここで共通化している。 */
(function () {
  "use strict";

  // "{漢字|よみ}" → ふりがな付きの表示
  var RUBY = /\{([^|}]+)\|([^}]+)\}/g;
  function R(s) { return String(s == null ? "" : s).replace(RUBY, "<ruby>$1<rt>$2</rt></ruby>"); }
  function plain(s) { return String(s).replace(RUBY, "$1"); }
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function button(cls, html) { var b = h("button", cls, html); b.type = "button"; return b; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- アイコン（線画・72×72） ----------
  var S = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  function svg(inner) { return '<svg viewBox="0 0 72 72" aria-hidden="true">' + inner + "</svg>"; }
  var ICONS = {
    tablet: svg('<rect x="14" y="8" width="44" height="56" rx="6" ' + S + '/><circle cx="36" cy="55" r="3" fill="currentColor"/>'),
    tabletMsg: svg('<rect x="14" y="8" width="44" height="56" rx="6" ' + S + '/><circle cx="36" cy="55" r="3" fill="currentColor"/><path d="M24 24h24M24 32h16" ' + S + '/>'),
    router: svg('<rect x="10" y="38" width="52" height="20" rx="4" ' + S + '/><path d="M22 38V22M50 38V22" ' + S + '/><path d="M28 18a12 12 0 0 1 16 0M23 12a20 20 0 0 1 26 0" ' + S + '/><circle cx="20" cy="48" r="2.5" fill="currentColor"/><circle cx="29" cy="48" r="2.5" fill="currentColor"/>'),
    server: svg('<rect x="16" y="8" width="40" height="16" rx="3" ' + S + '/><rect x="16" y="28" width="40" height="16" rx="3" ' + S + '/><rect x="16" y="48" width="40" height="16" rx="3" ' + S + '/><circle cx="46" cy="16" r="2.5" fill="currentColor"/><circle cx="46" cy="36" r="2.5" fill="currentColor"/><circle cx="46" cy="56" r="2.5" fill="currentColor"/>'),
    globe: svg('<circle cx="36" cy="36" r="26" ' + S + '/><path d="M10 36h52M36 10c-10 12-10 40 0 52M36 10c10 12 10 40 0 52M15 22h42M15 50h42" ' + S + '/>'),
    mail: svg('<rect x="10" y="18" width="52" height="36" rx="4" ' + S + '/><path d="M10 22l26 18 26-18" ' + S + '/>'),
    search: svg('<circle cx="31" cy="31" r="17" ' + S + '/><path d="M44 44l16 16" ' + S + '/>'),
    page: svg('<path d="M16 8h28l12 12v44H16z" ' + S + '/><path d="M44 8v12h12M24 32h24M24 42h24M24 52h14" ' + S + '/>'),
    photo: svg('<rect x="8" y="14" width="56" height="44" rx="4" ' + S + '/><path d="M14 52l14-16 10 10 8-8 12 14" ' + S + '/><circle cx="48" cy="26" r="5" ' + S + '/>'),
    phone: svg('<rect x="20" y="6" width="32" height="60" rx="6" ' + S + '/><path d="M32 14h8" ' + S + '/>'),
    copy: svg('<rect x="22" y="22" width="36" height="40" rx="4" ' + S + '/><path d="M14 50V14a4 4 0 0 1 4-4h28" ' + S + '/>'),
    chip: svg('<rect x="18" y="18" width="36" height="36" rx="4" ' + S + '/><path d="M26 10v8M36 10v8M46 10v8M26 54v8M36 54v8M46 54v8M10 26h8M10 36h8M10 46h8M54 26h8M54 36h8M54 46h8" ' + S + '/><text x="36" y="41" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor" font-family="sans-serif">AI</text>'),
    data: svg('<rect x="12" y="22" width="38" height="40" rx="4" ' + S + '/><path d="M22 12h38v40" ' + S + '/>'),
    faceid: svg('<path d="M12 24v-8a4 4 0 0 1 4-4h8M48 12h8a4 4 0 0 1 4 4v8M60 48v8a4 4 0 0 1-4 4h-8M24 60h-8a4 4 0 0 1-4-4v-8" ' + S + '/><circle cx="28" cy="32" r="2.5" fill="currentColor"/><circle cx="44" cy="32" r="2.5" fill="currentColor"/><path d="M28 45a10 8 0 0 0 16 0" ' + S + '/>'),
    translate: svg('<rect x="8" y="10" width="32" height="28" rx="4" ' + S + '/><rect x="32" y="34" width="32" height="28" rx="4" ' + S + '/><path d="M16 18h16M24 18v12" ' + S + '/><path d="M40 56l8-14 8 14M43 51h10" ' + S + '/>'),
    vacuum: svg('<circle cx="36" cy="38" r="24" ' + S + '/><circle cx="36" cy="38" r="8" ' + S + '/><path d="M22 24l6 6" ' + S + '/>'),
    speaker: svg('<rect x="20" y="8" width="32" height="56" rx="14" ' + S + '/><circle cx="36" cy="44" r="7" ' + S + '/><path d="M30 20h12" ' + S + '/>'),
    calc: svg('<rect x="16" y="8" width="40" height="56" rx="5" ' + S + '/><rect x="23" y="15" width="26" height="12" rx="2" ' + S + '/><path d="M26 37h0M36 37h0M46 37h0M26 46h0M36 46h0M46 46h0M26 55h0M36 55h0M46 55h0" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/>'),
    clock: svg('<circle cx="36" cy="36" r="26" ' + S + '/><path d="M36 20v16l10 8" ' + S + '/>'),
    play: svg('<rect x="8" y="14" width="56" height="44" rx="6" ' + S + '/><path d="M30 26v20l16-10z" ' + S + '/>'),
    pencil: svg('<path d="M14 58l4-14 30-30 10 10-30 30zM42 20l10 10" ' + S + '/>'),
    book: svg('<path d="M36 18c-8-6-18-6-26-4v42c8-2 18-2 26 4 8-6 18-6 26-4V14c-8-2-18-2-26 4zM36 18v42" ' + S + '/>'),
    person: svg('<circle cx="36" cy="22" r="11" ' + S + '/><path d="M14 62c2-14 12-20 22-20s20 6 22 20" ' + S + '/>'),
    unknown: svg('<circle cx="36" cy="22" r="11" ' + S + '/><path d="M14 62c2-14 12-20 22-20s20 6 22 20" ' + S + '/><path d="M32 18a4 4 0 1 1 5 4v3" ' + S + '/>'),
    teacher: svg('<rect x="34" y="8" width="30" height="22" rx="2" ' + S + '/><circle cx="20" cy="26" r="9" ' + S + '/><path d="M4 62c2-12 8-18 16-18s14 6 16 18M28 40l10-14" ' + S + '/>'),
    home: svg('<path d="M10 34L36 12l26 22M18 28v32h36V28" ' + S + '/><path d="M30 60V44h12v16" ' + S + '/>'),
    lock: svg('<rect x="14" y="32" width="44" height="30" rx="4" ' + S + '/><path d="M24 32V22a12 12 0 0 1 24 0v10" ' + S + '/><circle cx="36" cy="47" r="4" fill="currentColor"/>'),
    link: svg('<path d="M30 42l12-12M26 34l-6 6a8 8 0 0 0 12 12l6-6M46 38l6-6a8 8 0 0 0-12-12l-6 6" ' + S + '/>'),
    warn: svg('<path d="M36 10L64 60H8z" ' + S + '/><path d="M36 28v14" ' + S + '/><circle cx="36" cy="51" r="3" fill="currentColor"/>'),
    chat: svg('<path d="M10 14h52v34H30l-12 12V48h-8z" ' + S + '/>'),
    heart: svg('<path d="M36 60S10 44 10 26a13 13 0 0 1 26-4 13 13 0 0 1 26 4c0 18-26 34-26 34z" ' + S + '/>'),
    pin: svg('<path d="M36 64S16 42 16 28a20 20 0 0 1 40 0c0 14-20 36-20 36z" ' + S + '/><circle cx="36" cy="28" r="7" ' + S + '/>'),
    food: svg('<path d="M10 36h52a26 22 0 0 1-52 0zM24 58h24" ' + S + '/><path d="M28 26c0-6 4-6 4-12M40 26c0-6 4-6 4-12" ' + S + '/>'),
    paw: svg('<circle cx="36" cy="46" r="12" ' + S + '/><circle cx="18" cy="30" r="6" ' + S + '/><circle cx="30" cy="18" r="6" ' + S + '/><circle cx="42" cy="18" r="6" ' + S + '/><circle cx="54" cy="30" r="6" ' + S + '/>'),
    key: svg('<circle cx="22" cy="36" r="12" ' + S + '/><path d="M34 36h28M52 36v10M60 36v8" ' + S + '/>'),
    coin: svg('<circle cx="36" cy="36" r="26" ' + S + '/><path d="M28 26l8 12 8-12M26 40h20M26 48h20M36 38v16" ' + S + '/>'),
    game: svg('<rect x="8" y="22" width="56" height="30" rx="14" ' + S + '/><path d="M22 31v12M16 37h12" ' + S + '/><circle cx="46" cy="33" r="3" fill="currentColor"/><circle cx="52" cy="41" r="3" fill="currentColor"/>'),
    cloud: svg('<path d="M20 54h34a12 12 0 0 0 0-24 18 18 0 0 0-34-4 14 14 0 0 0 0 28z" ' + S + '/>'),
    school: svg('<path d="M8 62h56M14 62V30h44v32M36 30V12l14 6-14 6M30 62V48h12v14" ' + S + '/>'),
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    hint: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.3 1.1 2.2h5c0-.9.3-1.6 1.1-2.2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  // ねこ・犬の絵（色の明るさ light: 0〜1）
  function animal(kind, light) {
    var L = Math.round(14 + light * 76);
    var fill = kind === "fox" ? "hsl(24, 70%, 48%)" : "hsl(28, 32%, " + L + "%)";
    var eye = L < 45 ? "#F4F4F4" : "#222";
    var out = "#3A3A3A";
    var body;
    if (kind !== "dog") {
      body =
        '<path d="M14 34L18 8l18 14z M58 34L54 8 36 22z" fill="' + fill + '" stroke="' + out + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="36" cy="40" r="24" fill="' + fill + '" stroke="' + out + '" stroke-width="2"/>' +
        '<ellipse cx="27" cy="38" rx="3" ry="5" fill="' + eye + '"/><ellipse cx="45" cy="38" rx="3" ry="5" fill="' + eye + '"/>' +
        '<path d="M33 48h6l-3 3z" fill="' + eye + '"/>' +
        '<path d="M8 46h14M8 52l14-3M64 46H50M64 52l-14-3" stroke="' + eye + '" stroke-width="1.5" fill="none"/>' +
        (kind === "fox" ? '<path d="M22 50q14 16 28 0q-14 6-28 0z" fill="#F6F1E8"/><path d="M33 48h6l-3 3z" fill="#222"/>' : "");
    } else {
      body =
        '<ellipse cx="13" cy="36" rx="8" ry="17" fill="' + fill + '" stroke="' + out + '" stroke-width="2" transform="rotate(18 13 36)"/>' +
        '<ellipse cx="59" cy="36" rx="8" ry="17" fill="' + fill + '" stroke="' + out + '" stroke-width="2" transform="rotate(-18 59 36)"/>' +
        '<circle cx="36" cy="38" r="22" fill="' + fill + '" stroke="' + out + '" stroke-width="2"/>' +
        '<ellipse cx="36" cy="50" rx="11" ry="8" fill="' + fill + '" stroke="' + out + '" stroke-width="1.5"/>' +
        '<circle cx="28" cy="34" r="3" fill="' + eye + '"/><circle cx="44" cy="34" r="3" fill="' + eye + '"/>' +
        '<ellipse cx="36" cy="46" rx="4" ry="3" fill="' + eye + '"/>';
    }
    return '<span class="animal"><svg viewBox="0 0 72 72" aria-hidden="true">' + body + "</svg></span>";
  }

  // 段階ヒント：押すたびに1つずつヒントが増える。答えそのものは書かず、考え方の手がかりだけを出す
  function hintBox() {
    var box = h("div", "hints"), btn = button("hint-btn", ""), list = h("ol", "hint-list");
    list.setAttribute("aria-live", "polite");
    box.append(btn, list);
    var hints = [], shown = 0;
    function label() {
      var t = shown >= hints.length ? "ヒントはここまで" : (shown === 0 ? "ヒントを{見|み}る" : "{次|つぎ}のヒント") + "（" + (shown + 1) + "/" + hints.length + "）";
      btn.innerHTML = ICONS.hint + "<span>" + R(t) + "</span>";
      btn.disabled = shown >= hints.length;
    }
    btn.addEventListener("click", function () {
      if (shown >= hints.length) return;
      list.appendChild(h("li", "", '<span class="n">' + R("ヒント") + (shown + 1) + "</span>" + R(hints[shown])));
      shown++;
      box.classList.remove("nudge");
      label();
    });
    return {
      el: box,
      set: function (hs) { hints = hs || []; shown = 0; list.replaceChildren(); box.classList.remove("nudge"); box.hidden = !hints.length; label(); },
      // まちがえたときに、ヒントボタンに目が向くようにする
      nudge: function () {
        if (shown >= hints.length) return;
        box.classList.remove("nudge"); void box.offsetWidth; box.classList.add("nudge");
      }
    };
  }

  // 判定カード用の表示部品
  var ui = {
    chat: function (from, text, icon) {
      return '<div class="chat"><span class="from">' + ICONS[icon || "unknown"] + R(from) + '</span><p class="bubble">' + R(text) + "</p></div>";
    },
    ai: function (q, a) {
      return '<div class="ai-box"><p class="q"><span class="tag">' + R("{質問|しつもん}") + "</span>" + R(q) + '</p><p class="a"><span class="tag ai">AI</span>' + R(a) + "</p></div>";
    },
    scene: function (icon, text) {
      return '<div class="scene">' + ICONS[icon] + "<p>" + R(text) + "</p></div>";
    }
  };

  // ---------- 体験の種類 ----------
  var A = {};

  // リレー：機械を順にタッチして届ける。free: true のときは光らせず、並びもばらばらにして自分で道順を考える
  A.relay = function (ctx, c) {
    var label = c.payload || "";
    function build() {
      ctx.say(c.texts[0]);
      var route = h("div", "route" + (c.free ? " free" : ""));
      route.style.setProperty("--n", c.nodes.length);
      var nodes = c.nodes.map(function (n) {
        var b = button("node", '<span class="node-icon">' + ICONS[n.icon] + "</span><span>" + R(n.label) + (n.sub ? "<br><small>" + R(n.sub) + "</small>" : "") + "</span>");
        b.disabled = true;
        return b;
      });
      var order = nodes.map(function (_, i) { return i; });
      if (c.free) {
        var rest = shuffle(order.slice(1));
        if (rest.join() === order.slice(1).join()) rest.reverse();
        order = [0].concat(rest);
      }
      order.forEach(function (i) { route.appendChild(nodes[i]); });
      var packet = h("div", "packet", ICONS[c.packetIcon || "mail"] + "<span>" + R(label) + "</span>");
      packet.setAttribute("aria-hidden", "true");
      route.appendChild(packet);
      ctx.stage.replaceChildren(route);
      var pos = 0, busy = false, last = nodes.length - 1;

      function place(animate) {
        var icon = nodes[pos].querySelector(".node-icon");
        var r = route.getBoundingClientRect(), ir = icon.getBoundingClientRect();
        var narrow = window.matchMedia("(max-width: 720px)").matches;
        var x, y;
        if (narrow) {
          x = ir.left - r.left - packet.offsetWidth - 12;
          if (x < 0) x = ir.right - r.left + 12;
          y = ir.top - r.top + ir.height / 2 - 22;
        } else {
          x = ir.left - r.left + ir.width / 2;
          y = ir.top - r.top - 60;
        }
        if (!animate) packet.style.transition = "none";
        packet.style.left = x + "px";
        packet.style.top = y + "px";
        if (!animate) { void packet.offsetWidth; packet.style.transition = ""; }
      }
      function mark() {
        nodes.forEach(function (n, i) {
          n.classList.toggle("is-next", !c.free && i === pos + 1);
          n.classList.toggle("is-done", i <= pos);
          n.disabled = c.free ? i <= pos : i !== pos + 1;
        });
        if (!c.free && nodes[pos + 1]) nodes[pos + 1].focus({ preventScroll: true });
      }
      ctx.onResize(function () { place(false); });
      requestAnimationFrame(function () { place(false); mark(); });
      nodes.forEach(function (n, i) {
        n.addEventListener("click", function () {
          if (busy || i <= pos) return;
          if (i !== pos + 1) { shake(n); ctx.miss(); ctx.say(c.hint || "{順番|じゅんばん}が{違|ちが}います。{次|つぎ}にどこを{通|とお}るか{考|かんが}えてみましょう。"); return; }
          busy = true;
          pos = i;
          nodes.forEach(function (m) { m.disabled = true; m.classList.remove("is-next"); });
          place(!reduceMotion);
          setTimeout(function () {
            busy = false;
            ctx.say(c.texts[pos]);
            if (pos === last) {
              nodes.forEach(function (m, k) { m.classList.toggle("is-done", k < last); });
              nodes[last].classList.add("is-goal");
              ctx.done();
            } else {
              mark();
            }
          }, reduceMotion ? 50 : 650);
        });
      });
    }
    if (c.pick) {
      ctx.say(c.pick.prompt);
      var g = h("div", "opts");
      c.pick.options.forEach(function (o) {
        var b = button("opt", R(o));
        b.addEventListener("click", function () { label = o; build(); });
        g.appendChild(b);
      });
      ctx.stage.replaceChildren(g);
    } else {
      build();
    }
  };

  // 組み立て：ばらばらに届いたパケットを番号順に並べる
  var SCENE =
    '<rect width="300" height="200" fill="#9CC7E4"/><circle cx="240" cy="48" r="22" fill="#F2C14E"/>' +
    '<path d="M0 150L70 70l60 80z" fill="#5F8A6B"/><path d="M90 150l80-100 90 100z" fill="#4C7559"/>' +
    '<rect y="150" width="300" height="50" fill="#7FB069"/><rect x="200" y="120" width="50" height="40" fill="#E9E2D0"/>' +
    '<path d="M194 122l31-24 31 24z" fill="#B5523B"/><rect x="218" y="138" width="14" height="22" fill="#7A5236"/>' +
    '<path d="M20 175h60M110 185h50" stroke="#5E9450" stroke-width="4"/>';
  A.order = function (ctx, c) {
    var cols = 3, rows = 3, n = cols * rows, W = 100, H = 200 / rows;
    function tile(i) {
      var x = (i % cols) * W, y = Math.floor(i / cols) * H;
      return '<svg viewBox="' + x + " " + y + " " + W + " " + H + '" aria-hidden="true">' + SCENE + "</svg>";
    }
    ctx.say(c.texts[0]);
    var wrap = h("div", "stage");
    var pic = h("div", "picture", '<svg viewBox="0 0 300 200" aria-hidden="true">' + SCENE + "</svg>");
    var send = button("btn", R("{送信|そうしん}する"));
    wrap.append(pic, send);
    ctx.stage.replaceChildren(wrap);
    send.addEventListener("click", function () {
      ctx.say(c.texts[1]);
      var board = h("div", "board"), slots = [], tray = h("div", "tray"), next = 0;
      board.style.setProperty("--rows", rows);
      for (var i = 0; i < n; i++) { var s = h("div", "slot"); board.appendChild(s); slots.push(s); }
      var lost = c.lost == null ? -1 : c.lost;
      var asking = h("div", "opts");
      asking.hidden = true;
      function addPiece(i) {
        var b = button("piece", tile(i) + '<span class="num">' + (i + 1) + "</span>");
        b.setAttribute("aria-label", (i + 1) + "ばん");
        b.addEventListener("click", function () {
          if (i !== next) { shake(b); ctx.miss(); ctx.say(c.hint); return; }
          slots[i].innerHTML = tile(i);
          slots[i].classList.add("filled");
          b.remove();
          next++;
          if (next === lost) { ctx.say(c.texts.lost); asking.hidden = false; return; }
          if (next === n) {
            board.classList.add("complete");
            ctx.say(c.texts[2]);
            ctx.done();
          }
        });
        tray.appendChild(b);
      }
      c.lostOptions.forEach(function (o, k) {
        var b = button("opt", R(o));
        b.addEventListener("click", function () {
          if (k !== c.lostAnswer) { shake(b); ctx.miss(); ctx.say(c.lostHint); return; }
          asking.hidden = true;
          ctx.say(c.texts.resent);
          addPiece(lost);
        });
        asking.appendChild(b);
      });
      var order = shuffle(slots.map(function (_, i) { return i; }).filter(function (i) { return i !== lost; }));
      order.forEach(addPiece);
      wrap.replaceChildren(h("p", "caption", R("{届|とど}いたパケット")), tray, asking, h("p", "caption", R("{組|く}み{立|た}て")), board);
    });
  };

  // 広がる：投稿した写真がコピーされていく
  A.spread = function (ctx, c) {
    var N = 12;
    var grid = h("div", "devices"), devs = [];
    for (var i = 0; i < N; i++) {
      var d = h("div", "device", ICONS.phone + '<span class="pic">' + ICONS.photo + '</span><span class="who">' + (i === 0 ? R("{自分|じぶん}") : "") + "</span>");
      if (i === 0) d.classList.add("own");
      grid.appendChild(d);
      devs.push(d);
    }
    var counter = h("p", "counter");
    var action = button("btn", "");
    var others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    var copies = [0, 2, 6, 11];
    var step = 0;
    function count() {
      var k = grid.querySelectorAll(".has").length;
      counter.innerHTML = R("{写真|しゃしん}がある{画面|がめん}：") + k + R("{台|だい}");
    }
    function render() {
      ctx.say(c.texts[step]);
      action.innerHTML = R(c.buttons[step]);
      count();
    }
    action.addEventListener("click", function () {
      if (step === 0) {
        devs[0].classList.add("has");
      } else if (step <= 3) {
        for (var j = 0; j < copies[step]; j++) devs[others[j]].classList.add("has");
      } else {
        devs[0].classList.remove("has");
        count();
        action.hidden = true;
        ctx.say(c.texts[5]);
        ctx.done();
        return;
      }
      step++;
      render();
    });
    var wrap = h("div", "stage");
    wrap.append(grid, counter, action);
    ctx.stage.replaceChildren(wrap);
    render();
  };

  // 仕分け：カードを選んでから箱を選ぶ（共通の部品）
  function sortCore(ctx, cfg, onComplete) {
    ctx.say(cfg.intro);
    var wrap = h("div", "sorter"), tray = h("div", "tray"), bins = h("div", "bins");
    var selected = null, left = cfg.cards.length;
    cfg.bins.forEach(function (bn, bi) {
      var b = button("bin", '<span class="bin-label">' + R(bn) + '</span><span class="bin-items"></span>');
      b.addEventListener("click", function () {
        if (!selected) { shake(b); ctx.say("{先|さき}にカードを1つ{選|えら}んでください。"); return; }
        var cd = selected.card, el = selected.el;
        if (cd.bin === bi) {
          // 箱の中は押せない表示用の札にする（箱のどこを押しても箱が反応するように）
          b.querySelector(".bin-items").appendChild(h("span", "card placed", el.innerHTML));
          el.remove();
          ctx.say(cd.why || "{正解|せいかい}です。");
          selected = null;
          if (--left === 0) onComplete();
        } else {
          shake(el);
          ctx.miss();
          ctx.say(cd.hint || cfg.hint || "もう{一度|いちど}{考|かんが}えてみましょう。");
        }
      });
      bins.appendChild(b);
    });
    shuffle(cfg.cards).forEach(function (cd) {
      var e = button("card", cd.html || ((cd.icon ? ICONS[cd.icon] : "") + "<span>" + R(cd.label) + "</span>"));
      e.addEventListener("click", function () {
        if (e.classList.contains("placed")) return;
        if (selected) selected.el.classList.remove("sel");
        selected = { el: e, card: cd };
        e.classList.add("sel");
      });
      tray.appendChild(e);
    });
    wrap.append(h("p", "caption", R(cfg.trayLabel || "カードを{選|えら}んでから、{入|い}れる{箱|はこ}をタッチ")), tray, bins);
    ctx.stage.replaceChildren(wrap);
  }
  A.sort = function (ctx, c) {
    sortCore(ctx, c, function () { ctx.say(c.after); ctx.done(); });
  };

  // AIの学習：例を学ばせて、新しい写真を当てさせる
  var NAMES = { cat: "ねこ", dog: "{犬|いぬ}", fox: "きつね" };
  A.train = function (ctx, c) {
    var w = c.lightWeight || 3;
    function predict(a) {
      var best = null, bd = Infinity;
      c.train.forEach(function (t) {
        var d = Math.abs(t.ear - a.ear) + w * Math.abs(t.light - a.light);
        if (d < bd) { bd = d; best = t; }
      });
      return best.kind;
    }
    function testPhase() {
      ctx.say(c.texts.test);
      var grid = h("div", "tests"), left = c.test.length;
      c.test.forEach(function (a) {
        var b = button("test-card", animal(a.kind, a.light) + '<span class="ai-says">' + R("タッチしてAIに{聞|き}く") + "</span>");
        b.addEventListener("click", function () {
          if (b.dataset.done) return;
          b.dataset.done = "1";
          var p = predict(a);
          b.classList.add(p === a.kind ? "right" : "wrong");
          b.querySelector(".ai-says").innerHTML = R("AIの{答|こた}え：") + "<b>" + R(NAMES[p]) + "</b>";
          if (--left === 0) { ctx.say(c.texts.after); ctx.done(); }
        });
        grid.appendChild(b);
      });
      ctx.stage.replaceChildren(h("p", "caption", R("AIに{見|み}せる{新|あたら}しい{写真|しゃしん}")), grid);
    }
    function learned() {
      ctx.say(c.texts.learned);
      var go = button("btn", R("AIをテストする"));
      go.addEventListener("click", testPhase);
      ctx.stage.appendChild(go);
      go.focus({ preventScroll: true });
    }
    if (c.teach === "sort") {
      sortCore(ctx, {
        intro: c.texts.teach,
        bins: [NAMES.cat, NAMES.dog],
        cards: c.train.map(function (a) { return { html: animal(a.kind, a.light), bin: a.kind === "cat" ? 0 : 1, why: "{正解|せいかい}です。", hint: "{耳|みみ}の{形|かたち}をよく{見|み}てみましょう。" }; }),
        trayLabel: "{写真|しゃしん}を{選|えら}んでから、ねこか{犬|いぬ}の{箱|はこ}をタッチ"
      }, learned);
    } else {
      ctx.say(c.texts.teach);
      var groups = h("div", "groups");
      ["cat", "dog"].forEach(function (k) {
        var g = h("div", "group", "<b>" + R(NAMES[k]) + '</b><div class="row"></div>');
        c.train.filter(function (a) { return a.kind === k; }).forEach(function (a) { g.querySelector(".row").insertAdjacentHTML("beforeend", animal(a.kind, a.light)); });
        groups.appendChild(g);
      });
      var go = button("btn", R("AIに{学習|がくしゅう}させる"));
      go.addEventListener("click", function () { go.remove(); learned(); });
      ctx.stage.replaceChildren(h("p", "caption", R("AIが{学|まな}ぶ{写真|しゃしん}")), groups, go);
    }
  };

  // 次の言葉：AIの予想の中から言葉を選んで文を作る
  A.nextword = function (ctx, c) {
    var wrap = h("div", "nextword"), line = h("p", "sentence"), list = h("div", "cands");
    var auto = button("btn quiet", R("AIにまかせる")), again = button("btn quiet", R("もう{一度|いちど}{作|つく}る"));
    var actions = h("div", "row-actions");
    actions.append(auto, again);
    var text, node, finished = false;
    function render() {
      line.innerHTML = R(text) + (node ? '<span class="caret"></span>' : "。");
      list.replaceChildren();
      if (!node) return;
      node.forEach(function (o) {
        var b = button("cand", '<span class="w">' + R(o.w) + '</span><span class="bar"><span style="width:' + o.p + '%"></span></span><span class="p">' + o.p + "%</span>");
        b.addEventListener("click", function () { choose(o); });
        list.appendChild(b);
      });
    }
    function choose(o) {
      text += o.w;
      node = o.next || null;
      render();
      if (node) { ctx.say(c.texts.mid); return; }
      auto.hidden = true;
      again.hidden = false;
      ctx.say(c.texts.end);
      if (!finished) { finished = true; ctx.done(); }
    }
    function reset() {
      text = c.start; node = c.tree;
      auto.hidden = false; again.hidden = true;
      ctx.say(c.texts.start);
      render();
    }
    auto.addEventListener("click", function () {
      choose(node.reduce(function (a, b) { return b.p > a.p ? b : a; }));
    });
    again.addEventListener("click", reset);
    wrap.append(line, h("p", "caption", R("{次|つぎ}に{来|く}そうな{言葉|ことば}（AIの{予想|よそう}）")), list, actions);
    ctx.stage.replaceChildren(wrap);
    reset();
  };

  // 選ぶ：あてはまるものを全部選んで答え合わせ
  A.select = function (ctx, c) {
    ctx.say(c.texts.start);
    var grid = h("div", "select-grid");
    var items = c.items.map(function (it) {
      var b = button("sel-item", ICONS[it.icon] + "<span>" + R(it.label) + '</span><span class="why" hidden>' + R(it.why) + "</span>");
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        if (b.dataset.checked) return;
        b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      });
      grid.appendChild(b);
      return { el: b, it: it };
    });
    var check = button("btn", R("{答|こた}え{合|あ}わせ"));
    check.addEventListener("click", function () {
      items.forEach(function (x) {
        var on = x.el.getAttribute("aria-pressed") === "true";
        x.el.dataset.checked = "1";
        x.el.classList.add(on === x.it.correct ? "right" : "wrong");
        x.el.querySelector(".why").hidden = false;
      });
      check.hidden = true;
      ctx.say(c.texts.after);
      ctx.done();
    });
    ctx.stage.replaceChildren(grid, check);
  };

  // 判定カード：1枚ずつ見て、どうするかを選ぶ
  A.judge = function (ctx, c) {
    var i = 0;
    function show() {
      var cd = c.cards[i];
      ctx.say(cd.prompt || c.prompt);
      if (cd.hints) ctx.hints(cd.hints);
      var card = h("div", "judge");
      card.appendChild(h("p", "count", (i + 1) + " / " + c.cards.length));
      card.appendChild(h("div", "judge-visual", cd.html));
      var opts = h("div", "opts"), fb = h("p", "feedback");
      fb.setAttribute("aria-live", "polite");
      var ans = [].concat(cd.answer);
      var last = i === c.cards.length - 1;
      var nxt = button("btn", R(last ? "{終|お}わり" : "{次|つぎ}のカードへ"));
      nxt.hidden = true;
      (cd.options || c.options).forEach(function (o, k) {
        var b = button("opt", R(o));
        b.addEventListener("click", function () {
          if (ans.indexOf(k) >= 0) {
            b.classList.add("right");
            opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            fb.className = "feedback right";
            fb.innerHTML = R(cd.why);
            nxt.hidden = false;
            nxt.focus({ preventScroll: true });
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            fb.className = "feedback wrong";
            ctx.miss();
            fb.innerHTML = R(cd.hint || c.hint || "もう{一度|いちど}{考|かんが}えてみましょう。");
          }
        });
        opts.appendChild(b);
      });
      nxt.addEventListener("click", function () {
        if (!last) { i++; show(); return; }
        nxt.hidden = true;
        ctx.say(c.after);
        ctx.done();
      });
      card.append(opts, fb, nxt);
      ctx.stage.replaceChildren(card);
    }
    show();
  };

  // めくる：タッチして、どう受け取られるかを見る
  A.reveal = function (ctx, c) {
    ctx.say(c.texts.start);
    var list = h("div", "reveals"), left = c.items.length;
    c.items.forEach(function (it) {
      var b = button("reveal", it.front + '<span class="back" hidden>' + R(it.back) + '</span><span class="hint">' + R("タッチして{見|み}る") + "</span>");
      b.addEventListener("click", function () {
        if (b.classList.contains("open")) return;
        b.classList.add("open");
        b.querySelector(".back").hidden = false;
        b.querySelector(".hint").hidden = true;
        if (--left === 0) { ctx.say(c.texts.after); ctx.done(); }
      });
      list.appendChild(b);
    });
    ctx.stage.replaceChildren(list);
  };

  // ---------- 単元の流れ ----------
  function find(code) {
    var flat = [];
    window.CATALOG.forEach(function (t) { t.units.forEach(function (u) { flat.push({ theme: t, unit: u }); }); });
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].unit.code === code) return { theme: flat[i].theme, unit: flat[i].unit, next: flat[i + 1] ? flat[i + 1].unit : null };
    }
    throw new Error("unknown unit " + code);
  }

  function run(cfg) {
    var m = find(cfg.code);
    document.title = m.unit.code + " " + plain(m.unit.title);
    var app = document.getElementById("app");
    var words = cfg.summary.words.map(function (w) {
      return '<div class="word"><span class="node-icon">' + ICONS[w.icon] + "</span><div><b>" + R(w.term) + "</b><span>" + R(w.desc) + "</span></div></div>";
    }).join("");
    var nextLink = m.next
      ? '<a class="btn" href="../' + m.next.dir + '/index.html">' + R("{次|つぎ}の{単元|たんげん}へ") + "</a>"
      : '<a class="btn" href="../../index.html">' + R("{一覧|いちらん}にもどる") + "</a>";
    app.innerHTML =
      '<header class="topbar"><a class="back" href="../../index.html">' + ICONS.back + R("{一覧|いちらん}") + "</a>" +
      '<span class="unit-tag">' + m.theme.code + " " + R(m.theme.name) + "</span>" +
      '<ol class="steps" aria-label="' + R("{進|すす}み{具合|ぐあい}") + '"><li>' + R("{体験|たいけん}") + "</li><li>" + R("{考|かんが}える") + "</li><li>まとめ</li></ol></header>" +
      '<section class="screen" id="s-start"><div class="hero"><p class="eyebrow">' + m.unit.code + "</p><h1>" + R(m.unit.title) + '</h1><p class="lead">' + R(cfg.lead) + '</p><button class="btn" id="startBtn" type="button">スタート</button></div></section>' +
      '<section class="screen" id="s-act" hidden><div class="prompt"><p id="prompt" aria-live="polite"></p></div><div id="actHints"></div><div class="stage" id="stage"></div><button class="btn" id="actNext" type="button" hidden>' + R("{次|つぎ}へ") + "</button></section>" +
      '<section class="screen" id="s-quiz" hidden><div class="prompt"><p id="quizQ"></p></div><div id="quizHints"></div><div class="choices" id="choices"></div><p class="feedback" id="quizFb" aria-live="polite"></p><button class="btn" id="quizNext" type="button" hidden>' + R("{次|つぎ}へ") + "</button></section>" +
      '<section class="screen" id="s-end" hidden><h2>' + R(cfg.summary.headline) + '</h2><div class="words">' + words + '</div><div class="end-actions"><button class="btn quiet" id="againBtn" type="button">' + R("もう{一度|いちど}やる") + "</button>" + nextLink + "</div></section>";

    var $ = function (id) { return document.getElementById(id); };
    var screens = ["s-start", "s-act", "s-quiz", "s-end"];
    var steps = app.querySelectorAll(".steps li");
    function show(id) {
      var idx = screens.indexOf(id) - 1;
      screens.forEach(function (s) { $(s).hidden = s !== id; });
      steps.forEach(function (li, i) { li.className = i < idx ? "done" : i === idx ? "on" : ""; });
      window.scrollTo(0, 0);
    }

    var actHints = hintBox(), quizHints = hintBox();
    $("actHints").replaceWith(actHints.el);
    $("quizHints").replaceWith(quizHints.el);

    // 体験
    var resizeFn = null;
    window.addEventListener("resize", function () { if (resizeFn && !$("s-act").hidden) resizeFn(); });
    var ctx = {
      stage: $("stage"),
      say: function (s) { $("prompt").innerHTML = R(s); },
      done: function () { $("actNext").hidden = false; $("actNext").focus({ preventScroll: true }); },
      onResize: function (fn) { resizeFn = fn; },
      hints: function (hs) { actHints.set(hs); },
      miss: function () { actHints.nudge(); }
    };
    function startActivity() {
      resizeFn = null;
      $("actNext").hidden = true;
      ctx.stage.replaceChildren();
      actHints.set(cfg.activity.hints);
      show("s-act");
      A[cfg.activity.type](ctx, cfg.activity);
    }

    // クイズ
    var qi = 0;
    function renderQuiz() {
      var q = cfg.quiz[qi];
      $("quizQ").innerHTML = R(q.q);
      $("quizFb").textContent = "";
      $("quizFb").className = "feedback";
      $("quizNext").hidden = true;
      quizHints.set(q.hints);
      var box = $("choices");
      box.replaceChildren();
      shuffle(q.options).forEach(function (o, k) {
        var b = button("choice", '<span class="mark" aria-hidden="true">' + "ABCD"[k] + "</span><span>" + R(o.t) + "</span>");
        b.addEventListener("click", function () {
          if (o.correct) {
            b.classList.add("right");
            box.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            $("quizFb").className = "feedback right";
            $("quizFb").innerHTML = R(q.right || "{正解|せいかい}です。");
            $("quizNext").hidden = false;
            $("quizNext").focus({ preventScroll: true });
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            $("quizFb").className = "feedback wrong";
            quizHints.nudge();
            $("quizFb").innerHTML = R(q.wrong || "もう{一度|いちど}{考|かんが}えてみましょう。");
          }
        });
        box.appendChild(b);
      });
    }

    $("startBtn").addEventListener("click", startActivity);
    $("actNext").addEventListener("click", function () { qi = 0; renderQuiz(); show("s-quiz"); });
    $("quizNext").addEventListener("click", function () {
      qi++;
      if (qi < cfg.quiz.length) { renderQuiz(); window.scrollTo(0, 0); } else show("s-end");
    });
    $("againBtn").addEventListener("click", startActivity);
  }

  window.Unit = { run: run, ui: ui, R: R, plain: plain, icons: ICONS };
})();
