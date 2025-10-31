import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
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

const userId = localStorage.getItem("Id");
const username = localStorage.getItem("username") || "Guest";
document.querySelector("strong").textContent = username;

function randomImage() {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/300/200?random=${randomId}`;
}

const defaultDesserts = [
  {
    name: "Butter Cookies",
    price: "$4.50",
    description: "Crispy and buttery Danish cookies with a golden texture.",
  },
  {
    name: "Chocolate Chip Cookies",
    price: "$5.00",
    description: "Classic cookies filled with melting chocolate chips.",
  },
  {
    name: "Macarons",
    price: "$8.50",
    description: "French almond meringue cookies with colorful flavors.",
  },
  {
    name: "Tiramisu",
    price: "$6.00",
    description:
      "Italian dessert made with coffee-soaked biscuits and mascarpone cream.",
  },
  {
    name: "Cheesecake",
    price: "$7.00",
    description:
      "Rich, creamy New York-style cheesecake topped with strawberries.",
  },
  {
    name: "Cupcake",
    price: "$3.50",
    description: "Soft vanilla cupcake with colorful sprinkles and frosting.",
  },
  {
    name: "Croissant",
    price: "$2.80",
    description: "Flaky French pastry made with layers of buttery dough.",
  },
  {
    name: "Donut",
    price: "$2.50",
    description:
      "Soft ring donut coated in sweet glaze — simple and delicious.",
  },
  {
    name: "Brownie",
    price: "$4.00",
    description: "Moist and fudgy chocolate brownie with a rich cocoa flavor.",
  },
  {
    name: "Fruit Tart",
    price: "$6.80",
    description: "Sweet pastry crust topped with custard and fresh fruits.",
  },
  {
    name: "Mochi Ice Cream",
    price: "$6.50",
    description: "Japanese mochi stuffed with sweet ice cream filling.",
  },
  {
    name: "Pancakes",
    price: "$5.00",
    description: "Fluffy pancakes topped with syrup and butter.",
  },
];

const defaultGrid = document.querySelector(".default-products");
const myGrid = document.querySelector(".my-products");
const addBtn = document.querySelector("#addProduct");

function startShop() {
  const myProductsRef = ref(db, `user/${userId}/myProducts`);
  onValue(myProductsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const myProducts = Object.entries(data).map(([id, value]) => ({
      id,
      ...value,
    }));
    renderAll(myProducts);
  });

  addBtn.addEventListener("click", async () => {
    const name = document.querySelector("#newName").value.trim();
    const price = document.querySelector("#newPrice").value.trim();
    const desc = document.querySelector("#newDesc").value.trim();

    if (!name || !price || !desc) {
      alert("Please fill all fields!");
      return;
    }

    const newRef = push(ref(db, `user/${userId}/myProducts`));
    const newProduct = {
      id: newRef.key,
      name,
      price,
      description: desc,
      image: randomImage(),
    };

    await set(newRef, newProduct);
    alert(`"${name}" added successfully!`);

    document.querySelector("#newName").value = "";
    document.querySelector("#newPrice").value = "";
    document.querySelector("#newDesc").value = "";
  });
}

function renderAll(myProducts) {
  defaultGrid.innerHTML = "";
  myGrid.innerHTML = "";

  defaultDesserts.forEach((dessert) => {
    const card = createCard(dessert, false);
    defaultGrid.appendChild(card);
  });

  if (myProducts.length > 0) {
    myProducts.forEach((dessert) => {
      const card = createCard(dessert, true, dessert.id);
      myGrid.appendChild(card);
    });
  } else {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "You haven't listed any products yet.";
    myGrid.appendChild(emptyMsg);
  }
}

function createCard(dessert, isUser = false, id = null) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.src = dessert.image || randomImage();
  img.alt = dessert.name;

  const title = document.createElement("h2");
  title.textContent = dessert.name;

  const desc = document.createElement("p");
  desc.className = "product-description";
  desc.textContent = dessert.description;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = dessert.price;

  const buyBtn = document.createElement("button");
  buyBtn.className = "buy-btn";
  buyBtn.textContent = "Buy Now";

  buyBtn.addEventListener("click", async () => {
    const newItem = {
      id: dessert.id || crypto.randomUUID(),
      name: dessert.name,
      price: dessert.price,
      description: dessert.description,
      image: dessert.image || randomImage(),
      addedBy: username,
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(newItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    const cartRef = ref(db, `user/${userId}/cart`);
    const newRef = push(cartRef);
    await set(newRef, newItem);

    alert(`"${dessert.name}" added to your cart!`);
  });

  card.append(img, title, desc, price, buyBtn);

  if (isUser) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (confirm(`Delete "${dessert.name}"?`)) {
        await remove(ref(db, `user/${userId}/myProducts/${id}`));
        alert(`"${dessert.name}" deleted successfully!`);
      }
    });

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", async () => {
      const newName = prompt("New name:", dessert.name);
      const newPrice = prompt("New price:", dessert.price);
      const newDesc = prompt("New description:", dessert.description);
      if (newName && newPrice && newDesc) {
        const updated = {
          ...dessert,
          name: newName,
          price: newPrice,
          description: newDesc,
        };
        await set(ref(db, `user/${userId}/myProducts/${id}`), updated);
        alert(`"${newName}" updated successfully!`);
      }
    });

    card.append(editBtn, delBtn);
  }

  return card;
}

startShop();
