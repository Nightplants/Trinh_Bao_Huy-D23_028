import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  set,
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

const userName = document.querySelector("strong");
userName.textContent = `${localStorage.getItem("username") || "Guest"}`;

const userId = localStorage.getItem("Id");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const list = document.querySelector(".favorites-list");
const clearBtn = document.querySelector(".clear-favorites");

function renderFavorites() {
  list.innerHTML = "";

  if (favorites.length === 0) {
    list.innerHTML = `<p style="text-align:center;">You have no favorite desserts yet ❤️</p>`;
    return;
  }

  favorites.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "favorite-card";

    const img = document.createElement("img");
    img.src = item.image || `https://picsum.photos/300/200?random=${index}`;
    img.alt = item.name;

    const name = document.createElement("h3");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = item.price;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async () => {
      favorites.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();

      if (userId) {
        const favRef = ref(db, `user/${userId}/favorites/${item.id}`);
        await remove(favRef);
      }
    });

    card.append(img, name, price, removeBtn);
    list.appendChild(card);
  });
}

function syncFavoritesFromFirebase() {
  if (!userId) {
    renderFavorites();
    return;
  }

  const favRef = ref(db, `user/${userId}/favorites`);
  onValue(favRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const firebaseFavs = Object.values(data);
      const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");

      const merged = [...localFavs];
      firebaseFavs.forEach((item) => {
        if (!merged.some((f) => f.name === item.name)) {
          merged.push(item);
        }
      });

      favorites = merged;
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    } else {
      renderFavorites();
    }
  });
}

clearBtn.addEventListener("click", async () => {
  if (confirm("Remove all favorites?")) {
    favorites = [];
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();

    if (userId) {
      await remove(ref(db, `user/${userId}/favorites`));
    }
  }
});

syncFavoritesFromFirebase();
