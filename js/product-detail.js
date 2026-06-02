import { firebaseConfig } from "./firebase-config.js";

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =======================
// INIT
// =======================
const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

// =======================
// GET ID FROM URL
// =======================
const params =
  new URLSearchParams(window.location.search);

const id =
  params.get("id");

console.log("Product ID:", id);

// =======================
// DOM
// =======================
const title =
  document.querySelector(".info-top h1");

const price =
  document.querySelector(".info-top p:nth-child(2)");

const desc =
  document.querySelector(".info-top p:nth-child(3)");

const img =
  document.querySelector(".product-img img");

const productInfo =
  document.getElementById("productInfo");

// =======================
// LOAD PRODUCT
// =======================
async function loadProduct() {

  if (!id) {

    console.log("❌ Không có ID");

    return;

  }

  try {

    const docRef =
      doc(db, "products", id);

    const snap =
      await getDoc(docRef);

    // not found
    if (!snap.exists()) {

      console.log(
        "❌ Không tìm thấy sản phẩm"
      );

      return;

    }

    const data =
      snap.data();

    console.log("📦 Product:", data);

    // =======================
    // UI
    // =======================
    title.textContent =
      data.name;

    price.textContent =
      Number(data.price)
      .toLocaleString("vi-VN")
      + " VND";

    desc.innerHTML =
      "Description:<br>"
      + (data.description || "");

    img.src =
      data.image;

    // =======================
    // DATASET FOR CART
    // =======================
    productInfo.dataset.id =
      id;

    productInfo.dataset.name =
      data.name;

    productInfo.dataset.price =
      data.price;

    productInfo.dataset.image =
      data.image;

  } catch (error) {

    console.error(
      "🔥 Firestore Error:",
      error
    );

  }

}

// =======================
// FORM
// =======================
const confirmOrderBtn =
    document.getElementById(
        "confirmOrderBtn"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const customerPhone =
    document.getElementById(
        "customerPhone"
    );

const customerAddress =
    document.getElementById(
        "customerAddress"
    );

// =======================
// CONFIRM ORDER
// =======================
if (
    confirmOrderBtn &&
    productInfo
) {

    confirmOrderBtn.addEventListener(
        "click",
        () => {

        // values
        const name =
            customerName.value.trim();

        const phone =
            customerPhone.value.trim();

        const address =
            customerAddress.value.trim();

        // validate
        if (
            !name ||
            !phone ||
            !address
        ) {

            alert(
                "Vui lòng nhập đầy đủ thông tin!"
            );

            return;

        }

        // get old orders
        let orders =
            JSON.parse(
                localStorage.getItem(
                    "orders"
                )
            ) || [];

        // create order
        const order = {

            id:
                "HD" + Date.now(),

            name:
                productInfo.dataset.name,

            image:
                productInfo.dataset.image,

            total:
                Number(
                    productInfo.dataset.price
                ),

            status:
                "Đang xử lý",

            customer: {
                name,
                phone,
                address
            },

            createdAt:
                new Date()
                .toLocaleString("vi-VN")

        };

        // add order
        orders.unshift(order);

        // save
        localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

        // clear form
        customerName.value = "";
        customerPhone.value = "";
        customerAddress.value = "";

        alert(
            "Đặt hàng thành công!"
        );

    });

}

// =======================
// START
// =======================
loadProduct();