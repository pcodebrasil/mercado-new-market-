import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, GERENTES, PAULO_ADM } from "./config.js";
import { observarValidades } from "./database.js";
import { renderLista, configurarSetorAutomatico, showToast } from "./ui.js";

let unsubscribeSnapshot = null;

export function initAuth() {
  const loadingScreen = document.getElementById("loading-screen");
  const loginScreen = document.getElementById("login-screen");
  const mainPanel = document.getElementById("main-panel");
  const userDisplay = document.getElementById("user-display");
  const repositorForm = document.getElementById("repositor-form");

  onAuthStateChanged(auth, (user) => {
    loadingScreen.style.display = "none";

    if (user) {
      const email = user.email;
      userDisplay.innerText = email;

      const isGerente = GERENTES.includes(email);
      const isPaulo = email === PAULO_ADM;

      loginScreen.style.display = "none";
      mainPanel.style.display = "flex";
      repositorForm.classList.toggle("hidden", isGerente);

      configurarSetorAutomatico(email);

      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeSnapshot = observarValidades(({ itens, counts, total }) => {
        renderLista(itens, { counts, total }, { podeApagar: isGerente || isPaulo });
      });
    } else {
      loginScreen.style.display = "flex";
      mainPanel.style.display = "none";

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
    }
  });
}

export async function fazerLogin(email, senha) {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (err) {
    const msgs = {
      "auth/invalid-email": "E-mail inválido",
      "auth/user-not-found": "Usuário não encontrado",
      "auth/wrong-password": "Senha incorreta",
      "auth/too-many-requests": "Muitas tentativas. Tente mais tarde"
    };
    showToast(msgs[err.code] || "Erro ao fazer login");
  }
}

export function fazerLogout() {
  signOut(auth);
}
