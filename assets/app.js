// assets/app.js
// Shared helpers + cart storage (localStorage). Works on GitHub Pages.

(function () {
  const CART_KEY = "gm_cart_v1";

  function safeJSONParse(s, fallback) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  function getCart() {
    return safeJSONParse(localStorage.getItem(CART_KEY) || "[]", []);
  }

  function saveCart(list) {
    localStorage.setItem(CART_KEY, JSON.stringify(list));
    updateBadges();
  }

  function addToCart(product, qty = 1) {
    if (!product) return;
    const id = product.id || (product.metallurgy + "|" + product.category + "|" + product.profile + "|" + product.size + "|" + product.steel + "|" + product.gost);
    const cart = getCart();
    const found = cart.find(x => x.id === id);
    if (found) {
      found.qty = (parseInt(found.qty || 1, 10) || 1) + (parseInt(qty, 10) || 1);
    } else {
      cart.push({
        id,
        qty: parseInt(qty, 10) || 1,
        product: {
          id,
          metallurgy: product.metallurgy || "",
          category: product.category || "",
          profile: product.profile || "",
          size: product.size || "",
          steel: product.steel || "",
          gost: product.gost || "",
          length_m: product.length_m || "",
          price_ton_to_0_3: product.price_ton_to_0_3 ?? null,
          price_ton_0_3_1: product.price_ton_0_3_1 ?? null,
          price_ton_1_5: product.price_ton_1_5 ?? null,
          price_piece_rub: product.price_piece_rub ?? null,
          note: product.note || "",
          origin: product.origin || ""
        }
      });
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    const cart = getCart().filter(x => x.id !== id);
    saveCart(cart);
  }

  function setQty(id, qty) {
    const cart = getCart();
    const found = cart.find(x => x.id === id);
    if (!found) return;
    const q = parseInt(qty, 10) || 1;
    found.qty = Math.max(1, q);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function countCart() {
    return getCart().reduce((s, x) => s + (parseInt(x.qty || 1, 10) || 1), 0);
  }

  function updateBadges() {
    const n = countCart();
    document.querySelectorAll("[data-cart-badge]").forEach(el => {
      if (!n) { el.style.display = "none"; el.textContent = "0"; }
      else { el.style.display = "inline-flex"; el.textContent = String(n); }
    });
  }

  // expose
  window.cartGet = getCart;
  window.cartAdd = addToCart;
  window.cartRemove = removeFromCart;
  window.cartSetQty = setQty;
  window.cartClear = clearCart;
  window.cartCount = countCart;
  window.cartUpdateBadges = updateBadges;

  document.addEventListener("DOMContentLoaded", updateBadges);
})();
