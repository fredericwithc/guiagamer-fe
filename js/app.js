// url da api
const API_URL = 'http://localhost:5000';

// elementos da pagina
const telaListaJogos = document.getElementById('lista-jogos');
const telaDetonado = document.getElementById('tela-detonado');
const jogosContainer = document.getElementById('jogos-container');
const infoJogo = document.getElementById('info-jogo');
const etapasContainer = document.getElementById('etapas-container');
const btnVoltar = document.getElementById('btn-voltar');

// elementos da tela de cadastrar jogo
const telaCadastrarJogo = document.getElementById('tela-cadastrar-jogo');
const btnCadastrarJogo = document.getElementById('btn-cadastrar-jogo');
const btnVoltarCadastro = document.getElementById('btn-voltar-cadastro');
const formCadastrarJogo = document.getElementById('form-cadastrar-jogo');
const btnCancelar = document.getElementById('btn-cancelar');

// elementos da tela de cadastrar etapa
const telaCadastrarEtapa = document.getElementById('tela-cadastrar-etapa');
const btnCadastrarEtapa = document.getElementById('btn-cadastrar-etapa');
const btnVoltarEtapa = document.getElementById('btn-voltar-etapa');
const formCadastrarEtapa = document.getElementById('form-cadastrar-etapa');
const btnCancelarEtapa = document.getElementById('btn-cancelar-etapa');
const nomeJogoEtapa = document.getElementById('nome-jogo-etapa');


