// DOM
const inputItem = document.getElementById('itemInput');
const inputQtd = document.getElementById('quantidadeInput');
const addButton = document.getElementById('addButton');
const shoppingList = document.getElementById('shoppingList');

// Modal
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
let pendingRemovalLi = null;
document.getElementById('modalConfirm').addEventListener('click', () => {
  if (pendingRemovalLi) {
    pendingRemovalLi.remove();
    salvarLista();
    confirmModal.hide();
  }
});

function carregarLista() {
  const data = localStorage.getItem('listaCompras');
  if (!data) return;
  JSON.parse(data).forEach(adicionarItemNaTela);
}

function salvarLista() {
  const itens = [];
  shoppingList.querySelectorAll('li').forEach(li => {
    itens.push({
      nome: li.dataset.nome,
      quantidade: +li.dataset.qtd,
      comprado: li.dataset.comprado === "true"
    });
  });
  localStorage.setItem('listaCompras', JSON.stringify(itens));
}

function adicionarItemNaTela(item) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.dataset.nome = item.nome;
  li.dataset.qtd = item.quantidade;
  li.dataset.comprado = item.comprado;

  const div = document.createElement('div');
  div.className = 'form-check';

  const cb = document.createElement('input');
  cb.className = 'form-check-input';
  cb.type = 'checkbox';
  cb.checked = item.comprado;
  cb.addEventListener('change', () => {
    li.dataset.comprado = cb.checked;
    salvarLista();
    spanItem.style.textDecoration = cb.checked ? 'line-through' : 'none';
  });

  const spanItem = document.createElement('span');
  spanItem.textContent = `${item.nome} (${item.quantidade})`;
  spanItem.className = 'form-check-label ms-2';
  if (item.comprado) spanItem.style.textDecoration = 'line-through';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-outline-secondary';
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => editarItem(li));

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-sm btn-outline-danger';
  removeBtn.textContent = '🗑️';
  removeBtn.addEventListener('click', () => {
    pendingRemovalLi = li;
    confirmModal.show();
  });

  div.append(cb, spanItem);
  btnGroup.append(editBtn, removeBtn);
  li.append(div, btnGroup);
  shoppingList.append(li);
}

function adicionarItem() {
  const nome = inputItem.value.trim();
  const qtd = parseInt(inputQtd.value);
  if (!nome || isNaN(qtd) || qtd < 1) {
    return alert('Item e quantidade válidos, por favor.');
  }
  adicionarItemNaTela({ nome, quantidade: qtd, comprado: false });
  salvarLista();
  inputItem.value = ''; inputQtd.value = 1; inputItem.focus();
}

function editarItem(li) {
  const nome = prompt('Novo nome:', li.dataset.nome);
  const qtd = prompt('Nova quantidade:', li.dataset.qtd);
  if (!nome || isNaN(qtd) || qtd<1) return;
  li.dataset.nome = nome;
  li.dataset.qtd = qtd;
  li.querySelector('.form-check-label').textContent = `${nome} (${qtd})`;
  salvarLista();
}

// Eventos
addButton.addEventListener('click', adicionarItem);
inputItem.addEventListener('keypress', e => e.key==='Enter' && adicionarItem());
inputQtd.addEventListener('keypress', e => e.key==='Enter' && adicionarItem());

// PWA: registra service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

carregarLista();
