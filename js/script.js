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
const gerentes = ['adriano@newmarket.com', 'adrielle@newmarket.com'];

// LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        alert("E-mail ou senha incorretos.");
    }
});

// LOGOUT
document.getElementById('btn-logout').onclick = () => signOut(auth);

// ESTADO DO UTILIZADOR
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-panel').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.email.split('@')[0].toUpperCase();
        
        if (gerentes.includes(user.email)) {
            document.getElementById('gerente-view').classList.remove('hidden');
            document.getElementById('repositor-view').classList.add('hidden');
            carregarDados();
        } else {
            document.getElementById('repositor-view').classList.remove('hidden');
            document.getElementById('gerente-view').classList.add('hidden');
        }
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-panel').classList.add('hidden');
    }
});

// SALVAR (REPOSITOR)
document.getElementById('btn-salvar').onclick = async () => {
    const nome = document.getElementById('prod-nome').value;
    const setor = document.getElementById('prod-setor').value;
    const data = document.getElementById('prod-data').value;

    if(!nome || !data) return alert("Preencha tudo!");

    try {
        await addDoc(collection(db, "validades"), {
            produto: nome, setor: setor, vencimento: data, lancadoPor: auth.currentUser.email, criadoEm: new Date()
        });
        alert("✅ Enviado!");
        document.getElementById('prod-nome').value = "";
    } catch (e) { alert("Erro ao gravar."); }
};

// MONITOR (GERENTE)
function carregarDados() {
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
            card.className = `flex justify-between items-center p-4 rounded-3xl bg-white shadow-sm border-l-[10px] ${diff <= 3 ? 'border-red-500 card-vencido' : 'border-blue-400'}`;
            card.innerHTML = `
                <div class="flex-1">
                    <span class="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">${item.setor}</span>
                    <h3 class="font-black text-slate-800 text-md leading-tight mt-1 uppercase">${item.produto}</h3>
                    <p class="text-[10px] font-bold text-slate-400 italic">${item.vencimento.split('-').reverse().join('/')}</p>
                </div>
                <div class="text-right ml-4">
                    <p class="text-[10px] font-black ${diff <= 3 ? 'text-red-600' : 'text-slate-500'}">${diff}d</p>
                    <button onclick="window.darBaixa('${d.id}')" class="mt-2 bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-xl uppercase">Baixa</button>
                </div>`;
            lista.appendChild(card);
        });
        document.getElementById('count-total').innerText = snap.size;
        document.getElementById('count-critico').innerText = criticos;
    });
}

window.darBaixa = async (id) => {
    if(confirm("Confirmar baixa?")) await deleteDoc(doc(db, "validades", id));
};

// BUSCA
window.filtrarProdutos = () => {
    const termo = document.getElementById('input-busca').value.toLowerCase();
    document.querySelectorAll('#lista-vencimento > div').forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(termo) ? "flex" : "none";
    });
};

// WHATSAPP
document.getElementById('btn-whatsapp').onclick = () => {
    let msg = "*NEW MARKET - RELATÓRIO*\n\n";
    document.querySelectorAll('#lista-vencimento > div').forEach(c => {
        if(c.style.display !== "none") msg += "• " + c.innerText.replace("Baixa", "").split('\n').join(' ') + "\n";
    });
    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};
