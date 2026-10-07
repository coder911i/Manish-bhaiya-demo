(() => {
  "use strict";

  const titles = {
    overview: "Overview",
    consultants: "Consultants",
    products: "Products",
    bookings: "Bookings",
    orders: "Orders",
    offers: "Offers",
    content: "Website CMS"
  };

  const $ = (s) => document.querySelector(s);
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  function showAdminLogin() {
    if ($("#adminLogin")) return;
    const d = document.createElement("div");
    d.id = "adminLogin";
    d.innerHTML = [
      '<div class="admin-login-card">',
      '<div class="login-brand">ASTROLOGICAL <b>SOLUTIONS</b></div>',
      "<small>DEMO ADMIN ACCESS · ANY NON-EMPTY LOGIN WORKS</small>",
      "<h1>Welcome back.</h1>",
      '<input id="loginEmail" type="email" placeholder="Admin email" autocomplete="username">',
      '<input id="loginPassword" type="password" placeholder="Password" autocomplete="current-password">',
      '<button id="loginBtn">Enter Demo Control Center</button>',
      '<p id="loginError"></p>',
      "</div>"
    ].join("");
    document.body.appendChild(d);

    $("#loginBtn").onclick = async () => {
      const button = $("#loginBtn");
      button.disabled = true;
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: $("#loginEmail").value.trim(),
            password: $("#loginPassword").value
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login failed");
        d.remove();
        await loadStats();
      } catch (error) {
        $("#loginError").textContent = error.message;
        button.disabled = false;
      }
    };
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || "Invalid server response" }; }
    if (response.status === 401) {
      showAdminLogin();
      throw new Error("Please sign in to continue");
    }
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  function go(id) {
    document.querySelector('[data-tab="' + id + '"]')?.click();
  }

  async function loadStats() {
    try {
      const x = await api("/api/admin/stats");
      $("#mRevenue").textContent = "₹" + Number(x.revenue || 0).toLocaleString("en-IN");
      $("#mConsult").textContent = x.consultations || 0;
      $("#mPrepaid").textContent = (x.prepaidRate || 0) + "%";
      $("#mConversion").textContent = (x.conversion || 0) + "%";
    } catch (e) { if (!$("#adminLogin")) toast(e.message); }
  }

  async function loadConsultants() {
    const list = await api("/api/admin/consultants");
    $("#consultantList").innerHTML = list.map(x => [
      '<div class="consultant"><div class="avatar">',
      esc(x.name.split(" ").map(v => v[0]).join("")),
      '</div><div><h3>', esc(x.name), "</h3><p>", esc(x.type), " · ", esc(x.experience),
      '</p><small>★ ', x.rating, " · ₹", x.price, ' / 30 min</small></div>',
      '<span class="pill">', x.available ? "ACTIVE" : "OFF", "</span>",
      '<button data-edit-consultant="', x.id, '">Edit</button>',
      '<button class="danger" data-delete="consultants" data-id="', x.id, '">Delete</button></div>'
    ].join("")).join("") || '<div class="panel">No consultants yet.</div>';
  }

  async function loadProducts() {
    const list = await api("/api/admin/products");
    $("#productList").innerHTML = list.map(x => [
      '<div class="product-row"><div class="product-icon">◇</div><div><h3>',
      esc(x.name), '</h3><small>', esc(x.category), " · Stock: ", x.stock,
      '</small></div><b>₹', x.price, '</b><button data-edit-product="', x.id,
      '">Edit</button><button class="danger" data-delete="products" data-id="', x.id,
      '">Delete</button></div>'
    ].join("")).join("") || '<div class="panel">No products yet.</div>';
  }

  async function loadBookings() {
    const list = await api("/api/admin/bookings");
    $("#bookingRows").innerHTML = list.map(x => [
      "<tr><td>", esc(x.id), "</td><td>", esc(x.customerName), "<br><small>",
      esc(x.customerPhone), "</small></td><td>", esc(x.concern), "</td><td>",
      esc(x.consultantId), "</td><td>", esc(x.slot), "</td><td>₹", x.amount,
      '</td><td><select data-status-type="bookings" data-id="', x.id, '">',
      ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"].map(s =>
        '<option value="' + s + '"' + (x.status === s ? " selected" : "") + ">" + s + "</option>"
      ).join(""),
      "</select></td></tr>"
    ].join("")).join("") || '<tr><td colspan="7">No bookings yet.</td></tr>';
  }

  async function loadOrders() {
    const list = await api("/api/admin/orders");
    $("#orderRows").innerHTML = list.map(x => [
      "<tr><td>", esc(x.id), "</td><td>", esc(x.customerName), "</td><td>",
      esc(x.fulfillment), "</td><td>₹", x.total, "</td><td>", esc(x.status),
      '</td><td><select data-status-type="orders" data-id="', x.id, '">',
      ["PAYMENT_PENDING", "CONFIRMATION_PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "RTO", "CANCELLED"].map(s =>
        '<option value="' + s + '"' + (x.status === s ? " selected" : "") + ">" + s + "</option>"
      ).join(""),
      "</select></td></tr>"
    ].join("")).join("") || '<tr><td colspan="6">No orders yet.</td></tr>';
  }

  async function loadOffers() {
    const list = await api("/api/admin/offers");
    $("#offerList").innerHTML = list.map(x => [
      '<div class="offer"><b>', esc(x.code), "</b><span>", esc(x.title),
      '</span><em>', x.active ? "ACTIVE" : "PAUSED",
      '</em><button data-edit-offer="', x.id,
      '">Edit</button><button class="danger" data-delete="offers" data-id="', x.id,
      '">Delete</button></div>'
    ].join("")).join("") || '<div class="panel">No offers yet.</div>';
  }

  async function loadContent() {
    const x = await api("/api/admin/content");
    ["heroTitle", "heroSubtitle", "announcement", "seoTitle", "seoDescription"]
      .forEach(k => { if ($("#" + k)) $("#" + k).value = x[k] || ""; });
  }

  async function loadTab(id) {
    try {
      if (id === "overview") await loadStats();
      if (id === "consultants") await loadConsultants();
      if (id === "products") await loadProducts();
      if (id === "bookings") await loadBookings();
      if (id === "orders") await loadOrders();
      if (id === "offers") await loadOffers();
      if (id === "content") await loadContent();
    } catch (e) { toast(e.message); }
  }

  function closeModal() { $("#adminModal").innerHTML = ""; }

  function editor(title, values, save) {
    const fields = Object.entries(values)
      .filter(([key]) => !["id", "slug"].includes(key))
      .map(([key, value]) => '<label>' + esc(key) + '<input data-k="' + esc(key) + '" value="' + esc(value) + '"></label>')
      .join("");
    $("#adminModal").innerHTML = '<div class="modal"><div class="editor"><button class="modal-x" id="modalClose">×</button><small>CMS EDITOR</small><h2>' +
      esc(title) + '</h2><div class="editor-fields">' + fields +
      '</div><button class="primary" id="saveBtn">Save changes</button></div></div>';
    $("#modalClose").onclick = closeModal;
    $("#saveBtn").onclick = async () => {
      const value = {};
      document.querySelectorAll("#adminModal [data-k]").forEach(input => { value[input.dataset.k] = input.value; });
      try { await save(value); } catch (e) { toast(e.message); }
    };
  }

  async function editConsultant(id) {
    let value = { name: "", type: "Vedic Astrologer", experience: "", price: 899, rating: 5, available: true, bio: "" };
    if (id) value = (await api("/api/admin/consultants")).find(x => x.id === id) || value;
    editor("Consultant", value, async v => {
      await api(id ? "/api/admin/consultants/" + id : "/api/admin/consultants", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ ...v, price: Number(v.price), rating: Number(v.rating) })
      });
      closeModal(); toast("Consultant saved"); await loadConsultants();
    });
  }

  async function editProduct(id) {
    let value = { name: "", slug: "", category: "", description: "", price: 999, compareAt: "", stock: 0, image: "", badge: "PREPAID", variants: "Standard, Premium", customOptions: "Gift wrap, Personal intention card", active: true };
    if (id) value = (await api("/api/admin/products")).find(x => x.id === id) || value;
    editor("Product", value, async v => {
      await api(id ? "/api/admin/products/" + id : "/api/admin/products", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ ...v, price: Number(v.price), compareAt: Number(v.compareAt || 0), stock: Number(v.stock), variants: String(v.variants||"").split(",").map(s=>s.trim()).filter(Boolean), customOptions: String(v.customOptions||"").split(",").map(s=>s.trim()).filter(Boolean) })
      });
      closeModal(); toast("Product saved"); await loadProducts();
    });
  }

  async function editOffer(id) {
    let value = { code: "", title: "", type: "FIXED", value: 100, active: true, minOrder: 0 };
    if (id) value = (await api("/api/admin/offers")).find(x => x.id === id) || value;
    editor("Offer", value, async v => {
      await api(id ? "/api/admin/offers/" + id : "/api/admin/offers", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ ...v, value: Number(v.value), minOrder: Number(v.minOrder || 0), active: v.active === "true" || v.active === true })
      });
      closeModal(); toast("Offer saved"); await loadOffers();
    });
  }

  async function removeItem(type, id) {
    if (!confirm("Delete this item?")) return;
    await api("/api/admin/" + type + "/" + id, { method: "DELETE" });
    toast("Deleted");
    if (type === "consultants") await loadConsultants();
    else if (type === "products") await loadProducts();
    else await loadOffers();
  }

  async function updateStatus(type, id, status) {
    await api("/api/admin/" + type + "/" + id, { method: "PATCH", body: JSON.stringify({ status }) });
    toast("Status updated");
  }

  async function saveContent() {
    const value = {};
    ["heroTitle", "heroSubtitle", "announcement", "seoTitle", "seoDescription"]
      .forEach(k => { value[k] = $("#" + k).value; });
    await api("/api/admin/content", { method: "PATCH", body: JSON.stringify(value) });
    toast("Website content published");
  }

  document.querySelectorAll("nav button").forEach(button => {
    button.onclick = async () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      $("#" + button.dataset.tab)?.classList.add("active");
      document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
      button.classList.add("active");
      $("#pageTitle").textContent = titles[button.dataset.tab] || "Admin";
      await loadTab(button.dataset.tab);
    };
  });

  document.addEventListener("click", e => {
    const target = e.target.closest("button");
    if (!target) return;
    if (target.dataset.editConsultant) editConsultant(target.dataset.editConsultant);
    if (target.dataset.editProduct) editProduct(target.dataset.editProduct);
    if (target.dataset.editOffer) editOffer(target.dataset.editOffer);
    if (target.dataset.delete) removeItem(target.dataset.delete, target.dataset.id);
  });

  document.addEventListener("change", e => {
    const target = e.target;
    if (target.matches("[data-status-type]")) updateStatus(target.dataset.statusType, target.dataset.id, target.value);
  });

  window.go = go;
  window.editConsultant = editConsultant;
  window.editProduct = editProduct;
  window.editOffer = editOffer;
  window.loadBookings = loadBookings;
  window.loadOrders = loadOrders;
  window.saveContent = saveContent;
  window.closeModal = closeModal;

  loadStats();
})();