import { initAuth, fazerLogin, fazerLogout } from "./auth.js";
import { aplicarFiltro, handleSalvar, showToast, processarLista } from "./ui.js";

window.aplicarFiltro = aplicarFiltro;
window.processarLista = processarLista;

document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  document.getElementById("btn-entrar").onclick = () => {
    const e = document.getElementById("email").value.trim().toLowerCase();
    const s = document.getElementById("password").value;
    if (!e || !s) {
      showToast("Preencha e-mail e senha");
      return;
    }
    fazerLogin(e, s);
  };

  document.getElementById("btn-logout").onclick = () => fazerLogout();

  document.getElementById("btn-salvar").onclick = () => handleSalvar();

  document.getElementById("btn-selecionar-criticos").onclick = () => {
    const criticos = Array.from(document.querySelectorAll(".card")).filter(
      (c) => c.dataset.cat === "critico"
    );
    const todosMarcados = criticos.every((c) =>
      c.querySelector(".item-check").checked
    );
    criticos.forEach((c) => {
      const cb = c.querySelector(".item-check");
      cb.checked = !todosMarcados;
      c.classList.toggle("card-checked", !todosMarcados);
    });
  };

  document.getElementById("btn-whatsapp").onclick = () => {
    const sel = document.querySelectorAll(".card-checked");
    if (sel.length === 0) return showToast("Marque os itens!");
    let msg = "*⚠️ NEW MARKET - RELATÓRIO DE VENCIMENTOS*

";
    sel.forEach((c) => {
      const nome = c.querySelector("h3").innerText;
      const data = c.querySelector(".text-xl").innerText;
      msg += `📌 *${nome}*
📅 Vencimento: ${data}

`;
    });
    msg += "_Desenvolvido por Paulo Souza_";
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };
});
