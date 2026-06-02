import { firebaseConfig }
from "./firebase-config.js";

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =======================
// FIREBASE
// =======================
const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

// =======================
// DOM
// =======================
const orderBtn =
    document.getElementById("orderBtn");

const orderDropdown =
    document.getElementById("orderDropdown");

const orderItems =
    document.getElementById("orderItems");

const orderCount =
    document.getElementById("orderCount");

const orderTotal =
    document.getElementById("orderTotal");

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
// DROPDOWN
// =======================
if (orderBtn && orderDropdown) {

    orderBtn.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            orderDropdown.classList.toggle(
                "hidden"
            );

        }
    );

}

document.addEventListener(
    "click",
    (e) => {

        if (
            !e.target.closest(
                ".order-menu"
            )
        ) {

            orderDropdown?.classList.add(
                "hidden"
            );

        }

    }
);

// =======================
// GET ORDERS
// =======================
let orders =
    JSON.parse(
        localStorage.getItem(
            "orders"
        )
    ) || [];

// =======================
// FORMAT PRICE
// =======================
function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("vi-VN")
        + "đ";

}

// =======================
// SAVE ORDERS
// =======================
function saveOrders() {

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

}

// =======================
// STATUS COLOR
// =======================
function getStatusColor(status) {

    switch (status) {

        case "Đã giao":
            return "#16a34a";

        case "Đang xử lý":
            return "#f59e0b";

        case "Đã hủy":
            return "#dc2626";

        default:
            return "#666";

    }

}

// =======================
// RENDER ORDERS
// =======================
function renderOrders() {

    if (
        !orderItems ||
        !orderCount ||
        !orderTotal
    ) return;

    orderItems.innerHTML = "";

    orderCount.textContent =
        orders.length;

    // EMPTY
    if (orders.length === 0) {

        orderItems.innerHTML = `

        <div class="cart-item empty-order">
            Chưa có hóa đơn
        </div>

        `;

        orderTotal.textContent =
            "0 hóa đơn";

        return;

    }

    // RENDER
    orders.forEach((item) => {

        orderItems.innerHTML += `

        <div class="cart-item">

            <img
                src="${item.image}"
                alt="${item.name}"
            />

            <div class="cart-info">

                <h4>
                    ${item.name}
                </h4>

                <p>
                    Mã: ${item.id}
                </p>

                <p>
                    ${formatPrice(item.total)}
                </p>

                <p style="
                    color:${getStatusColor(item.status)};
                    font-weight:600;
                ">
                    ${item.status || "Đang xử lý"}
                </p>

                <small>
                    ${item.createdAt || ""}
                </small>

            </div>

            <button
                class="remove-cart"
                onclick="removeOrder('${item.id}')"
            >
                ✖
            </button>

        </div>

        `;

    });

    orderTotal.textContent =
        `${orders.length} hóa đơn`;

}

// =======================
// REMOVE ORDER
// =======================
window.removeOrder = function (id) {

    orders = orders.filter(
        order => order.id !== id
    );

    saveOrders();

    renderOrders();

};

// =======================
// ADD ORDER
// =======================
window.addOrder =
async function (orderData) {

    const order = {

        id:
            orderData.id ||
            "HD" + Date.now(),

        name:
            orderData.name || "Unknown",

        image:
            orderData.image || "",

        total:
            Number(orderData.total) || 0,

        customerName:
            orderData.customerName || "",

        phone:
            orderData.phone || "",

        address:
            orderData.address || "",

        items:
            orderData.items || [],

        status:
            orderData.status ||
            "Đang xử lý",



        createdAt:
            orderData.createdAt ||
            new Date()
            .toLocaleString("vi-VN")

    };

    // ===================
    // SAVE FIRESTORE
    // ===================
    await addDoc(
        collection(db, "orders"),
        order
    );

    // ===================
    // SAVE LOCAL
    // ===================
    orders.unshift(order);

    saveOrders();

    renderOrders();

};

// =======================
// CONFIRM ORDER
// =======================
if (confirmOrderBtn) {
    console.log("Order JS loaded");

    console.log(confirmOrderBtn);
    confirmOrderBtn.addEventListener(
        "click",
        async () => {
            console.log("BUTTON CLICKED");

            const name =
                customerName.value.trim();

            const phone =
                customerPhone.value.trim();

            const address =
                customerAddress.value.trim();

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

            // lấy thông tin sản phẩm
            const productInfo =
                document.getElementById(
                    "productInfo"
                );

            if (!productInfo) {

                alert(
                    "Không tìm thấy thông tin sản phẩm!"
                );

                return;

            }

            await addOrder({

                name:
                    productInfo.dataset.name,

                image:
                    productInfo.dataset.image,

                total:
                    Number(
                        productInfo.dataset.price
                    ),

                customerName:
                    name,

                phone:
                    phone,

                address:
                    address,

                status:
                    "Đang xử lý"

            });

            // clear form
            customerName.value = "";
            customerPhone.value = "";
            customerAddress.value = "";

            alert(
                "Đặt hàng thành công!"
            );

        }
    );

}

// =======================
// START
// =======================
renderOrders();
