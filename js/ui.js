import { excluirValidade, salvarValidade } from "./database.js";

export let filtroAtual = "todos";

export function showToast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.className = "show";
  setTimeout(() => (t.className = ""), 3000);
}

export function configurarSetorAutomatico(email) {
  const seletor = document.getElementById("p-setor-add");
  if (!seletor) return;

  if (email.includes("paulo")) seletor.value = "Corredor do Paulo";
  else if (email.includes("leandro")) seletor.value = "Corredor do Leandro";
  else if (email.includes("pedro")) seletor.value = "Corredor do Pedro";
  else if (email.includes("edmar")) seletor.value = "Corredor do Edmar";
  else if (email.includes("joao")) seletor.value = "Estoque Central";
}

export function aplicarFiltro(tipo) {
  filtroAtual = tipo;
  const bts = { critico: "f-critico", atencao: "f-atencao", todos: "f-todos" };
  Object.values(bts).forEach((id) =>
    document.getElementById(id).classList.remove("filtro-ativo")
  );
  document.getElementById(bts[tipo]).classList.add("filtro-ativo");
  processarLista();
}

export function processarLista() {
  const busca = document.getElementById("busca")?.value.toLowerCase() || "";
  document.querySelectorAll(".card").forEach((c) => {
    const matchF = filtroAtual === "todos" || c.dataset.cat === filtroAtual;
    const matchB = c.dataset.search.includes(busca);
    c.style.display = matchF && matchB ? "block" : "none";
  });
}

export function renderLista(itens, { counts, total }, { podeApagar }) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const fragment = document.createDocumentFragment();

  itens.forEach((item) => {
    const div = document.createElement("div");
    div.className = `card p-5 rounded-3xl shadow-sm ${item.tipoCard} mb-3 border-2 transition-all`;
    div.dataset.id = item.id;
    div.dataset.cat = item.cat;
    div.dataset.search = `${item.produto} ${item.codigo}`.toLowerCase();

    div.innerHTML = `
      <div class="flex gap-4">
        <input type="checkbox" class="item-check scale-[2] pointer-events-none">
        <div class="flex-grow">
          <div class="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1">
            <span>${item.setor}</span>
            <span>Cod: ${item.codigo}</span>
          </div>
          <h3 class="font-black text-base uppercase text-slate-800 leading-tight">${item.produto}</h3>
          <p class="text-[10px] font-bold text-slate-500 mb-2">Qtd: ${item.quantidade}</p>
          <div class="barcode-container my-3">
            <svg class="barcode" 
              jsbarcode-value="${item.codigo}" 
              jsbarcode-format="auto"
              jsbarcode-displayValue="true"
              jsbarcode-fontSize="18"
              jsbarcode-margin="0"
              jsbarcode-height="80">
            </svg>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex flex-col">
              <span class="text-[9px] uppercase font-black text-slate-400">Vencimento:</span>
              <span class="text-xl font-black text-slate-900 bg-white px-2 rounded-lg border-2 border-slate-200">
                ${item.vencimento.split("-").reverse().join("/")}
              </span>
            </div>
            ${
              podeApagar
                ? `<button type="button" class="btn-excluir text-[10px] text-red-600 bg-red-50 px-3 py-2 rounded-xl font-black border-2 border-red-200" data-id="${item.id}">EXCLUIR</button>`
                : ""
            }
          </div>
          <p class="text-[10px] font-black uppercase mt-2 ${
            item.cat === "critico" ? "text-red-600" : "text-slate-500"
          }">${item.textoVenc}</p>
        </div>
      </div>
    `;

    div.onclick = (e) => {
      if (e.target.tagName !== "BUTTON") {
        const cb = div.querySelector(".item-check");
        cb.checked = !cb.checked;
        div.classList.toggle("card-checked", cb.checked);
      }
    };

    fragment.appendChild(div);
  });

  lista.appendChild(fragment);

  JsBarcode(".barcode").init();

  document.getElementById("c-total").innerText = total;
  document.getElementById("c-critico").innerText = counts.critico;
  document.getElementById("c-atencao").innerText = counts.atencao;

  processarLista();

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Deseja apagar este item?")) {
        await excluirValidade(btn.dataset.id);
      }
    };
  });
}

export async function handleSalvar() {
  const nome = document.getElementById("p-nome").value;
  const ean = document.getElementById("p-ean").value;
  const qtd = document.getElementById("p-qtd").value;
  const setor = document.getElementById("p-setor-add").value;
  const vencimento = document.getElementById("p-data").value;

  if (!nome.trim() || !vencimento) {
    showToast("Preencha os campos obrigatórios!");
    return;
  }

  try {
    await salvarValidade({
      produto: nome,
      codigo: ean,
      quantidade: qtd,
      setor,
      vencimento
    });
    showToast("Item salvo!");
    document.getElementById("p-nome").value = "";
    document.getElementById("p-ean").value = "";
    document.getElementById("p-qtd").value = "";
  } catch (e) {
    showToast("Erro ao salvar item");
  }
}
