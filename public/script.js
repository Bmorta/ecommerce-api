const API_BASE = "/api/products";
const FALLBACK_IMAGE =
  "https://placehold.co/800x650/f0f2f7/171922?text=Product";

const state = {
  products: [],
  filteredProducts: [],
  categories: [],
  cart: loadCart()
};

const productGrid = document.getElementById("productGrid");
const productSummary = document.getElementById("productSummary");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartButton = document.getElementById("closeCartButton");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const productDialog = document.getElementById("productDialog");
const dialogContent = document.getElementById("dialogContent");
const closeDialogButton = document.getElementById("closeDialogButton");
const toast = document.getElementById("toast");

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  renderCart();
  await loadProducts();
}

function bindEvents() {
  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);

  cartButton.addEventListener("click", openCart);
  closeCartButton.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  checkoutButton.addEventListener("click", handleCheckout);

  closeDialogButton.addEventListener("click", closeProductDialog);

  productDialog.addEventListener("click", (event) => {
    if (event.target === productDialog) {
      closeProductDialog();
    }
  });

  productDialog.addEventListener("close", () => {
    dialogContent.innerHTML = "";
  });
}

async function loadProducts() {
  showStatus("Loading products...");

  try {
    const response = await fetch(API_BASE);

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    const result = await response.json();
    state.products = Array.isArray(result.data) ? result.data : [];
    state.filteredProducts = [...state.products];

    buildCategoryFilter();
    renderProducts();
    clearStatus();
  } catch (error) {
    state.products = [];
    state.filteredProducts = [];
    renderProducts();
    showStatus(
      "Unable to load products. Make sure the API and MongoDB connection are available.",
      true
    );
  }
}

function buildCategoryFilter() {
  const categories = [...new Set(
    state.products
      .map((product) => product.category)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  state.categories = categories;

  categoryFilter.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map(
      (category) =>
        `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
    )
  ].join("");
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  state.filteredProducts = state.products.filter((product) => {
    const matchesCategory = !category || product.category === category;

    const haystack = [
      product.name,
      product.description,
      product.category
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || haystack.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

function renderProducts() {
  productSummary.textContent = `${state.filteredProducts.length} ${state.filteredProducts.length === 1 ? "product" : "products"}`;

  if (!state.filteredProducts.length) {
    productGrid.innerHTML = `
      <div class="empty-results">
        <h3>No products found</h3>
        <p>Try a different search term or category.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = state.filteredProducts
    .map(createProductCard)
    .join("");

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });

  productGrid.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openProductDialog(button.dataset.view));
  });
}

