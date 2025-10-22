// --- Funções de Impressão e Histórico ---

// Função para formatar o texto para a largura da impressora térmica
function formatarTexto(texto, largura = 32) { // Largura comum para papel de 58mm
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    palavras.forEach(palavra => {
        if (linhaAtual.length + palavra.length + 1 > largura) {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra + ' ';
        } else {
            linhaAtual += palavra + ' ';
        }
    });
    if (linhaAtual) linhas.push(linhaAtual.trim());
    
    return linhas.join('\n');
}

// Carrega o histórico salvo no navegador
function carregarHistorico() {
    return JSON.parse(localStorage.getItem('historico_pedidos')) || [];
}

// Salva o histórico no navegador
function salvarHistorico(historico) {
    localStorage.setItem('historico_pedidos', JSON.stringify(historico));
}

// Mostra a lista de pedidos salvos na tela
function atualizarListaHistorico() {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '';
    const historico = carregarHistorico();
    
    // Inverte a lista para mostrar os mais recentes primeiro
    historico.slice().reverse().forEach((pedido, indexReverso) => {
        const li = document.createElement('li');
        const textoAmostra = pedido.texto.length > 40 ? `${pedido.texto.substring(0, 40)}...` : pedido.texto;
        li.textContent = `${pedido.dataHora} - ${textoAmostra}`;
        
        // O índice original é necessário para recuperar o item correto do array
        const indiceOriginal = historico.length - 1 - indexReverso;
        li.onclick = () => selecionarItem(li, indiceOriginal);
        
        lista.appendChild(li);
    });
}

let itemSelecionadoIndex = null;
function selecionarItem(elemento, index) {
    // Remove a classe 'selected' de todos os itens da lista
    document.querySelectorAll('#lista-historico li').forEach(li => li.classList.remove('selected'));
    // Adiciona a classe 'selected' ao item que foi clicado
    elemento.classList.add('selected');
    itemSelecionadoIndex = index;
}

function salvarEImprimirPedido() {
    const texto = document.getElementById('pedido-text').value.trim();
    if (!texto) {
        alert('Digite um pedido antes de imprimir.');
        return;
    }

    // 1. Salva o pedido no histórico
    const dataHora = new Date().toLocaleString('pt-BR');
    const historico = carregarHistorico();
    historico.push({ texto, dataHora });
    salvarHistorico(historico);
    
    // 2. Prepara o conteúdo para impressão
    const conteudo = `Pedido:\n--------------------------------\n${formatarTexto(texto)}\n--------------------------------\nData/Hora: ${dataHora}`;
    imprimirConteudo(conteudo);

    // 3. Limpa a área de texto e atualiza a lista do histórico
    document.getElementById('pedido-text').value = '';
    atualizarListaHistorico();
    alert('Pedido impresso e salvo no histórico!');
}

function imprimirSelecionado() {
    if (itemSelecionadoIndex === null) {
        alert('Selecione um pedido do histórico para imprimir.');
        return;
    }
    const historico = carregarHistorico();
    const pedido = historico[itemSelecionadoIndex];
    const conteudo = `Pedido (Reimpressão):\n--------------------------------\n${formatarTexto(pedido.texto)}\n--------------------------------\nData/Hora: ${pedido.dataHora}`;
    imprimirConteudo(conteudo);
}

function imprimirConteudo(conteudo) {
    const printWindow = window.open('', '_blank', 'width=280,height=500'); // Janela com tamanho similar ao de um cupom
    printWindow.document.write(`
        <html>
        <head><title>Imprimir Pedido</title></head>
        <body style="font-family: monospace; white-space: pre-wrap; margin: 0; padding: 10px; font-size: 12px;">${conteudo}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus(); 
    printWindow.print();
    // printWindow.close(); // Comentei para que a janela não feche automaticamente após a impressão.
}

function atualizarHistorico() {
    atualizarListaHistorico();
    itemSelecionadoIndex = null; // Limpa a seleção ao atualizar a lista
}

// --- Função de Alternância de Abas ---

// Função para alternar entre as abas "Novo Pedido" e "Histórico"
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    // Se for para a aba Histórico, atualiza a lista
    if (tabId === 'historico') {
        atualizarListaHistorico();
    }
}

// Carrega o histórico assim que a página é aberta e garante a aba inicial
document.addEventListener('DOMContentLoaded', () => {
    // Garante que a primeira aba ('novo') esteja ativa por padrão
    showTab('novo');
    atualizarListaHistorico();
});