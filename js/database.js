import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./config.js";

export function observarValidades(callback) {
  const q = query(collection(db, "validades"), orderBy("vencimento", "asc"));
  return onSnapshot(q, (snap) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const itens = [];
    let counts = { critico: 0, atencao: 0 };

    snap.forEach((d) => {
      const item = { id: d.id, ...d.data() };

      const dataParts = item.vencimento.split("-").map(Number);
      const dataVenc = new Date(dataParts[0], dataParts[1] - 1, dataParts[2]);
      dataVenc.setHours(0, 0, 0, 0);

      const diff = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));

      let cat = "normal";
      let textoVenc = `Vence em ${diff} dias`;
      let tipoCard = "card-normal";

      if (diff <= 0) {
        cat = "critico";
        tipoCard = "card-critico";
        textoVenc = "🚨 VENCIDO HOJE!";
        counts.critico++;
      } else if (diff <= 7) {
        cat = "critico";
        tipoCard = "card-critico";
        counts.critico++;
      } else if (diff <= 15) {
        cat = "atencao";
        tipoCard = "card-atencao";
        counts.atencao++;
      }

      itens.push({ ...item, cat, textoVenc, tipoCard });
    });

    callback({ itens, counts, total: snap.size });
  });
}

export async function salvarValidade(dados) {
  const docData = {
    produto: dados.produto.toUpperCase().trim(),
    codigo: dados.codigo || "0",
    quantidade: dados.quantidade || "1",
    setor: dados.setor,
    vencimento: dados.vencimento,
    criadoEm: serverTimestamp()
  };
  return addDoc(collection(db, "validades"), docData);
}

export async function excluirValidade(id) {
  await deleteDoc(doc(db, "validades", id));
}
