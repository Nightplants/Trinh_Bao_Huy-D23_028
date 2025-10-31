import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  onValue,
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

// === Khởi tạo Firebase ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === DOM Elements ===
const input = document.querySelector(".search-input");
const button = document.querySelector(".search-button");
const resultBox = document.querySelector(".result-box");
const userName = document.querySelector("strong");

userName.textContent = localStorage.getItem("username") || "Guest";
const userID = localStorage.getItem("Id");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function normalizeQuery(query) {
  query = query.trim();
  return query.charAt(0).toUpperCase() + query.slice(1);
}

async function searchWikipedia(query) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&format=json&origin=*`;
  const response = await fetch(endpoint);
  if (!response.ok)
    throw new Error("Failed to fetch search results from Wikipedia.");
  const data = await response.json();
  return data.query.search;
}

async function getSummary(title) {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const response = await fetch(endpoint);
  if (!response.ok)
    throw new Error("Failed to get summary from Wikipedia.");
  return await response.json();
}

async function getCategories(title) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(
    title
  )}&format=json&origin=*`;
  const response = await fetch(endpoint);
  if (!response.ok)
    throw new Error("Failed to get categories from Wikipedia.");
  const data = await response.json();
  const pages = data.query.pages;
  let categories = [];
  for (let pageId in pages) {
    if (pages[pageId].categories) {
      categories = pages[pageId].categories.map((c) => c.title.toLowerCase());
    }
  }
  return categories;
}

async function findDessert() {
  const rawQuery = input.value;
  const query = normalizeQuery(rawQuery);
  resultBox.innerHTML = "<p>Searching...</p>";

  try {
    const results = await searchWikipedia(query);
    let foundDessert = null;

    for (const result of results) {
      const categories = await getCategories(result.title);
      if (
        categories.some(
          (c) =>
            c.includes("cookies") ||
            c.includes("desserts") ||
            c.includes("cakes") ||
            c.includes("biscuits") ||
            c.includes("sweets") ||
            c.includes("confectionery") ||
            c.includes("pastries")
        )
      ) {
        foundDessert = result.title;
        break;
      }
    }

    if (!foundDessert) {
      resultBox.innerHTML = `<p>No dessert found matching "${query}".</p>`;
      return;
    }

    const summary = await getSummary(foundDessert);
    resultBox.innerHTML = `
      <input type="checkbox" id="favorite" class="favorite-checkbox">
      <label for="favorite" class="favorite-label">❤</label>
      ${
        summary.thumbnail
          ? `<img src="${summary.thumbnail.source}" alt="${summary.title}">`
          : ""
      }
      <h2>${summary.title}</h2>
      <p><em>${summary.description || ""}</em></p>
      <p class="summary">${summary.extract}</p>
    `;

    const checkbox = document.querySelector(".favorite-checkbox");

    if (favorites.some((item) => item.name === summary.title)) {
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", async () => {
      const favRef = ref(db, `user/${userID}/favorites`);

      if (checkbox.checked) {
        const newRef = push(favRef);
        const newId = newRef.key;
        const favoriteItem = {
          id: newId,
          name: summary.title,
          description: summary.description || "",
          extract: summary.extract || "",
          image: summary.thumbnail ? summary.thumbnail.source : "",
          addedBy: localStorage.getItem("username") || "Guest",
        };
        await set(newRef, favoriteItem);

        favorites.push(favoriteItem);
        localStorage.setItem("favorites", JSON.stringify(favorites));

        alert(`"${summary.title}" added to favorites!`);
      } else {
        const target = favorites.find((item) => item.name === summary.title);
        if (target) {
          await remove(ref(db, `user/${userID}/favorites/${target.id}`));
        }

        favorites = favorites.filter((item) => item.name !== summary.title);
        localStorage.setItem("favorites", JSON.stringify(favorites));

        alert(`"${summary.title}" removed from favorites.`);
      }
    });
  } catch (err) {
    console.error("Error:", err);
    resultBox.innerHTML = `<p>${err.message}</p>`;
  }
}

button.addEventListener("click", findDessert);
input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") findDessert();
});
