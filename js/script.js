import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAJaG7s34jBoU61fNNZieeV3N6lh9_3vo4",
    authDomain: "mercado-c3e95.firebaseapp.com",
    projectId: "mercado-c3e95",
    storageBucket: "mercado-c3e95.firebasestorage.app",
    messagingSenderId: "883539091925",
    appId: "1:883539091925:web:d8bb6b99548e59beaa5d5c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gerentes = ['Adriano', 'Adrielle'];
let usuarioLogado = "";

// Lógica de Login
document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    usuarioLogado = document.getElementById('username').value;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-panel').classList.remove('hidden');
    document.getElementById('user-display').innerText = `Olá, ${usuarioLogado}`;
    
    if(gerentes.includes(usuarioLogado)) {
        document.getElementById('gerente-view').classList.remove('hidden');
        carregarMonitor();
    } else {
        document.getElementById('repositor-view').classList.remove('hidden');
    }
};

// Salvar Produto (Repositor)
window.salvarProduto = async () => {
    const nome = document.getElementById('prod-nome').value;
    const setor = document.getElementById('prod-setor').value;
    const data = document.getElementById('prod-data').value;

    if(!nome || !data) return alert("Por favor, preencha o nome e a data de vencimento!");

    try {
        await addDoc(collection(db, "validades"), {
            produto: nome,
            setor: setor,
            vencimento: data,
            lancadoPor: usuarioLogado,
            timestamp: new Date()
        });
        alert("✅ " + nome + " enviado para o " + setor);
        document.getElementById('prod-nome').value = '';
        document.getElementById('prod-data').value = '';
    } catch (e) { alert("Erro ao salvar: verifique a conexão."); }
};

// Dar Baixa (Gerente)
window.darBaixa = async (id) => {
    if(confirm("Deseja confirmar a baixa deste item do sistema?")) {
        try {
            await deleteDoc(doc(db, "validades", id));
        } catch (e) { alert("Erro ao deletar."); }
    }
};

// Filtro de Busca
window.filtrarProdutos = () => {
    const termo = document.getElementById('input-busca').value.toLowerCase();
    document.querySelectorAll('#lista-vencimento > div').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(termo) ? "flex" : "none";
    });
};

// Monitor em Tempo Real (Gerente)
function carregarMonitor() {
    const q = query(collection(db, "validades"), orderBy("vencimento", "asc"));
    onSnapshot(q, (snap) => {
        const lista = document.getElementById('lista-vencimento');
        let criticos = 0;
        lista.innerHTML = "";
        
        snap.forEach(d => {
            const item = d.data();
            const hoje = new Date();
            const venci = new Date(item.vencimento);
            const diff = Math.ceil((venci - hoje) / (1000 * 60 * 60 * 24));
            
            if(diff <= 3) criticos++;
            
            const card = document.createElement('div');
            card.className = `flex justify-between items-center p-5 rounded-3xl bg-white shadow-sm border-l-[12px] ${diff <= 3 ? 'border-red-500 card-vencido' : 'border-blue-400'}`;
            card.innerHTML = `
                <div class="flex-1">
                    <span class="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">${item.setor}</span>
                    <h3 class="font-black text-slate-800 text-lg leading-tight mt-1 uppercase">${item.produto}</h3>
                    <p class="text-xs font-bold text-slate-400 italic">Vencimento: ${item.vencimento.split('-').reverse().join('/')}</p>
                </div>
                <div class="text-right ml-4">
                    <p class="text-[10px] font-black ${diff <= 3 ? 'text-red-600' : 'text-slate-400'} uppercase">${diff} dias</p>
                    <button onclick="darBaixa('${d.id}')" class="mt-2 bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-xl active:bg-black uppercase shadow-md">Baixa</button>
                </div>
            `;
            lista.appendChild(card);
        });
        document.getElementById('count-total').innerText = snap.size;
        document.getElementById('count-critico').innerText = criticos;
    });
}

// Relatório WhatsApp
window.exportarRelatorio = () => {
    let msg = "*⚠️ RELATÓRIO DE VALIDADES - NEW MARKET*\n\n";
    let cont = 0;
    document.querySelectorAll('#lista-vencimento > div').forEach(c => {
        if(c.style.display !== "none") {
            const info = c.innerText.replace("Baixa", "").split('\n').filter(t => t.trim() !== "").join(' ');
            msg += "• " + info + "\n\n";
            cont++;
        }
    });
    if(cont === 0) return alert("Nada para exportar.");
    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};
  
