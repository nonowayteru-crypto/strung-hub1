import { firebaseConfig, cloudinaryConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// =========================
// INIT
// =========================
console.log("Initializing Firebase...");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase ready:", app);

// =========================
// DOM
// =========================
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descInput = document.getElementById("description");

const imageFile = document.getElementById("imageFile");
const imageUrlInput = document.getElementById("imageUrl");

const previewImage = document.getElementById("previewImage");

const formTitle = document.getElementById("formTitle");
const btnCancelEdit = document.getElementById("btnCancelEdit");

const categoryInput = document.getElementById("category");
const toggleListBtn = document.getElementById("toggleListBtn");

const orderList = document.getElementById("orderList");

// =========================
// STATE
// =========================
let editingId = null;
let currentImage = "";

// =========================
// GET IMAGE URL
// =========================
async function getImageUrl() {
  // upload file
  if (imageFile.files[0]) {
    return await uploadImage(imageFile.files[0]);
  }

  // image URL
  if (imageUrlInput.value.trim()) {
    return imageUrlInput.value.trim();
  }

  return "";
}

// =========================
// UPLOAD IMAGE
// =========================
async function uploadImage(file) {
  console.log("Uploading image...", file.name);

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  console.log("Image uploaded:", data);

  return data.secure_url;
}

// =========================
// CREATE / UPDATE
// =========================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("Form submitted");

  let imageUrl = currentImage;

  const newImage = await getImageUrl();

  if (newImage) {
    imageUrl = newImage;
  }

  const productData = {
    name: nameInput.value,
    price: Number(priceInput.value),
    description: descInput.value,
    image: imageUrl,
    category: categoryInput.value
  };

  console.log("Product data:", productData);

  // UPDATE
  if (editingId) {
    console.log("Updating product:", editingId);

    await updateDoc(
      doc(db, "products", editingId),
      productData
    );

    console.log("Updated!");

    editingId = null;

    formTitle.textContent = "Thêm sản phẩm";

    btnCancelEdit.classList.add("hidden");
  }

  // CREATE
  else {
    console.log("Creating product...");

    const docRef = await addDoc(
      collection(db, "products"),
      productData
    );

    console.log("Created with ID:", docRef.id);
  }

  resetForm();

  loadProducts();
});

// =========================
// READ
// =========================
async function loadProducts() {
  console.log("Loading products...");

  productList.innerHTML = "";

  const querySnapshot = await getDocs(
    collection(db, "products")
  );

  console.log("Total products:", querySnapshot.size);

  querySnapshot.forEach((docSnap) => {
    const product = docSnap.data();

    console.log("Product:", docSnap.id, product);

    const div = document.createElement("div");

    div.className = "product-item";

    div.innerHTML = `
      <img src="${product.image}" width="100">

      <h3>${product.name}</h3>

      <p>Category: ${product.category}</p>

      <p>${product.price}đ</p>

      <p>${product.description}</p>

      <button onclick="editProduct('${docSnap.id}')">
        Sửa
      </button>

      <button onclick="deleteProduct('${docSnap.id}')">
        Xóa
      </button>
    `;

    productList.appendChild(div);
  });
}



// =========================
// DELETE
// =========================
window.deleteProduct = async function (id) {
  console.log("Deleting product:", id);

  await deleteDoc(doc(db, "products", id));

  console.log("Deleted!");

  loadProducts();
};

// =========================
// EDIT
// =========================
window.editProduct = async function (id) {
  console.log("Editing product:", id);

  const docRef = doc(db, "products", id);

  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    console.log("Product not found!");
    return;
  }

  const data = snap.data();

  console.log("Loaded data:", data);

  editingId = id;

  currentImage = data.image;

  // fill inputs
  nameInput.value = data.name;
  priceInput.value = data.price;
  descInput.value = data.description;
  categoryInput.value = data.category || "";

  // image url input
  imageUrlInput.value = data.image || "";

  // preview
  previewImage.src = data.image;

  previewImage.classList.remove("hidden");

  // UI
  formTitle.textContent = "Chỉnh sửa sản phẩm";

  btnCancelEdit.classList.remove("hidden");
};

