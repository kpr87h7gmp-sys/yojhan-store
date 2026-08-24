(function () {
  const BRAND = "YOJHAN-STORE";
  const DEFAULT_WHATSAPP = "18493753965";
  const DEFAULT_WHATSAPP_URL = `https://wa.me/${DEFAULT_WHATSAPP}`;
  const catalog = document.body.dataset.catalog || "panels";
  const sessionId = localStorage.getItem("sxnsiSessionId")
    || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  localStorage.setItem("sxnsiSessionId", sessionId);

  let whatsappGroup = DEFAULT_WHATSAPP_URL;
  let whatsappNumber = DEFAULT_WHATSAPP;
  const state = { products: [] };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function formatMoney(value) {
    const amount = Number(value || 0);
    return `${amount % 1 ? amount.toFixed(2) : amount.toFixed(0)} USD`;
  }

  function priceFromText(value) {
    const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
    return match ? Number(match[1].replace(",", ".")) : 0;
  }

  function initials(name) {
    return String(name || BRAND)
      .split(/\s|-/)
      .map((part) => part.replace(/[^a-z0-9]/gi, ""))
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function showToast(message) {
    const toast = $("#toastMsg");
    const toastText = $("#toastText");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "No se pudo completar la acción.");
      error.data = data;
      throw error;
    }
    return data;
  }

  function postJson(url, body) {
    return requestJson(url, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  function visualMeta(product) {
    const category = String(product.category || "").toLowerCase();
    if (category.includes("iphone") || category.includes("ios")) {
      return { icon: "fa-mobile-screen-button", label: "iPhone", className: "ios" };
    }
    if (category.includes("android")) {
      return { icon: "fa-robot", label: "Android", className: "android" };
    }
    return { icon: "fa-desktop", label: "PC", className: "pc" };
  }

  function optionMarkup(options = []) {
    if (!options.length) return "";
    const first = options[0] || {};
    return `<div class="product-option"><label>Opción</label><select class="purchase-option">${
      options.map((option) => {
        const label = option.label || "";
        const price = option.price || "";
        return `<option value="${escapeHtml(label)}" data-price="${escapeHtml(price)}">${escapeHtml(label)}${price ? ` - ${escapeHtml(price)}` : ""}</option>`;
      }).join("")
    }</select><div class="option-summary" data-option-summary><span>${escapeHtml(first.label || "Opción")}</span><strong>${escapeHtml(first.price || "")}</strong></div></div>`;
  }

  function updateOptionSummary(select) {
    const summary = select?.closest(".product-option")?.querySelector("[data-option-summary]");
    const selected = select?.selectedOptions?.[0];
    if (!summary || !selected) return;
    summary.innerHTML = `<span>${escapeHtml(selected.value || selected.textContent)}</span><strong>${escapeHtml(selected.dataset.price || "")}</strong>`;
  }

  function productCard(product) {
    const options = Array.isArray(product.options) ? product.options : [];
    const visual = visualMeta(product);
    const oldPrice = product.oldPrice ? `<s>${formatMoney(product.oldPrice)}</s>` : "";
    const priceLabel = options.length ? `Desde ${formatMoney(product.price)}` : `${oldPrice} ${formatMoney(product.price)}`.trim();
    const badge = product.badge || visual.label;
    const imageUrl = String(product.imageUrl || "").trim();
    const visualBlock = imageUrl
      ? `<div class="product-img-wrapper"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}"><span class="product-badge">${escapeHtml(badge)}</span></div>`
      : `<div class="product-img-wrapper product-visual ${visual.className}">
          <span class="product-badge">${escapeHtml(badge)}</span>
          <span class="visual-ring"></span>
          <i class="fas ${visual.icon}" aria-hidden="true"></i>
          <strong>${escapeHtml(initials(product.name))}</strong>
          <span>${escapeHtml(visual.label)}</span>
        </div>`;
    return `
      <article class="product-card ${visual.className}" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}" data-product-price="${formatMoney(product.price)}">
        ${visualBlock}
        <div class="product-content">
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>
          ${optionMarkup(options)}
          <div class="product-footer">
            <span class="product-price">${priceLabel}</span>
            <button class="btn-card comprar-ahora" type="button"><i class="fab fa-whatsapp"></i> Comprar</button>
          </div>
        </div>
      </article>`;
  }

  function selectedPurchase(card) {
    const selected = $(".purchase-option", card)?.selectedOptions?.[0];
    if (!selected) {
      const priceText = card.dataset.productPrice || "";
      return { label: "", priceText, amount: priceFromText(priceText) };
    }
    const priceText = selected.dataset.price || "";
    const label = selected.value || selected.textContent.replace(priceText ? ` - ${priceText}` : "", "").trim();
    return { label, priceText, amount: priceFromText(priceText) };
  }

  function buildPurchaseMessage(card) {
    const productName = card.dataset.productName || $(".product-title", card)?.textContent?.trim() || "Producto";
    const purchase = selectedPurchase(card);
    const optionText = purchase.label
      ? `${purchase.label}${purchase.priceText ? ` - ${purchase.priceText}` : ""}`
      : "Sin opción seleccionada";
    const pageName = "página de Free Fire";
    return {
      productName,
      purchase,
      message: [
        `Hola ${BRAND}, vengo de la ${pageName}.`,
        "Quiero comprar este producto:",
        `Producto: ${productName}`,
        `Opción: ${optionText}`,
        purchase.priceText ? `Precio: ${purchase.priceText}` : "",
        "",
        "Me ayudas para completar mi compra?"
      ].filter(Boolean).join("\n")
    };
  }

  function openExternal(url, toastMessage = "Abriendo WhatsApp...") {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
      try { popup.opener = null; } catch {}
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    showToast(toastMessage);
  }

  function openWhatsapp(message, toastMessage = "Abriendo WhatsApp...") {
    openExternal(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, toastMessage);
  }

  async function buyProduct(card) {
    if (!card) return;
    const productId = Number(card.dataset.productId || 0) || null;
    const { message, productName, purchase } = buildPurchaseMessage(card);
    openWhatsapp(message, "Abriendo WhatsApp para comprar...");
    postJson("/api/sales/lead", {
      sessionId,
      productId,
      selectedOption: purchase.label,
      selectedPrice: purchase.priceText
    }).catch(() => {});
    postJson("/api/track/buy-click", {
      sessionId,
      productId,
      productName
    }).catch(() => {});
  }

  async function loadProducts() {
    const grid = $("#productsGrid");
    if (!grid) return;
    try {
      const products = await requestJson(`/api/products?section=${encodeURIComponent(catalog)}`);
      state.products = products;
      grid.innerHTML = products.length
        ? products.map(productCard).join("")
        : `<p class="empty-products">No hay productos disponibles ahora mismo.</p>`;
    } catch {
      if (!grid.children.length) {
        grid.innerHTML = `<p class="empty-products">Abre esta página desde el servidor para cargar productos.</p>`;
      }
    }
  }

  function openWhatsappGroup(source) {
    openExternal(whatsappGroup, "Abriendo WhatsApp...");
    postJson("/api/track/whatsapp-click", { sessionId, source }).catch(() => {});
  }

  function bindUi() {
    $("#productsGrid")?.addEventListener("click", (event) => {
      const button = event.target.closest(".comprar-ahora");
      if (!button) return;
      event.preventDefault();
      buyProduct(button.closest(".product-card"));
    });

    $("#productsGrid")?.addEventListener("change", (event) => {
      const select = event.target.closest(".purchase-option");
      if (select) updateOptionSummary(select);
    });

    $$(".whatsapp-tracked").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openWhatsappGroup(link.dataset.source || "pagina-principal");
      });
    });

    $$(".faq-question").forEach((button) => {
      button.addEventListener("click", () => button.closest(".faq-item")?.classList.toggle("active"));
    });
  }

  fetch("/api/settings")
    .then((response) => (response.ok ? response.json() : null))
    .then((settings) => {
      if (settings?.whatsappGroup) whatsappGroup = settings.whatsappGroup;
      if (settings?.whatsappNumber) whatsappNumber = settings.whatsappNumber;
    })
    .catch(() => {});

  postJson("/api/track/pageview", { sessionId }).catch(() => {});
  setInterval(() => postJson("/api/track/heartbeat", { sessionId }).catch(() => {}), 15000);

  if (window.EventSource) {
    const events = new EventSource("/api/events");
    events.addEventListener("products-updated", loadProducts);
  }

  bindUi();
  loadProducts();
}());
