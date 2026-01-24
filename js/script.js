import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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
const auth = getAuth(app);
const db = getFirestore(app);

const gerentesEmails = ['adriano@newmarket.com', 'adrielle@newmarket.com'];

// --- AUTENTICAÇÃO ---

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Erro no login: Verifique seu e-mail e senha.");
    }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-panel').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.email.split('@')[0];

        if (gerentesEmails.includes(user.email)) {
            document.getElementById('gerente-view').classList.remove('hidden');
            document.getElementById('repositor-view').classList.add('hidden');
            carregarMonitor();
        } else {
            document.getElementById('repositor-view').classList.remove('hidden');
            document.getElementById('gerente-view').classList.add('hidden');
        }
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-panel').classList.add('hidden');
    }
});

// --- FUNÇÕES DE DADOS ---

window.salvarProduto = async () => {
    const nome = document.getElementById('prod-nome').value;
    const setor = document.getElementById('prod-setor').value;
    const data = document.getElementById('prod-data').value;

    if(!nome || !data) return alert("Preencha todos os campos.");

    try {
        await addDoc(collection(db, "validades"), {
            produto: nome,
            setor: setor,
            vencimento: data,
            lancadoPor: auth.currentUser.email,
            timestamp: new Date()
        });
        alert("✅ Lançamento realizado!");
        document.getElementById('prod-nome').value = '';
    } catch (e) { alert("Erro ao salvar."); }
};

window.darBaixa = async (id) => {
    if(confirm("Confirmar baixa do item?")) await deleteDoc(doc(db, "validades", id));
};

window.filtrarProdutos = () => {
    const termo = document.getElementById('input-busca').value.toLowerCase();
    document.querySelectorAll('#lista-vencimento > div').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(termo) ? "flex" : "none";
    });
};

function carregarMonitor() {
    const q = query(collection(db, "validades"), orderBy("vencimento", "asc"));
    onSnapshot(q, (snap) => {
        const lista = document.getElementById('lista-vencimento');
        let criticos = 0;
        lista.innerHTML = "";
        
        snap.forEach(d => {
            const item = d.data();
            const diff = Math.ceil((new Date(item.vencimento) - new Date()) / 86400000);
            if(diff <= 3) criticos++;
            
            const card = document.createElement('div');
            card.className = `flex justify-between items-center p-5 rounded-3xl bg-white shadow-sm border-l-[12px] ${diff <= 3 ? 'border-red-500 card-vencido' : 'border-blue-400'}`;
            card.innerHTML = `
                <div class="flex-1">
                    <span class="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">${item.setor}</span>
                    <h3 class="font-black text-slate-800 text-lg leading-tight mt-1 uppercase">${item.produto}</h3>
                    <p class="text-xs font-bold text-slate-400">Vencimento: ${item.vencimento.split('-').reverse().join('/')}</p>
                </div>
                <div class="text-right ml-4">
                    <p class="text-[10px] font-black ${diff <= 3 ? 'text-red-600' : 'text-slate-400'} uppercase">${diff} dias</p>
                    <button onclick="darBaixa('${d.id}')" class="mt-2 bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase shadow-md">Baixa</button>
                </div>
            `;
            lista.appendChild(card);
        });
        document.getElementById('count-total').innerText = snap.size;
        document.getElementById('count-critico').innerText = criticos;
    });
}

window.exportarRelatorio = () => {
    let msg = "*⚠️ RELATÓRIO NEW MARKET*\n\n";
    document.querySelectorAll('#lista-vencimento > div').forEach(c => {
        if(c.style.display !== "none") msg += "• " + c.innerText.replace("Baixa", "").split('\n').join(' ') + "\n\n";
    });
    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};
