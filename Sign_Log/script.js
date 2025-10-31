import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

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
const database = getDatabase(app);
const auth = getAuth();

let email_login = document.getElementById("email_input_login");
let username_login = document.getElementById("username_input_login");
let password_login = document.getElementById("password_input_login");
let email_register = document.getElementById("email_input_register");
let username_register = document.getElementById("username_input_register");
let password_register = document.getElementById("password_input_register");
let login_btn = document.getElementById("login_btn");
let register_btn = document.getElementById("register_btn");

register_btn.addEventListener("click", async function () {
  let email = email_register.value;
  let username = username_register.value;
  let password = password_register.value;
  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await set(ref(database, "user/" + user.uid), {
        id: user.uid,
        email: email,
        username: username,
        password: password,
      });
      alert("Tạo tài khoản thành công");
      localStorage.setItem(`username`, username);
      localStorage.setItem(`Id`, user.uid);
      window.location.href = `../Home/index.html`;
    })
    .catch((err) => {
      const errorCode = err.code;
      const errorMess = err.message;
      alert(errorMess);
    });
});

login_btn.addEventListener("click", function () {
  let email = email_login.value;
  let username = username_login.value;
  let password = password_login.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      let date = new Date();
      update(ref(database, "user/" + user.uid), {
        lastLogin: date,
      }).then(() => {
        localStorage.setItem(`username`, username);
        localStorage.setItem(`Id`, user.uid);
        alert("Đăng nhập thành công");
        window.location.href = `../Home/index.html`;
      });
    })
    .catch((err) => {
      const errorCode = err.code;
      const errorMess = err.message;
      alert(errorMess);
    });
});
