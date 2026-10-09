/* Presupuestos Técnicos — lógica del editor y render de la hoja */
(function () {
  "use strict";

  const STORE_DRAFT = "pt.draft.v1";
  const STORE_SAVED = "pt.saved.v1";
  const STORE_SEQ = "pt.seq.v1";
  const STORE_BRAND = "pt.brand.v1";

  const CATS = [
    ["cpu", "Procesador"], ["mb", "Placa madre"], ["ram", "Memoria RAM"], ["ssd", "Almacenamiento"],
    ["gpu", "Tarjeta de video"], ["psu", "Fuente de poder"], ["case", "Gabinete"], ["cool", "Refrigeración"],
    ["os", "Sistema operativo"], ["mon", "Monitor"], ["per", "Periféricos"], ["net", "Redes"],
    ["ups", "UPS / energía"], ["sw", "Software / licencias"], ["srv", "Servicio técnico"], ["nb", "Notebook / equipo armado"],
    ["otro", "Otro"]
  ];
  const CAT = Object.fromEntries(CATS);
  const TECH_CATS = ["nb", "cpu", "mb", "ram", "ssd", "gpu", "psu", "cool", "case", "os", "mon"];
  const SWATCHES = ["#1f3f8f", "#0f5e63", "#2b2d42", "#7a1f3d", "#9a4b0f", "#3d5a1e", "#4b2f8f", "#111111"];

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const uid = () => Math.random().toString(36).slice(2, 10);

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

  function nextNumber(peek) {
    const year = new Date().getFullYear();
    let seq = parseInt(safeGet(STORE_SEQ) || "0", 10) || 0;
    const n = seq + 1;
    if (!peek) safeSet(STORE_SEQ, String(n));
    return `COT-${year}-${String(n).padStart(4, "0")}`;
  }

  const item = (cat, desc, specs, warranty, qty, price, disc) =>
    ({ id: uid(), cat, desc, specs, warranty, qty, price, disc: disc || 0 });

  function sampleItems() {
    return [
      item("cpu", "AMD Ryzen 7 9700X", "8 núcleos / 16 hilos · 3,8 – 5,5 GHz · socket AM5 · 65 W TDP", "36 meses", 1, 289990),
      item("mb", "ASUS TUF Gaming B650-Plus WiFi", "Chipset B650 · DDR5 · 2× M.2 PCIe 4.0 · Wi-Fi 6 · formato ATX", "36 meses", 1, 179990),
      item("ram", "Kingston Fury Beast 32 GB (2×16 GB) DDR5-6000", "CL36 · dual channel · perfil AMD EXPO", "Vitalicia", 1, 119990),
      item("ssd", "Samsung 990 Pro 1 TB NVMe M.2", "PCIe 4.0 ×4 · hasta 7.450 MB/s lectura · 6.900 MB/s escritura", "5 años", 1, 109990),
      item("gpu", "NVIDIA GeForce RTX 5070 12 GB", "GDDR7 · bus 192-bit · DLSS 4 · 3× DisplayPort 2.1, 1× HDMI 2.1", "36 meses", 1, 649990),
      item("psu", "Corsair RM750e 750 W 80 Plus Gold", "Totalmente modular · ATX 3.1 · conector 12V-2x6", "7 años", 1, 99990),
      item("case", "Lian Li Lancool 216", "Mid tower ATX · 2× 160 mm frontales · panel de vidrio templado", "12 meses", 1, 94990),
      item("cool", "DeepCool AK620", "Disipador doble torre · 2× ventilador 120 mm · hasta 260 W", "12 meses", 1, 59990),
      item("os", "Windows 11 Pro", "64 bits · licencia OEM digital", "—", 1, 149990),
      item("srv", "Armado, pruebas y configuración", "Ensamblaje y ordenado de cables · actualización de BIOS · drivers · test de estrés 24 h", "90 días", 1, 45000)
    ];
  }

  const DEFAULT_TERMS = [
    "Precios expresados en pesos chilenos, netos más IVA.",
    "Presupuesto sujeto a disponibilidad de stock al momento de la orden de compra.",
    "Para iniciar el armado se requiere un abono del 50 % del total.",
    "La garantía cubre defectos de fabricación; no cubre daños por mal uso, golpes, humedad o variaciones de voltaje.",
    "Los equipos no retirados dentro de 30 días desde el aviso de entrega podrán generar cargo por bodegaje."
  ].join("\n");

  function defaultBrand() {
    return {
      company: {
        name: "Fidelya SpA", rut: "", giro: "Venta y servicio técnico de computadores",
        address: "", city: "El Bosque, Santiago", phone: "", email: "", web: "fidelya.cl",
        logo: "", logoHeight: 56, accent: "#1f3f8f"
      },
      bank: { bank: "", type: "Cuenta corriente", number: "", rut: "", holder: "Fidelya SpA", email: "" },
      terms: DEFAULT_TERMS,
      options: { footer: "Gracias por su preferencia." }
    };
  }

  function newQuote(withSample) {
    let brand = defaultBrand();
    try { const b = JSON.parse(safeGet(STORE_BRAND) || "null"); if (b) brand = deepMerge(brand, b); } catch (e) {}
    return {
      company: brand.company,
      bank: brand.bank,
      terms: brand.terms,
      client: withSample
        ? { name: "Estudio Andes Visual Ltda.", rut: "77.845.210-3", contact: "Camila Rojas", email: "camila.rojas@ejemplo.cl", phone: "+56 9 5555 1234", address: "Av. Providencia 1234, of. 502", city: "Providencia, Santiago" }
        : { name: "", rut: "", contact: "", email: "", phone: "", address: "", city: "" },
      quote: {
        number: nextNumber(true), date: today(), validDays: 10, seller: "",
        reference: withSample ? "Estación de trabajo para diseño y render 3D" : "",
        currency: "CLP", ivaRate: 19, applyIva: true, globalDiscount: 0,
        payment: "Transferencia · 50 % anticipo, saldo contra entrega",
        delivery: "3 a 5 días hábiles", warranty: "Según fabricante por componente"
      },
      items: withSample ? sampleItems() : [],
      notes: withSample ? "Configuración propuesta pensada para Blender, Adobe Creative Cloud y renderizado por GPU. Ampliable a 64 GB de RAM y un segundo SSD." : "",
      options: Object.assign({ showTechSummary: true, showBank: true, showSignature: true, showWords: true }, brand.options),
      isSample: !!withSample
    };
  }

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== "object") return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k of Object.keys(extra)) {
      if (base && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k]) && typeof extra[k] === "object" && extra[k] !== null) {
        out[k] = deepMerge(base[k], extra[k]);
      } else out[k] = extra[k];
    }
    return out;
  }

  let state;
  try { state = JSON.parse(safeGet(STORE_DRAFT) || "null"); } catch (e) { state = null; }
  state = state ? deepMerge(newQuote(false), state) : newQuote(true);

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getPath = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, p, v) => { const ks = p.split("."); const last = ks.pop(); ks.reduce((a, k) => (a[k] = a[k] || {}), o)[last] = v; };
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; };

  function decimals() { return state.quote.currency === "CLP" ? 0 : 2; }
  function money(n) {
    const d = decimals();
    const s = new Intl.NumberFormat("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
    if (state.quote.currency === "USD") return "US$ " + s;
    if (state.quote.currency === "UF") return "UF " + s;
    return "$ " + s;
  }
  function round(n) { const f = Math.pow(10, decimals()); return Math.round(n * f) / f; }
  function fmtDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  }
  function addDays(iso, days) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d + (parseInt(days, 10) || 0));
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  function lineTotal(it) { return round(num(it.qty) * num(it.price) * (1 - num(it.disc) / 100)); }
  function totals() {
    const gross = state.items.reduce((s, it) => s + round(num(it.qty) * num(it.price)), 0);
    const sub = state.items.reduce((s, it) => s + lineTotal(it), 0);
    const lineDisc = gross - sub;
    const gd = round(sub * num(state.quote.globalDiscount) / 100);
    const net = sub - gd;
    const iva = state.quote.applyIva ? round(net * num(state.quote.ivaRate) / 100) : 0;
    return { gross, lineDisc, sub, gd, net, iva, total: net + iva };
  }

  /* Número en palabras (español) */
  function words(n) {
    n = Math.floor(Math.abs(n));
    if (n === 0) return "cero";
    const U = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
    const D = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const C = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
    const under100 = (x) => x < 30 ? U[x] : D[Math.floor(x / 10)] + (x % 10 ? " y " + U[x % 10] : "");
    const under1000 = (x) => {
      if (x === 100) return "cien";
      const c = Math.floor(x / 100), r = x % 100;
      return [C[c], r ? under100(r) : ""].filter(Boolean).join(" ");
    };
    const apocope = (s) => s.replace(/uno$/, "un").replace(/veintiún$/, "veintiún");
    const thousands = (x) => {
      if (x < 1000) return under1000(x);
      const k = Math.floor(x / 1000), r = x % 1000;
      const head = k === 1 ? "mil" : apocope(under1000(k)).replace(/veintiun$/, "veintiún") + " mil";
      return head + (r ? " " + under1000(r) : "");
    };
    const parts = [];
    const millions = Math.floor(n / 1e6), rest = n % 1e6;
    if (millions) {
      if (millions === 1) parts.push("un millón");
      else parts.push(apocope(thousands(millions)).replace(/veintiun$/, "veintiún") + " millones");
    }
    if (rest) parts.push(thousands(rest));
    let out = parts.join(" ");
    return out;
  }
  function amountInWords(total) {
    const cur = state.quote.currency;
    const whole = Math.floor(total);
    let w = words(whole);
    const endsMillion = /(millón|millones)$/.test(w);
    w = w.replace(/uno$/, "un").replace(/veintiun$/, "veintiún");
    if (cur === "CLP") return `Son: ${w}${endsMillion ? " de" : ""} pesos.`;
    const cents = Math.round((total - whole) * 100);
    const unit = cur === "USD" ? "dólares" : "UF";
    return `Son: ${w}${endsMillion && cur === "USD" ? " de" : ""} ${unit}${cents ? ` con ${String(cents).padStart(2, "0")}/100` : ""}.`;
  }

  /* ---------- Render de la hoja ---------- */
  function contrastInk(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return "#fff";
    const v = parseInt(m[1], 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L > 0.62 ? "#111" : "#fff";
  }

  function render() {
    const s = state, c = s.company, cl = s.client, q = s.quote, t = totals();
    document.documentElement.style.setProperty("--brand", c.accent || "#1f3f8f");
    document.documentElement.style.setProperty("--brand-ink", contrastInk(c.accent));

    const compMeta = [
      [c.rut && `RUT ${c.rut}`, c.giro].filter(Boolean).join(" · "),
      [c.address, c.city].filter(Boolean).join(", "),
      [c.phone, c.email, c.web].filter(Boolean).join(" · ")
    ].filter(Boolean).map(esc).join("<br>");

    const kv = (pairs) => pairs.filter((p) => p[1]).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");

    const rows = s.items.length ? s.items.map((it, i) => `
      <tr>
        <td class="idx">${String(i + 1).padStart(2, "0")}</td>
        <td>
          <span class="s-cat">${esc(CAT[it.cat] || "Otro")}</span>
          <span class="s-desc">${esc(it.desc) || "<span style='color:var(--paper-muted)'>Sin descripción</span>"}</span>
          ${it.specs ? `<span class="s-specs">${esc(it.specs)}</span>` : ""}
        </td>
        <td class="c">${esc(it.warranty || "—")}</td>
        <td class="c num">${esc(num(it.qty))}</td>
        <td class="r num">${money(num(it.price))}${num(it.disc) ? `<br><span class="s-disc">−${esc(num(it.disc))} %</span>` : ""}</td>
        <td class="r num"><strong>${money(lineTotal(it))}</strong></td>
      </tr>`).join("")
      : `<tr><td colspan="6" class="s-empty">Agrega componentes desde el panel “Componentes y servicios”.</td></tr>`;

    const tech = s.options.showTechSummary
      ? TECH_CATS.map((k) => {
          const its = s.items.filter((it) => it.cat === k && it.desc);
          return its.length ? `<dt>${esc(CAT[k])}</dt><dd>${its.map((it) => esc((num(it.qty) > 1 ? num(it.qty) + "× " : "") + it.desc)).join("<br>")}</dd>` : "";
        }).join("")
      : "";

    const terms = (s.terms || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const b = s.bank;
    const showBank = s.options.showBank && (b.bank || b.number);

    const totalsHtml = `
      <div class="s-totals">
        ${t.lineDisc ? `<div class="line"><span>Total bruto</span><span class="num">${money(t.gross)}</span></div>
        <div class="line"><span>Descuentos por ítem</span><span class="num">− ${money(t.lineDisc)}</span></div>` : ""}
        <div class="line"><span>Subtotal</span><span class="num">${money(t.sub)}</span></div>
        ${t.gd ? `<div class="line"><span>Descuento ${esc(num(q.globalDiscount))} %</span><span class="num">− ${money(t.gd)}</span></div>
        <div class="line"><span>Neto</span><span class="num">${money(t.net)}</span></div>` : ""}
        ${q.applyIva ? `<div class="line"><span>IVA ${esc(num(q.ivaRate))} %</span><span class="num">${money(t.iva)}</span></div>` : ""}
        <div class="grand"><span>Total</span><span class="num">${money(t.total)}</span></div>
        ${s.options.showWords && t.total > 0 ? `<div class="s-words">${esc(amountInWords(t.total))}</div>` : ""}
      </div>`;

    $("#sheet").innerHTML = `
      <header class="s-head">
        <div class="s-company">
          ${c.logo ? `<img class="s-logo" src="${esc(c.logo)}" alt="${esc(c.name)}" style="height:${num(c.logoHeight) || 56}px">` : ""}
          <div>
            <div class="s-company__name">${esc(c.name || "Tu empresa")}</div>
            <div class="s-company__meta">${compMeta}</div>
          </div>
        </div>
        <div class="s-doc">
          <div class="s-doc__type">Presupuesto</div>
          <div class="s-doc__no">N° ${esc(q.number)}</div>
          <dl class="s-doc__dates">
            <dt>Emisión</dt><dd>${esc(fmtDate(q.date))}</dd>
            <dt>Válido hasta</dt><dd>${esc(fmtDate(addDays(q.date, q.validDays)))}</dd>
          </dl>
        </div>
      </header>
      <hr class="s-rule">

      <section class="s-parties">
        <div class="s-client">
          <p class="label">Cliente</p>
          <div class="s-client__name">${esc(cl.name || "Nombre del cliente")}</div>
          <dl class="kv">${kv([["RUT", cl.rut], ["Contacto", cl.contact], ["Email", cl.email], ["Teléfono", cl.phone], ["Dirección", [cl.address, cl.city].filter(Boolean).join(", ")]])}</dl>
        </div>
        <div class="s-meta">
          <p class="label">Condiciones</p>
          <dl class="kv">${kv([["Forma de pago", q.payment], ["Entrega", q.delivery], ["Garantía", q.warranty], ["Ejecutivo", q.seller], ["Validez", q.validDays ? `${q.validDays} días` : ""]])}</dl>
        </div>
      </section>

      ${q.reference ? `<section class="s-ref"><p class="label">Proyecto</p>${esc(q.reference)}</section>` : ""}

      <table class="s-table">
        <thead><tr>
          <th></th><th>Componente / descripción</th><th class="c">Garantía</th><th class="c">Cant.</th><th class="r">P. unitario</th><th class="r">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <section class="s-bottom">
        <div>
          ${tech ? `<div class="s-tech"><p class="label">Ficha técnica del equipo</p><dl>${tech}</dl></div>` : ""}
          ${s.notes ? `<div class="s-notes"><p class="label">Observaciones</p>${esc(s.notes)}</div>` : ""}
        </div>
        ${totalsHtml}
      </section>

      ${terms.length || showBank ? `
      <section class="s-terms ${terms.length && showBank ? "" : "s-terms--single"}">
        ${terms.length ? `<div><p class="label">Condiciones comerciales</p><ol>${terms.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></div>` : ""}
        ${showBank ? `<div class="s-bank"><p class="label">Datos para transferencia</p><dl class="kv">${kv([["Titular", b.holder], ["RUT", b.rut], ["Banco", b.bank], ["Tipo", b.type], ["N° cuenta", b.number], ["Email", b.email]])}</dl></div>` : ""}
      </section>` : ""}

      ${s.options.showSignature ? `
      <section class="s-sign">
        <div><strong>${esc(c.name || "Empresa")}</strong><span>${esc(q.seller || "Firma y timbre")}</span></div>
        <div><strong>Aceptación del cliente</strong><span>Nombre, RUT, firma y fecha</span></div>
      </section>` : ""}

      <footer class="s-foot">
        <span>${esc(s.options.footer || "")}</span>
        <span class="mono">${esc(q.number)} · ${esc([c.web, c.email].filter(Boolean).join(" · "))}</span>
      </footer>`;

    document.title = `${q.number}${cl.name ? " · " + cl.name : ""} — Presupuestos Técnicos`;
    $("#itemCount").textContent = state.items.length ? `${state.items.length} líneas · ${money(t.total)}` : "";
    state.items.forEach((it) => { const el = document.querySelector(`[data-total="${it.id}"]`); if (el) el.textContent = money(lineTotal(it)); });
  }

  /* ---------- Editor: campos simples ---------- */
  function fillForm() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const v = getPath(state, el.dataset.bind);
      if (el.type === "checkbox") el.checked = !!v;
      else el.value = v == null ? "" : v;
    });
    paintLogo();
    paintSwatches();
    renderItemsEditor();
  }

  $("#editor").addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.bind) {
      let v = el.type === "checkbox" ? el.checked : el.value;
      if (el.dataset.type === "number") v = num(v);
      if (el.id === "logoHeight") v = num(v);
      setPath(state, el.dataset.bind, v);
      if (el.dataset.bind === "company.accent") paintSwatches();
      changed();
    }
  });
  $("#editor").addEventListener("change", (e) => { if (e.target.type === "checkbox" && e.target.dataset.bind) { setPath(state, e.target.dataset.bind, e.target.checked); changed(); } });

  /* ---------- Editor: ítems ---------- */
  const catOptions = (sel) => CATS.map(([k, l]) => `<option value="${k}"${k === sel ? " selected" : ""}>${esc(l)}</option>`).join("");

  function renderItemsEditor() {
    $("#itemsEditor").innerHTML = state.items.map((it) => `
      <li class="item" data-id="${it.id}">
        <div class="item__head">
          <select data-f="cat" aria-label="Categoría">${catOptions(it.cat)}</select>
          <button type="button" class="iconbtn" data-act="up" title="Subir" aria-label="Subir">↑</button>
          <button type="button" class="iconbtn" data-act="down" title="Bajar" aria-label="Bajar">↓</button>
          <button type="button" class="iconbtn" data-act="dup" title="Duplicar" aria-label="Duplicar">⧉</button>
          <button type="button" class="iconbtn iconbtn--danger" data-act="del" title="Eliminar" aria-label="Eliminar">×</button>
        </div>
        <label class="field">Marca y modelo<input id="it_${it.id}_desc" data-f="desc" value="${esc(it.desc)}"></label>
        <label class="field">Especificaciones<textarea id="it_${it.id}_specs" data-f="specs" rows="2">${esc(it.specs)}</textarea></label>
        <div class="grid4">
          <label class="field">Garantía<input id="it_${it.id}_war" data-f="warranty" value="${esc(it.warranty)}"></label>
          <label class="field">Cant.<input id="it_${it.id}_qty" data-f="qty" type="number" min="0" step="1" value="${esc(it.qty)}"></label>
          <label class="field">P. unitario<input id="it_${it.id}_price" data-f="price" type="number" min="0" step="any" value="${esc(it.price)}"></label>
          <label class="field">Desc. %<input id="it_${it.id}_disc" data-f="disc" type="number" min="0" max="100" step="0.5" value="${esc(it.disc)}"></label>
        </div>
        <div class="item__total" data-total="${it.id}"></div>
      </li>`).join("");
  }

  const itemsEl = $("#itemsEditor");
  itemsEl.addEventListener("input", (e) => {
    const li = e.target.closest(".item"); const f = e.target.dataset.f; if (!li || !f) return;
    const it = state.items.find((x) => x.id === li.dataset.id); if (!it) return;
    it[f] = ["qty", "price", "disc"].includes(f) ? num(e.target.value) : e.target.value;
    changed();
  });
  itemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]"); if (!btn) return;
    const id = btn.closest(".item").dataset.id;
    const i = state.items.findIndex((x) => x.id === id);
    const act = btn.dataset.act;
    if (act === "del") state.items.splice(i, 1);
    if (act === "dup") state.items.splice(i + 1, 0, Object.assign({}, state.items[i], { id: uid() }));
    if (act === "up" && i > 0) [state.items[i - 1], state.items[i]] = [state.items[i], state.items[i - 1]];
    if (act === "down" && i < state.items.length - 1) [state.items[i + 1], state.items[i]] = [state.items[i], state.items[i + 1]];
    renderItemsEditor(); changed();
  });

  const QUICK = [
    ["cpu", "Procesador", "36 meses"], ["mb", "Placa madre", "36 meses"], ["ram", "RAM", "Vitalicia"], ["ssd", "SSD / disco", "36 meses"],
    ["gpu", "Video", "36 meses"], ["psu", "Fuente", "36 meses"], ["case", "Gabinete", "12 meses"], ["cool", "Refrigeración", "12 meses"],
    ["os", "Sistema operativo", "—"], ["mon", "Monitor", "12 meses"], ["per", "Periféricos", "12 meses"], ["srv", "Servicio", "90 días"]
  ];
  $("#quickAdd").innerHTML = QUICK.map(([k, l]) => `<button type="button" class="chip" data-cat="${k}">${esc(l)}</button>`).join("");
  $("#quickAdd").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    const q = QUICK.find((x) => x[0] === b.dataset.cat);
    addItem(item(q[0], "", "", q[2], 1, 0));
  });
  $("#btnAddItem").addEventListener("click", () => addItem(item("otro", "", "", "12 meses", 1, 0)));

  function addItem(it) {
    state.items.push(it); renderItemsEditor(); changed();
    const el = document.getElementById(`it_${it.id}_desc`); if (el) { el.focus(); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }

  /* ---------- Logo ---------- */
  function paintLogo() {
    const img = $("#logoPreview");
    img.hidden = !state.company.logo; $("#logoEmpty").hidden = !!state.company.logo;
    if (state.company.logo) img.src = state.company.logo; else img.removeAttribute("src");
  }
  function loadLogo(file) {
    if (!file || !/^image\//.test(file.type)) return toast("El archivo no es una imagen. Usa PNG, JPG o SVG.");
    if (file.size > 2.5 * 1024 * 1024) return toast("El logo pesa más de 2,5 MB. Usa una versión más liviana.");
    const r = new FileReader();
    r.onload = () => { state.company.logo = r.result; paintLogo(); changed(); toast("Logo actualizado"); };
    r.readAsDataURL(file);
  }
  $("#logoFile").addEventListener("change", (e) => { loadLogo(e.target.files[0]); e.target.value = ""; });
  const drop = $("#logoDrop");
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); loadLogo(e.dataTransfer.files[0]); });
  $("#logoRemove").addEventListener("click", () => { state.company.logo = ""; paintLogo(); changed(); });

  function paintSwatches() {
    $("#swatches").innerHTML = SWATCHES.map((c) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Color ${c}" aria-pressed="${c.toLowerCase() === String(state.company.accent).toLowerCase()}"></button>`).join("");
  }
  $("#swatches").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    state.company.accent = b.dataset.c; $("#c_accent").value = b.dataset.c; paintSwatches(); changed();
  });

  /* ---------- Persistencia ---------- */
  let saveTimer;
  function changed() {
    render();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 300);
  }
  function persist() {
    const ok = safeSet(STORE_DRAFT, JSON.stringify(state));
    // Los datos de tu empresa se recuerdan para los próximos presupuestos
    safeSet(STORE_BRAND, JSON.stringify({ company: state.company, bank: state.bank, terms: state.terms, options: { footer: state.options.footer } }));
    $("#saveStatus").textContent = ok ? "Borrador guardado en este navegador" : "No se pudo guardar: el navegador bloquea el almacenamiento";
  }

  function getSaved() { try { return JSON.parse(safeGet(STORE_SAVED) || "{}"); } catch (e) { return {}; } }

  $("#btnSave").addEventListener("click", () => {
    const all = getSaved();
    const key = state.quote.number || nextNumber(true);
    all[key] = { savedAt: new Date().toISOString(), data: state };
    if (!safeSet(STORE_SAVED, JSON.stringify(all))) return toast("No hay espacio en el navegador. Exporta y elimina presupuestos antiguos.");
    // Consumir el correlativo si este número es el siguiente
    if (key === nextNumber(true)) nextNumber(false);
    toast(`Guardado ${key}`);
  });

  $("#btnNew").addEventListener("click", () => {
    persist();
    state = newQuote(false);
    fillForm(); changed();
    toast(`Nuevo presupuesto ${state.quote.number}`);
  });

  const dlg = $("#listDialog");
  function renderSaved() {
    const all = getSaved();
    const keys = Object.keys(all).sort((a, b) => (all[b].savedAt || "").localeCompare(all[a].savedAt || ""));
    $("#savedList").innerHTML = keys.length ? keys.map((k) => {
      const d = all[k].data; const prev = state; state = d; const tot = money(totals().total); state = prev;
      return `<div class="saved__row">
        <div><div class="saved__title">${esc(d.client && d.client.name || "Sin cliente")}</div>
        <div class="saved__meta">${esc(k)} · ${esc(fmtDate(d.quote && d.quote.date))} · ${esc(tot)}</div></div>
        <div class="saved__actions">
          <button type="button" class="btn btn--small" data-open="${esc(k)}">Abrir</button>
          <button type="button" class="btn btn--small btn--ghost" data-copy="${esc(k)}">Duplicar</button>
          <button type="button" class="btn btn--small btn--ghost btn--danger" data-del="${esc(k)}">Eliminar</button>
        </div></div>`;
    }).join("") : `<div class="saved__empty">Aún no guardas presupuestos. Usa <b>Guardar</b> para archivar el actual.</div>`;
  }
  $("#btnList").addEventListener("click", () => { renderSaved(); dlg.showModal(); });
  $("#savedList").addEventListener("click", (e) => {
    const all = getSaved(); const t = e.target;
    if (t.dataset.open) { state = deepMerge(newQuote(false), all[t.dataset.open].data); fillForm(); changed(); dlg.close(); toast(`Abierto ${t.dataset.open}`); }
    if (t.dataset.copy) {
      state = deepMerge(newQuote(false), JSON.parse(JSON.stringify(all[t.dataset.copy].data)));
      state.quote.number = nextNumber(true); state.quote.date = today();
      state.items.forEach((it) => (it.id = uid()));
      fillForm(); changed(); dlg.close(); toast(`Copia creada como ${state.quote.number}`);
    }
    if (t.dataset.del) {
      if (t.dataset.confirm !== "1") { t.dataset.confirm = "1"; t.textContent = "¿Confirmar?"; return; }
      delete all[t.dataset.del]; safeSet(STORE_SAVED, JSON.stringify(all)); renderSaved();
    }
  });

  $("#btnExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ app: "presupuestos-tecnicos", version: 1, quote: state, saved: getSaved() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${state.quote.number || "presupuesto"}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#importFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (j.saved) safeSet(STORE_SAVED, JSON.stringify(Object.assign(getSaved(), j.saved)));
        state = deepMerge(newQuote(false), j.quote || j);
        fillForm(); changed(); toast("Presupuesto importado");
      } catch (err) { toast("El archivo no es un respaldo válido de Presupuestos Técnicos."); }
    };
    r.readAsText(f); e.target.value = "";
  });

  $("#btnPrint").addEventListener("click", () => { persist(); window.print(); });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  fillForm();
  render();
})();
