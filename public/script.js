const API_BASE = "/api/products";
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
const manageProductsButton = document.getElementById("manageProductsButton");
const manageDialog = document.getElementById("manageDialog");
const closeManageButton = document.getElementById("closeManageButton");
const openAddProductButton = document.getElementById("openAddProductButton");
const manageProductList = document.getElementById("manageProductList");
const manageSummary = document.getElementById("manageSummary");
const productFormDialog = document.getElementById("productFormDialog");
const closeProductFormButton = document.getElementById("closeProductFormButton");
const cancelProductFormButton = document.getElementById("cancelProductFormButton");
const productForm = document.getElementById("productForm");
const formEyebrow = document.getElementById("formEyebrow");
const productFormTitle = document.getElementById("productFormTitle");
const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productStock = document.getElementById("productStock");
const productCategory = document.getElementById("productCategory");
const saveProductText = document.getElementById("saveProductText");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileManageProductsButton = document.getElementById(
  "mobileManageProductsButton"
);

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

  manageProductsButton.addEventListener("click", openManageProducts);
  closeManageButton.addEventListener("click", closeManageProducts);
  openAddProductButton.addEventListener("click", openAddProductForm);
  closeProductFormButton.addEventListener("click", closeProductForm);
  cancelProductFormButton.addEventListener("click", closeProductForm);
  productForm.addEventListener("submit", handleProductFormSubmit);

  manageDialog.addEventListener("click", (event) => {
    if (event.target === manageDialog) {
      closeManageProducts();
    }
  });

  productFormDialog.addEventListener("click", (event) => {
    if (event.target === productFormDialog) {
      closeProductForm();
    }
  });

  menuToggle.addEventListener("click", toggleMobileMenu);

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  mobileManageProductsButton.addEventListener("click", () => {
    closeMobileMenu();
    openManageProducts();
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
  const stock = Number(product.stock) || 0;
  const inStock = stock > 0;

  return `
    <article class="product-card">
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

  dialogContent.innerHTML = `
    <div class="dialog-layout">
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


async function openManageProducts() {
  renderManageProducts();
  if (typeof manageDialog.showModal === "function") {
    manageDialog.showModal();
  } else {
    manageDialog.setAttribute("open", "");
  }
}

function closeManageProducts() {
  if (typeof manageDialog.close === "function" && manageDialog.open) {
    manageDialog.close();
  } else {
    manageDialog.removeAttribute("open");
  }
}

function renderManageProducts() {
  manageSummary.textContent = `${state.products.length} ${state.products.length === 1 ? "product" : "products"}`;

  if (!state.products.length) {
    manageProductList.innerHTML = `
      <div class="manage-empty">
        <i class="fa-solid fa-box-open"></i>
        <h3>No products yet</h3>
        <p>Add your first product to the catalog.</p>
      </div>
    `;
    return;
  }

  manageProductList.innerHTML = state.products.map((product) => `
    <article class="manage-product-row">
      <div class="manage-product-icon">
        <i class="fa-solid fa-box"></i>
      </div>

      <div class="manage-product-details">
        <strong>${escapeHtml(product.name || "Unnamed product")}</strong>
        <span>${escapeHtml(product.category || "General")} • ${formatCurrency(product.price)} • ${Number(product.stock) || 0} in stock</span>
      </div>

      <div class="manage-product-actions">
        <button
          class="secondary-button compact-button"
          type="button"
          data-edit-product="${escapeAttribute(product._id)}"
        >
          <i class="fa-regular fa-pen-to-square"></i>
          Edit
        </button>

        <button
          class="danger-button"
          type="button"
          data-delete-product="${escapeAttribute(product._id)}"
        >
          <i class="fa-regular fa-trash-can"></i>
          Delete
        </button>
      </div>
    </article>
  `).join("");

  manageProductList.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      openEditProductForm(button.dataset.editProduct);
    });
  });

  manageProductList.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteProduct(button.dataset.deleteProduct);
    });
  });
}

function openAddProductForm() {
  productForm.reset();
  productId.value = "";
  formEyebrow.textContent = "NEW PRODUCT";
  productFormTitle.textContent = "Add product";
  saveProductText.textContent = "Save Product";
  openProductFormDialog();
}

function openEditProductForm(id) {
  const product = state.products.find((item) => item._id === id);

  if (!product) {
    showToast("Product not found.");
    return;
  }

  productId.value = product._id;
  productName.value = product.name || "";
  productDescription.value = product.description || "";
  productPrice.value = Number(product.price) || 0;
  productStock.value = Number(product.stock) || 0;
  productCategory.value = product.category || "";

  formEyebrow.textContent = "UPDATE PRODUCT";
  productFormTitle.textContent = "Edit product";
  saveProductText.textContent = "Update Product";

  openProductFormDialog();
}

function openProductFormDialog() {
  if (typeof productFormDialog.showModal === "function") {
    productFormDialog.showModal();
  } else {
    productFormDialog.setAttribute("open", "");
  }
}

function closeProductForm() {
  if (typeof productFormDialog.close === "function" && productFormDialog.open) {
    productFormDialog.close();
  } else {
    productFormDialog.removeAttribute("open");
  }
}

async function handleProductFormSubmit(event) {
  event.preventDefault();

  const id = productId.value.trim();
  const payload = {
    name: productName.value.trim(),
    description: productDescription.value.trim(),
    price: Number(productPrice.value),
    category: productCategory.value.trim(),
    stock: Number(productStock.value)
  };

  if (
    !payload.name ||
    !payload.description ||
    !payload.category ||
    Number.isNaN(payload.price) ||
    Number.isNaN(payload.stock) ||
    payload.price < 0 ||
    payload.stock < 0
  ) {
    showToast("Please complete all product fields correctly.");
    return;
  }

  const isUpdate = Boolean(id);

  try {
    const response = await fetch(
      isUpdate ? `${API_BASE}/${encodeURIComponent(id)}` : API_BASE,
      {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to save product.");
    }

    closeProductForm();
    await loadProducts();
    renderManageProducts();
    showToast(isUpdate ? "Product updated successfully." : "Product added successfully.");
  } catch (error) {
    showToast(error.message || "Unable to save product.");
  }
}

async function deleteProduct(id) {
  const product = state.products.find((item) => item._id === id);

  if (!product) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${product.name}"? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to delete product.");
    }

    state.cart = state.cart.filter((item) => item.id !== id);
    saveCart();

    await loadProducts();
    renderManageProducts();
    renderCart();
    showToast("Product deleted successfully.");
  } catch (error) {
    showToast(error.message || "Unable to delete product.");
  }
}


function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));

  menuToggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
}
