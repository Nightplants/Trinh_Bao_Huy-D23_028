import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBL9Ox9HNV3Mxg94fYAbDJxsplSmeXXa-E",
  authDomain: "jsi-cuoi-khoa-93fb2.firebaseapp.com",
  databaseURL: "https://jsi-cuoi-khoa-93fb2-default-rtdb.firebaseio.com",
  projectId: "jsi-cuoi-khoa-93fb2",
  storageBucket: "jsi-cuoi-khoa-93fb2.firebasestorage.app",
  messagingSenderId: "580788334009",
  appId: "1:580788334009:web:3494fd5fd6580ed75f5a68",
  measurementId: "G-7Q4R5RCRZ3",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let cart = JSON.parse(localStorage.getItem("cart") || "[]"); // ✅ Đặt ở đầu file

const username = localStorage.getItem("username") || "Guest";
const userId = localStorage.getItem("Id");
document.querySelector("strong").textContent = username;

const cartList = document.querySelector(".cart-list");
const totalText = document.querySelector(".total strong");
const clearBtn = document.querySelector(".clear-cart");
const checkoutBtn = document.querySelector(".checkout");

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = `<p style="text-align:center;">Your cart is empty 🛒</p>`;
    totalText.textContent = "$0.00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = item.price;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    div.append(name, price, removeBtn);
    cartList.appendChild(div);

    total += parseFloat(item.price.replace("$", ""));
  });

  totalText.textContent = `$${total.toFixed(2)}`;
}

function syncCartFromFirebase() {
  if (!userId) {
    renderCart();
    return;
  }

  const cartRef = ref(db, `user/${userId}/cart`);
  onValue(cartRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const firebaseCart = Object.values(data);
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const merged = [...localCart];
      firebaseCart.forEach((item) => {
        if (!merged.some((localItem) => localItem.name === item.name)) {
          merged.push(item);
        }
      });

      cart = merged; // ✅ Cập nhật lại biến toàn cục
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    } else {
      renderCart();
    }
  });
}

clearBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();

    if (userId) {
      await remove(ref(db, `user/${userId}/cart`));
    }
  }
});

checkoutBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  alert("Thank you for your purchase! 🍰");
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

  if (userId) {
    await remove(ref(db, `user/${userId}/cart`));
  }
});

syncCartFromFirebase();