function createProductCard(product) {
  const image = getProductImage(product);
  const stock = Number(product.stock) || 0;
  const inStock = stock > 0;

  return `
    <article class="product-card">
      <img
        class="product-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(product.name || "Product")}"
        loading="lazy"
        onerror="this.src='${FALLBACK_IMAGE}'"
      />

      <div class="product-body">
        <span class="product-category">${escapeHtml(product.category || "General")}</span>
        <h3 class="product-name">${escapeHtml(product.name || "Unnamed product")}</h3>
        <p class="product-description">${escapeHtml(
          truncate(product.description || "No description available.", 85)
        )}</p>

        <div class="product-meta">
          <strong class="product-price">${formatCurrency(product.price)}</strong>
          <span class="stock-label">${inStock ? `${stock} in stock` : "Out of stock"}</span>
        </div>

        <div class="card-actions">
          <button
            class="add-button"
            type="button"
            data-add="${escapeAttribute(product._id)}"
            ${inStock ? "" : "disabled"}
          >
            ${inStock ? "Add to cart" : "Out of stock"}
          </button>

          <button
            class="details-button"
            type="button"
            data-view="${escapeAttribute(product._id)}"
            aria-label="View ${escapeAttribute(product.name || "product")} details"
            title="View details"
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function openProductDialog(productId) {
  const product = state.products.find((item) => item._id === productId);

  if (!product) {
    return;
  }

  const stock = Number(product.stock) || 0;
  const image = getProductImage(product);

  dialogContent.innerHTML = `
    <div class="dialog-layout">
      <img
        class="dialog-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(product.name || "Product")}"
        onerror="this.src='${FALLBACK_IMAGE}'"
      />

      <div class="dialog-info">
        <span class="product-category">${escapeHtml(product.category || "General")}</span>
        <h2>${escapeHtml(product.name || "Unnamed product")}</h2>
        <p>${escapeHtml(product.description || "No description available.")}</p>
        <div class="dialog-price">${formatCurrency(product.price)}</div>

        <button
          class="add-button"
          id="dialogAddButton"
          type="button"
          ${stock > 0 ? "" : "disabled"}
        >
          ${stock > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  `;

  document
    .getElementById("dialogAddButton")
    ?.addEventListener("click", () => {
      addToCart(product._id);
      closeProductDialog();
    });

  if (typeof productDialog.showModal === "function") {
    productDialog.showModal();
  } else {
    productDialog.setAttribute("open", "");
  }
}

function closeProductDialog() {
  if (typeof productDialog.close === "function" && productDialog.open) {
    productDialog.close();
  } else {
    productDialog.removeAttribute("open");
    dialogContent.innerHTML = "";
  }
}

function addToCart(productId) {
  const product = state.products.find((item) => item._id === productId);

  if (!product || Number(product.stock) <= 0) {
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);

  if (existing) {
    if (existing.quantity >= Number(product.stock)) {
      showToast("You've reached the available stock.");
      return;
    }

    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      imageUrl: getProductImage(product),
      stock: Number(product.stock) || 0,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateCartQuantity(productId, quantity) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);
  const product = state.products.find((productItem) => productItem._id === productId);

  if (!item || !product) {
    return;
  }

  const maxStock = Number(product.stock) || item.stock;
  const safeQuantity = Math.max(1, Math.min(quantity, maxStock));

  item.quantity = safeQuantity;
  item.stock = maxStock;

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  showToast("Item removed from cart");
}

function renderCart() {
  const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  cartCount.textContent = String(totalItems);
  cartTotal.textContent = formatCurrency(totalPrice);

  if (!state.cart.length) {
    cartItems.innerHTML = "";
    cartItems.hidden = true;
    cartEmpty.hidden = false;
    checkoutButton.disabled = true;
    checkoutButton.style.opacity = "0.45";
    return;
  }

  cartItems.hidden = false;
  cartEmpty.hidden = true;
  checkoutButton.disabled = false;
  checkoutButton.style.opacity = "1";

  cartItems.innerHTML = state.cart.map(createCartItem).join("");

  cartItems.querySelectorAll("[data-decrease]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.cart.find(
        (cartItem) => cartItem.id === button.dataset.decrease
      );

      if (item) {
        updateCartQuantity(item.id, item.quantity - 1);
      }
    });
  });

  cartItems.querySelectorAll("[data-increase]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.cart.find(
        (cartItem) => cartItem.id === button.dataset.increase
      );

      if (item) {
        updateCartQuantity(item.id, item.quantity + 1);
      }
    });
  });

  cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
}

function createCartItem(item) {
  return `
    <div class="cart-item">
      <img
        class="cart-item-image"
        src="${escapeAttribute(item.imageUrl || FALLBACK_IMAGE)}"
        alt="${escapeAttribute(item.name || "Product")}"
        onerror="this.src='${FALLBACK_IMAGE}'"
      />

      <div class="cart-item-info">
        <strong>${escapeHtml(item.name || "Unnamed product")}</strong>
        <div class="cart-item-price">${formatCurrency(item.price)} each</div>

        <div class="quantity-control">
          <button
            type="button"
            data-decrease="${escapeAttribute(item.id)}"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span>${item.quantity}</span>
          <button
            type="button"
            data-increase="${escapeAttribute(item.id)}"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        class="remove-button"
        type="button"
        data-remove="${escapeAttribute(item.id)}"
        aria-label="Remove ${escapeAttribute(item.name || "item")} from cart"
        title="Remove"
      >
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
  `;
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("visible");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("visible");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function handleCheckout() {
  if (!state.cart.length) {
    return;
  }

  showToast("Checkout is a demo feature for this capstone.");
}

function loadCart() {
  try {
    const stored = localStorage.getItem("shopease-cart");
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("shopease-cart", JSON.stringify(state.cart));
}

function getProductImage(product) {
  if (
    product &&
    typeof product.imageUrl === "string" &&
    product.imageUrl.trim()
  ) {
    return product.imageUrl.trim();
  }

  return FALLBACK_IMAGE;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(Number(value) || 0);
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", isError);
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("is-error");
}

let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}
