// Mensagens para confirmar que o arquivo foi carregado
console.log("app.js carregado");
console.log("✅ app.js versão nova carregada");

// Seleciona elementos da página
const inputItem = document.getElementById('itemInput');
const inputQtd = document.getElementById('quantidadeInput');
const inputPreco = document.getElementById('precoInput');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const shoppingList = document.getElementById('shoppingList');
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const spanAdicionados = document.getElementById('contadorAdicionados');
const spanRemovidos = document.getElementById('contadorRemovidos');

let pendingRemovalLi = null;  // Item aguardando confirmação de remoção

// Inicializa os contadores a partir do localStorage ou zero
let contadorAdicionados = parseInt(localStorage.getItem('contadorAdicionados')) || 0;
let contadorRemovidos = parseInt(localStorage.getItem('contadorRemovidos')) || 0;

// Atualiza os contadores na tela e salva no localStorage
function atualizarContadores() {
  spanAdicionados.textContent = contadorAdicionados;
  spanRemovidos.textContent = contadorRemovidos;
  localStorage.setItem('contadorAdicionados', contadorAdicionados);
  localStorage.setItem('contadorRemovidos', contadorRemovidos);
}

// Função para salvar a lista atual no localStorage
function salvarLista() {
  const itens = [];
  shoppingList.querySelectorAll('li').forEach(li => {
    itens.push({
      nome: li.dataset.nome,
      quantidade: parseInt(li.dataset.qtd),
      preco: parseFloat(li.dataset.preco),
      comprado: li.dataset.comprado === "true"
    });
  });
  localStorage.setItem('listaCompras', JSON.stringify(itens));
}

// Função para adicionar item na tela
function adicionarItemNaTela(item) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.dataset.nome = item.nome;
  li.dataset.qtd = item.quantidade;
  li.dataset.preco = item.preco;
  li.dataset.comprado = item.comprado;

  const div = document.createElement('div');
  div.className = 'form-check';

  const cb = document.createElement('input');
  cb.className = 'form-check-input';
  cb.type = 'checkbox';
  cb.checked = item.comprado;

  const spanItem = document.createElement('span');
  spanItem.textContent = `${item.nome} (${item.quantidade}) - R$ ${parseFloat(item.preco).toFixed(2)}`;
  spanItem.className = 'form-check-label ms-2';
  if (item.comprado) spanItem.style.textDecoration = 'line-through';

  cb.addEventListener('change', () => {
    li.dataset.comprado = cb.checked;
    spanItem.style.textDecoration = cb.checked ? 'line-through' : 'none';
    salvarLista();
  });

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

// Função para carregar a lista salva do localStorage
function carregarLista() {
  const data = localStorage.getItem('listaCompras');
  if (!data) return;
  const itens = JSON.parse(data);
  itens.forEach(adicionarItemNaTela);
}

// Função para adicionar itens a partir dos inputs
function adicionarItem() {
  const nome = inputItem.value.trim();
  const qtd = parseInt(inputQtd.value);
  const preco = parseFloat(inputPreco.value);

  if (!nome || isNaN(qtd) || qtd < 1 || isNaN(preco) || preco < 0) return;

  for (let i = 0; i < qtd; i++) {
    adicionarItemNaTela({ nome, quantidade: 1, preco, comprado: false });
    contadorAdicionados++;
  }

  atualizarContadores();
  salvarLista();

  inputItem.value = '';
  inputQtd.value = 1;
  inputPreco.value = '';
  inputItem.focus();
}

// Função para editar um item da lista
function editarItem(li) {
  const nome = prompt('Novo nome:', li.dataset.nome);
  const qtd = prompt('Nova quantidade:', li.dataset.qtd);
  const preco = prompt('Novo preço (use ponto para decimais):', li.dataset.preco);

  if (!nome || isNaN(qtd) || qtd < 1 || isNaN(preco)) return;

  li.dataset.nome = nome;
  li.dataset.qtd = qtd;
  li.dataset.preco = parseFloat(preco).toFixed(2);

  li.querySelector('.form-check-label').textContent = `${nome} (${qtd}) - R$ ${parseFloat(preco).toFixed(2)}`;
  salvarLista();
}

// Eventos

// Confirmar remoção do item
document.getElementById('modalConfirm').addEventListener('click', () => {
  if (pendingRemovalLi) {
    pendingRemovalLi.remove();
    contadorRemovidos++;
    atualizarContadores();
    salvarLista();
    confirmModal.hide();
  }
});

// Botão limpar lista
clearButton.addEventListener('click', () => {
  const totalItens = shoppingList.querySelectorAll('li').length;
  contadorRemovidos += totalItens;
  shoppingList.innerHTML = '';
  localStorage.removeItem('listaCompras');
  atualizarContadores();

  inputItem.value = '';
  inputQtd.value = 1;
  inputPreco.value = '';
  inputItem.focus();
});

// Botão adicionar
addButton.addEventListener('click', adicionarItem);

// Adicionar ao pressionar Enter (em qualquer lugar)
window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const nome = inputItem.value.trim();
    const qtd = inputQtd.value.trim();
    const preco = inputPreco.value.trim();

    const camposVazios = !nome && !qtd && !preco;
    const camposPreenchidos =
      nome &&
      !isNaN(parseInt(qtd)) && parseInt(qtd) > 0 &&
      !isNaN(parseFloat(preco)) && parseFloat(preco) >= 0;

    if (camposVazios) {
      shoppingList.innerHTML = '';
      localStorage.removeItem('listaCompras');
      contadorAdicionados = 0;
      contadorRemovidos = 0;
      atualizarContadores();
    } else if (camposPreenchidos) {
      adicionarItem();
    }
  }
});

// PWA: registra o service worker (se houver)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Inicialização ao carregar a página
carregarLista();
atualizarContadores();