// carrega a lista de jogos da api
async function carregarJogos() {
    try {
        const resposta = await fetch(`${API_URL}/listar_jogos`);
        const jogos = await resposta.json();

        jogosContainer.innerHTML = '';

        if (jogos.length === 0) {
            jogosContainer.innerHTML = '<p>Nenhum jogo cadastrado ainda.</p>';
            return;
        }

        jogos.forEach(jogo => {
            const card = document.createElement('div');
            card.classList.add('card-jogo');
            card.innerHTML = `
        <button class="btn-deletar-card" title="Deletar jogo">x</button>
        <h3>${jogo.nome}</h3>
        <p class="plataforma">${jogo.plataforma}</p>
        <p class="descricao">${jogo.descricao || 'Sem descrição'}</p>
    `;

            // botao de deletar
            const btnDeletar = card.querySelector('.btn-deletar-card');
            btnDeletar.addEventListener('click', (evento) => {
                evento.stopPropagation();
                deletarJogo(jogo);
            });

            // quando clicar no card, abre o detonado
            card.addEventListener('click', () => {
                abrirDetonado(jogo.id);
            });

            jogosContainer.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao carregar jogos:', erro);
        jogosContainer.innerHTML = '<p>Erro ao carregar jogos. Verifique se a API está rodando.</p>';
    }
}

// deleta um jogo apos confirmacao
async function deletarJogo(jogo) {
    const confirmacao = confirm(`Tem certeza que quer deletar o jogo "${jogo.nome}"?\n\nIsso vai apagar tambem todas as etapas dele!`);

    if (!confirmacao) return;

    try {
        const resposta = await fetch(`${API_URL}/deletar_jogo/${jogo.id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao deletar o jogo.');
            return;
        }

        alert('Jogo deletado com sucesso!');
        carregarJogos();

    } catch (erro) {
        console.error('Erro ao deletar jogo:', erro);
        alert('Erro ao conectar com a API.');
    }
}

// deleta uma etapa apos confirmacao
async function deletarEtapa(etapa) {
    const confirmacao = confirm(`Tem certeza que quer deletar a etapa "${etapa.titulo}"?`);

    if (!confirmacao) return;

    try {
        const resposta = await fetch(`${API_URL}/deletar_etapa/${etapa.id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao deletar a etapa.');
            return;
        }

        alert('Etapa deletada com sucesso!');
        abrirDetonado(jogoSelecionado.id);

    } catch (erro) {
        console.error('Erro ao deletar etapa:', erro);
        alert('Erro ao conectar com a API.');
    }
}

// abre a tela de detonado de um jogo especifico
async function abrirDetonado(jogoId) {
    telaListaJogos.style.display = 'none';
    telaCadastrarEtapa.style.display = 'none';
    telaDetonado.style.display = 'block';

    try {
        // busca os detalhes do jogo na api
        const respostaJogo = await fetch(`${API_URL}/buscar_jogo/${jogoId}`);

        if (!respostaJogo.ok) {
            infoJogo.innerHTML = '<p>Erro ao carregar o jogo.</p>';
            return;
        }

        const jogo = await respostaJogo.json();
        jogoSelecionado = jogo;

        infoJogo.innerHTML = `
            <h2>${jogo.nome}</h2>
            <p class="plataforma">${jogo.plataforma}</p>
            <p class="descricao">${jogo.descricao || 'Sem descrição'}</p>
        `;

        // busca as etapas do jogo
        const respostaEtapas = await fetch(`${API_URL}/listar_etapas/${jogo.id}`);
        const etapas = await respostaEtapas.json();

        etapasContainer.innerHTML = '';

        if (etapas.length === 0) {
            etapasContainer.innerHTML = '<p>Nenhuma etapa cadastrada para este jogo ainda.</p>';
            return;
        }

        const etapasConcluidas = pegarConcluidas(jogo.id);

        etapas.forEach(etapa => {
            const card = criarCardEtapa(etapa, etapasConcluidas, jogo.id);
            etapasContainer.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao carregar detonado:', erro);
        etapasContainer.innerHTML = '<p>Erro ao conectar com a API.</p>';
    }
}


// cria o card de uma etapa com os botoes de pista
function criarCardEtapa(etapa, etapasConcluidas, jogoId) {
    const card = document.createElement('div');
    card.classList.add('card-etapa');

    const estaConcluida = etapasConcluidas.includes(etapa.id);
    if (estaConcluida) {
        card.classList.add('concluida');
    }

    card.innerHTML = `
    <div class="etapa-cabecalho">
        <span class="etapa-numero">ETAPA ${etapa.numero}</span>
        <button class="btn-deletar-card" title="Deletar etapa">x</button>
    </div>
    <h3 class="etapa-titulo">${etapa.titulo}</h3>
    
    <div class="pistas-botoes">
        <button class="btn-pista" data-nivel="leve">> Dica leve</button>
        <button class="btn-pista" data-nivel="media">>> Dica direta</button>
        <button class="btn-pista" data-nivel="completa">>>> Passo completo</button>
    </div>
    
    <div class="pista-revelada" style="display: none;"></div>
    
    <button class="btn-concluir ${estaConcluida ? 'concluida' : ''}">
        ${estaConcluida ? '✓ Etapa concluída' : 'Marcar como concluída'}
    </button>
`;

    const botoesPista = card.querySelectorAll('.btn-pista');
    const areaPista = card.querySelector('.pista-revelada');
    const btnConcluir = card.querySelector('.btn-concluir');

    botoesPista.forEach(botao => {
        botao.addEventListener('click', () => {
            const nivel = botao.dataset.nivel;

            // se ja estava ativo, fecha a pista
            if (botao.classList.contains('ativo')) {
                botao.classList.remove('ativo');
                areaPista.style.display = 'none';
                areaPista.innerHTML = '';
                return;
            }

            // tira o ativo dos outros botoes desse card
            botoesPista.forEach(b => b.classList.remove('ativo'));

            botao.classList.add('ativo');

            // pega o texto da pista correspondente ao nivel
            let textoPista = '';
            if (nivel === 'leve') textoPista = etapa.pista_leve;
            if (nivel === 'media') textoPista = etapa.pista_media;
            if (nivel === 'completa') textoPista = etapa.resposta_completa;

            areaPista.innerHTML = textoPista;
            areaPista.style.display = 'block';
        });
    });

    btnConcluir.addEventListener('click', () => {
        toggleConcluida(jogoId, etapa.id, card, btnConcluir);
    });

    // botao de deletar etapa
    const btnDeletarEtapa = card.querySelector('.btn-deletar-card');
    btnDeletarEtapa.addEventListener('click', () => {
        deletarEtapa(etapa);
    });

    return card;
}


// pega do localstorage quais etapas ja foram concluidas
function pegarConcluidas(jogoId) {
    const chave = `progresso_jogo_${jogoId}`;
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
}


// marca ou desmarca uma etapa como concluida
function toggleConcluida(jogoId, etapaId, card, botao) {
    const chave = `progresso_jogo_${jogoId}`;
    let concluidas = pegarConcluidas(jogoId);

    if (concluidas.includes(etapaId)) {
        // desmarca
        concluidas = concluidas.filter(id => id !== etapaId);
        card.classList.remove('concluida');
        botao.classList.remove('concluida');
        botao.textContent = 'Marcar como concluída';
    } else {
        // marca
        concluidas.push(etapaId);
        card.classList.add('concluida');
        botao.classList.add('concluida');
        botao.textContent = '✓ Etapa concluída';
    }

    localStorage.setItem(chave, JSON.stringify(concluidas));
}


// botao de voltar pra lista de jogos
btnVoltar.addEventListener('click', () => {
    telaDetonado.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

// abre a tela de cadastrar jogo
btnCadastrarJogo.addEventListener('click', () => {
    telaListaJogos.style.display = 'none';
    telaCadastrarJogo.style.display = 'block';
});


// volta da tela de cadastrar para a lista
btnVoltarCadastro.addEventListener('click', () => {
    telaCadastrarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});


// botao cancelar - mesma coisa que voltar mas tambem limpa o formulario
btnCancelar.addEventListener('click', () => {
    formCadastrarJogo.reset();
    telaCadastrarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});


// quando enviar o formulario, cadastra o jogo na api
formCadastrarJogo.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('input-nome').value;
    const plataforma = document.getElementById('input-plataforma').value;
    const descricao = document.getElementById('input-descricao').value;

    const novoJogo = {
        nome: nome,
        plataforma: plataforma,
        descricao: descricao
    };

    try {
        const resposta = await fetch(`${API_URL}/cadastrar_jogo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoJogo)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert('Erro ao cadastrar: ' + erro.erro);
            return;
        }

        alert('Jogo cadastrado com sucesso!');
        formCadastrarJogo.reset();

        // volta pra lista e recarrega os jogos
        telaCadastrarJogo.style.display = 'none';
        telaListaJogos.style.display = 'block';
        carregarJogos();

    } catch (erro) {
        console.error('Erro ao cadastrar jogo:', erro);
        alert('Erro ao conectar com a API. Verifique se o servidor está rodando.');
    }
});

// guarda o jogo selecionado pra usar no cadastro de etapa
let jogoSelecionado = null;


// abre a tela de cadastrar etapa (so se tiver um jogo selecionado)
btnCadastrarEtapa.addEventListener('click', () => {
    if (!jogoSelecionado) return;

    nomeJogoEtapa.textContent = jogoSelecionado.nome;
    telaDetonado.style.display = 'none';
    telaCadastrarEtapa.style.display = 'block';
});


// volta para a tela de detonado
btnVoltarEtapa.addEventListener('click', () => {
    telaCadastrarEtapa.style.display = 'none';
    telaDetonado.style.display = 'block';
});


// cancelar - limpa o form e volta
btnCancelarEtapa.addEventListener('click', () => {
    formCadastrarEtapa.reset();
    telaCadastrarEtapa.style.display = 'none';
    telaDetonado.style.display = 'block';
});


// envia o formulario de etapa para a api
formCadastrarEtapa.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const novaEtapa = {
        jogo_id: jogoSelecionado.id,
        numero: parseInt(document.getElementById('input-numero').value),
        titulo: document.getElementById('input-titulo').value,
        pista_leve: document.getElementById('input-pista-leve').value,
        pista_media: document.getElementById('input-pista-media').value,
        resposta_completa: document.getElementById('input-resposta-completa').value
    };

    try {
        const resposta = await fetch(`${API_URL}/cadastrar_etapa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaEtapa)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert('Erro ao cadastrar: ' + erro.erro);
            return;
        }

        alert('Etapa cadastrada com sucesso!');
        formCadastrarEtapa.reset();

        // volta pra tela de detonado e recarrega as etapas
        telaCadastrarEtapa.style.display = 'none';
        abrirDetonado(jogoSelecionado.id);

    } catch (erro) {
        console.error('Erro ao cadastrar etapa:', erro);
        alert('Erro ao conectar com a API.');
    }
});

// verifica se a api esta online ao iniciar
async function verificarApi() {
    try {
        const resposta = await fetch(`${API_URL}/`);
        const dados = await resposta.json();
        console.log('API online:', dados.mensagem, '- Versão:', dados.versao);
    } catch (erro) {
        console.error('API offline. Verifique se o servidor está rodando.');
    }
}


// inicia o app
verificarApi();
carregarJogos();