// =========================
// CANCEL EDIT
// =========================
btnCancelEdit.addEventListener("click", () => {
  console.log("Cancel edit");

  editingId = null;

  formTitle.textContent = "Thêm sản phẩm";

  btnCancelEdit.classList.add("hidden");

  resetForm();
});

// =========================
// PREVIEW FILE IMAGE
// =========================
imageFile.addEventListener("change", () => {
  const file = imageFile.files[0];

  if (file) {
    console.log("Preview image:", file.name);

    previewImage.src = URL.createObjectURL(file);

    previewImage.classList.remove("hidden");
  }
});

// =========================
// PREVIEW URL IMAGE
// =========================
imageUrlInput.addEventListener("input", () => {
  const url = imageUrlInput.value.trim();

  if (url) {
    previewImage.src = url;

    previewImage.classList.remove("hidden");
  }
});

// =========================
// RESET FORM
// =========================
function resetForm() {
  console.log("Reset form");

  productForm.reset();

  previewImage.classList.add("hidden");

  previewImage.src = "";

  currentImage = "";
}

// =========================
// START
// =========================
loadProducts();

// =========================
// TOGGLE PRODUCT LIST
// =========================
toggleListBtn.addEventListener("click", () => {

  const isHidden = productList.hidden;

  if (isHidden) {
    productList.hidden = false;

    toggleListBtn.textContent =
      "Ẩn sản phẩm";
  }

  else {
    productList.hidden = true;

    toggleListBtn.textContent =
      "Hiện sản phẩm";
  }

});
// =========================
// LOAD ORDERS
// =========================
async function loadOrders() {

  console.log("Loading orders...");

  orderList.innerHTML = "";

  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  const querySnapshot =
    await getDocs(q);

  if (querySnapshot.empty) {

    orderList.innerHTML = `
      <p>Chưa có đơn hàng</p>
    `;

    return;
  }

  querySnapshot.forEach((docSnap) => {

    const order = docSnap.data();

    const div =
      document.createElement("div");

    div.className = "order-item";

    div.innerHTML = `
      <div class="order-card">
      <h3>
        ${order.customerName || "Khách"}
      </h3>

      <p>
        SĐT:
        ${order.phone || "Không có"}
      </p>

      <p>
        Địa chỉ:
        ${order.address || "Không có"}
      </p>

      <p>
        Tổng:
        ${order.total || 0}đ
      </p>

      <p>
        Trạng thái:
        <b>${order.status || "pending"}</b>
      </p>

      <button
        onclick="updateOrderStatus(
          '${docSnap.id}',
          'confirmed'
        )"
      >
        Xác nhận
      </button>

      <button
        onclick="updateOrderStatus(
          '${docSnap.id}',
          'shipping'
        )"
      >
        Đang giao
      </button>

      <button
        onclick="updateOrderStatus(
          '${docSnap.id}',
          'done'
        )"
      >
        Hoàn thành
      </button>

      <button
        onclick="deleteOrder(
          '${docSnap.id}'
        )"
      >
        Xóa
      </button>

      <hr>
      </div>
    `;

    orderList.appendChild(div);

  });

}

// =========================
// UPDATE ORDER STATUS
// =========================
window.updateOrderStatus =
async function (id, status) {

  console.log(
    "Updating order:",
    id,
    status
  );

  await updateDoc(
    doc(db, "orders", id),
    {
      status: status
    }
  );

  loadOrders();

};

// =========================
// DELETE ORDER
// =========================
window.deleteOrder =
async function (id) {

  console.log(
    "Deleting order:",
    id
  );

  await deleteDoc(
    doc(db, "orders", id)
  );

  loadOrders();

};

loadProducts();
loadOrders();