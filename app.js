// Mensagens para confirmar que o arquivo foi carregado
console.log("app.js carregado");
console.log("✅ app.js versão nova carregada");

// Seleciona os elementos da página que vamos usar depois
const inputItem = document.getElementById('itemInput');
const inputQtd = document.getElementById('quantidadeInput');
const addButton = document.getElementById('addButton');
const shoppingList = document.getElementById('shoppingList');
const clearButton = document.getElementById('clearButton');
const inputPreco = document.getElementById('precoInput');

// Prepara a janela modal (janela que aparece para confirmar remoção)
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
let pendingRemovalLi = null;  // Guarda qual item está esperando para ser removido

// 1. Quando clica no botão "Remover" da janela de confirmação
document.getElementById('modalConfirm').addEventListener('click', () => {
  if (pendingRemovalLi) {
    pendingRemovalLi.remove();  // Apaga o item da lista na tela
    salvarLista();              // Atualiza a lista salva no navegador
    confirmModal.hide();        // Fecha a janela de confirmação
  }
});

// 2. Quando clica no botão "Limpar Lista"
clearButton.addEventListener('click', () => {
  console.log('Botão limpar lista clicado');
  shoppingList.innerHTML = '';             // Apaga todos os itens da lista que aparece na tela
  localStorage.removeItem('listaCompras'); // Apaga a lista salva no navegador (memória do navegador)

  // Limpar campos e colocar foco no nome para facilitar nova entrada
  inputItem.value = '';
  inputQtd.value = 1;
  inputPreco.value = '';
  inputItem.focus();
});


// Função para carregar a lista salva no navegador e mostrar na tela
function carregarLista() {
  const data = localStorage.getItem('listaCompras'); // Pega a lista salva
  if (!data) return; // Se não tiver nada salvo, sai da função
  JSON.parse(data).forEach(adicionarItemNaTela); // Para cada item salvo, mostra na tela
}

// Função para salvar a lista atual no navegador
function salvarLista() {
  const itens = [];
  shoppingList.querySelectorAll('li').forEach(li => {
    itens.push({
      nome: li.dataset.nome,
      quantidade: 1,
      preco: parseFloat(li.dataset.preco),
      comprado: li.dataset.comprado === "true"
    });
  });
  localStorage.setItem('listaCompras', JSON.stringify(itens)); // Guarda a lista no navegador
}

// Função que cria e mostra um item na lista na tela
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

  // 4. Quando marca ou desmarca o checkbox de comprado
  cb.addEventListener('change', () => {
    li.dataset.comprado = cb.checked;  // Atualiza se o item está comprado ou não
    salvarLista();                     // Salva essa mudança no navegador
    spanItem.style.textDecoration = cb.checked ? 'line-through' : 'none'; // Riscado se comprado
  });

  const spanItem = document.createElement('span');
  spanItem.textContent = `${item.nome} (${item.quantidade}) - R$ ${parseFloat(item.preco).toFixed(2)}`;
  spanItem.className = 'form-check-label ms-2';
  if (item.comprado) spanItem.style.textDecoration = 'line-through';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-outline-secondary';
  editBtn.textContent = '✏️';

  // 5. Quando clica no botão de editar o item
  editBtn.addEventListener('click', () => editarItem(li));

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-sm btn-outline-danger';
  removeBtn.textContent = '🗑️';

  // 6. Quando clica no botão para remover item (abre janela de confirmação)
  removeBtn.addEventListener('click', () => {
    pendingRemovalLi = li;        // Marca este item como pendente para remoção
    confirmModal.show();          // Mostra a janela perguntando "Tem certeza?"
  });

  div.append(cb, spanItem);
  btnGroup.append(editBtn, removeBtn);
  li.append(div, btnGroup);
  shoppingList.append(li);       // Mostra o item na lista na tela
}

// Função para adicionar um item quando o usuário clica ou aperta enter
function adicionarItem() {
  const nome = inputItem.value.trim();
  const qtd = parseInt(inputQtd.value);
  const preco = parseFloat(inputPreco.value);

  // Verifica se os dados estão corretos (não vazios e números válidos)
  if (!nome || isNaN(qtd) || qtd < 1 || isNaN(preco) || preco < 0) return;

  // Adiciona o item a quantidade de vezes pedida (ex: 3 unidades do mesmo item)
  for (let i = 0; i < qtd; i++) {
    adicionarItemNaTela({ nome, quantidade: 1, preco, comprado: false });
  }

  salvarLista();      // Salva a lista atualizada no navegador
  inputItem.value = '';  // Limpa o campo de nome
  inputQtd.value = 1;    // Reseta quantidade para 1
  inputPreco.value = ''; // Limpa o preço
  inputItem.focus();     // Coloca o cursor de volta para digitar novo item
}

// Função para editar o nome, quantidade e preço de um item existente
function editarItem(li) {
  const nome = prompt('Novo nome:', li.dataset.nome);
  const qtd = prompt('Nova quantidade:', li.dataset.qtd);
  const preco = prompt('Novo preço (use ponto para decimais):', li.dataset.preco);

  // Confere se os dados estão corretos antes de aplicar
  if (!nome || isNaN(qtd) || qtd < 1 || isNaN(preco)) return;

  li.dataset.nome = nome;
  li.dataset.qtd = qtd;
  li.dataset.preco = parseFloat(preco).toFixed(2);

  li.querySelector('.form-check-label').textContent = `${nome} (${qtd}) - R$ ${parseFloat(preco).toFixed(2)}`;
  salvarLista();  // Salva as mudanças no navegador
}

// 3. Quando o botão "Adicionar" é clicado, chama a função para adicionar item
addButton.addEventListener('click', adicionarItem);

// 7. Quando qualquer tecla é pressionada na janela (global)
window.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {   // Se a tecla pressionada for Enter:
    const nome = inputItem.value.trim();
    const qtd = inputQtd.value.trim();
    const preco = inputPreco.value.trim();

    const camposVazios = !nome && !qtd && !preco;   // Tudo vazio?
    const camposPreenchidos =
      nome &&
      !isNaN(parseInt(qtd)) && parseInt(qtd) > 0 &&
      !isNaN(parseFloat(preco)) && parseFloat(preco) >= 0;

    if (camposVazios) {
      shoppingList.innerHTML = '';             // Se campos vazios, limpa a lista
      localStorage.removeItem('listaCompras'); // Apaga a lista salva no navegador
    } else if (camposPreenchidos) {
      adicionarItem();                        // Se campos preenchidos corretamente, adiciona item
    }
    // Se os campos estão incompletos, não faz nada para evitar erros
  }
});

// PWA: registra o service worker para funcionar offline e outras funções avançadas
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Ao carregar a página, mostra os itens que estavam salvos no navegador
carregarLista();
