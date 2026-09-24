// url da api
const API_URL = 'http://localhost:5000';

// elementos da pagina
const telaListaJogos = document.getElementById('lista-jogos');
const telaDetonado = document.getElementById('tela-detonado');
const jogosContainer = document.getElementById('jogos-container');
const btnVoltar = document.getElementById('btn-voltar');
const sidebarCapa = document.getElementById('sidebar-capa');
const sidebarNomeJogo = document.getElementById('sidebar-nome-jogo');
const sidebarPlataforma = document.getElementById('sidebar-plataforma');
const progressoPercentual = document.getElementById('progresso-percentual');
const barraProgressoFill = document.getElementById('barra-progresso-fill');
const progressoTexto = document.getElementById('progresso-texto');
const listaEtapasNav = document.getElementById('lista-etapas-nav');
const painelEtapa = document.getElementById('painel-etapa');

// elementos da tela de cadastrar jogo
const telaCadastrarJogo = document.getElementById('tela-cadastrar-jogo');
const btnCadastrarJogo = document.getElementById('btn-cadastrar-jogo');
const btnVoltarCadastro = document.getElementById('btn-voltar-cadastro');
const formCadastrarJogo = document.getElementById('form-cadastrar-jogo');
const btnCancelar = document.getElementById('btn-cancelar');

// elementos da tela de editar jogo
const telaEditarJogo = document.getElementById('tela-editar-jogo');
const btnVoltarEditarJogo = document.getElementById('btn-voltar-editar-jogo');
const btnCancelarEditarJogo = document.getElementById('btn-cancelar-editar-jogo');
const formEditarJogo = document.getElementById('form-editar-jogo');

// elementos da tela de cadastrar etapa
const telaCadastrarEtapa = document.getElementById('tela-cadastrar-etapa');
const btnCadastrarEtapa = document.getElementById('btn-cadastrar-etapa');
const btnVoltarEtapa = document.getElementById('btn-voltar-etapa');
const formCadastrarEtapa = document.getElementById('form-cadastrar-etapa');
const btnCancelarEtapa = document.getElementById('btn-cancelar-etapa');
const nomeJogoEtapa = document.getElementById('nome-jogo-etapa');

// elementos da tela de editar etapa
const telaEditarEtapa = document.getElementById('tela-editar-etapa');
const btnVoltarEditarEtapa = document.getElementById('btn-voltar-editar-etapa');
const btnCancelarEditarEtapa = document.getElementById('btn-cancelar-editar-etapa');
const formEditarEtapa = document.getElementById('form-editar-etapa');

// elementos da busca externa
const btnBuscarExterno = document.getElementById('btn-buscar-externo');
const resultadosExternos = document.getElementById('resultados-externos');
const inputImagemUrl = document.getElementById('input-imagem-url');
const inputNome = document.getElementById('input-nome');

// estado da tela de detonado
let jogoSelecionado = null;
let etapasDoJogo = [];
let indiceEtapaAtiva = 0;

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
}

function definirModoDetonado(ativo) {
    document.body.classList.toggle('modo-detonado', ativo);
}

function fecharMenusEtapa() {
    document.querySelectorAll('.menu-etapa.aberto').forEach(menu => {
        menu.classList.remove('aberto');
    });
}

function extrairAno(descricao) {
    const dataCompleta = (descricao || '').match(/(\d{4})-\d{2}-\d{2}/);
    if (dataCompleta) return dataCompleta[1];
    const lancadoEm = (descricao || '').match(/Lancado em (\d{4})/i);
    return lancadoEm ? lancadoEm[1] : '';
}

function criarCardNovoJogo() {
    const card = document.createElement('button');
    card.type = 'button';
    card.classList.add('card-novo-jogo');
    card.innerHTML = '<span>+</span>Novo jogo';
    card.addEventListener('click', () => {
        btnCadastrarJogo.click();
    });
    return card;
}

// carrega a lista de jogos da api
async function carregarJogos() {
    const contadorJogos = document.getElementById('contador-jogos');

    try {
        const resposta = await fetch(`${API_URL}/listar_jogos`);
        const jogos = await resposta.json();

        jogosContainer.innerHTML = '';
        if (contadorJogos) {
            contadorJogos.textContent = jogos.length;
        }

        const jogosComEtapas = await Promise.all(jogos.map(async (jogo) => {
            try {
                const respostaEtapas = await fetch(`${API_URL}/listar_etapas/${jogo.id}`);
                const etapas = respostaEtapas.ok ? await respostaEtapas.json() : [];
                return {
                    jogo,
                    etapas: Array.isArray(etapas) ? etapas.filter(etapa => etapa.jogo_id === jogo.id) : []
                };
            } catch (erro) {
                return { jogo, etapas: [] };
            }
        }));

        jogosComEtapas.forEach(({ jogo, etapas }) => {
            const card = document.createElement('div');
            card.classList.add('card-jogo');

            const total = etapas.length;
            const concluidas = pegarConcluidas(jogo.id).filter(id =>
                etapas.some(etapa => etapa.id === id)
            ).length;
            const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);
            const naoIniciado = total === 0 || concluidas === 0;
            const textoProgresso = naoIniciado ? 'Não iniciado' : `${concluidas} de ${total} etapas`;
            const ano = extrairAno(jogo.descricao);
            const meta = ano
                ? `<span class="plataforma">${escaparHtml(jogo.plataforma)}</span> · ${escaparHtml(ano)}`
                : `<span class="plataforma">${escaparHtml(jogo.plataforma)}</span>`;

            const imagemHtml = jogo.imagem_url
                ? `<img src="${escaparHtml(jogo.imagem_url)}" alt="${escaparHtml(jogo.nome)}" class="capa-jogo">`
                : `<div class="capa-placeholder">capa</div>`;

            card.innerHTML = `
    <div class="poster-jogo">
        ${imagemHtml}
        <div class="acoes-poster">
            <button class="btn-editar-card" title="Editar jogo">✎</button>
            <button class="btn-deletar-card" title="Deletar jogo">×</button>
        </div>
    </div>
    <div class="barra-progresso-poster">
        <div class="barra-progresso-poster-fill" style="width: ${percentual}%"></div>
    </div>
    <div class="info-card">
        <h3>${escaparHtml(jogo.nome)}</h3>
        <p class="meta-jogo">${meta}</p>
        <p class="progresso-card ${naoIniciado ? 'nao-iniciado' : ''}">${textoProgresso}</p>
    </div>
`;

            const btnDeletar = card.querySelector('.btn-deletar-card');
            btnDeletar.addEventListener('click', (evento) => {
                evento.stopPropagation();
                deletarJogo(jogo);
            });

            const btnEditar = card.querySelector('.btn-editar-card');
            btnEditar.addEventListener('click', (evento) => {
                evento.stopPropagation();
                abrirEditarJogo(jogo);
            });

            card.addEventListener('click', () => {
                abrirDetonado(jogo.id);
            });

            jogosContainer.appendChild(card);
        });

        jogosContainer.appendChild(criarCardNovoJogo());
    } catch (erro) {
        console.error('Erro ao carregar jogos:', erro);
        jogosContainer.innerHTML = '<p>Erro ao carregar jogos. Verifique se a API está rodando.</p>';
        if (contadorJogos) {
            contadorJogos.textContent = '';
        }
    }
}

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
        const proxima = etapasDoJogo.find(item => item.id !== etapa.id);
        abrirDetonado(jogoSelecionado.id, proxima ? proxima.id : null);

    } catch (erro) {
        console.error('Erro ao deletar etapa:', erro);
        alert('Erro ao conectar com a API.');
    }
}

async function abrirDetonado(jogoId, etapaIdPreferida, numeroPreferido) {
    telaListaJogos.style.display = 'none';
    telaCadastrarEtapa.style.display = 'none';
    telaEditarEtapa.style.display = 'none';
    telaDetonado.style.display = 'block';
    definirModoDetonado(true);

    try {
        const respostaJogo = await fetch(`${API_URL}/buscar_jogo/${jogoId}`);

        if (!respostaJogo.ok) {
            painelEtapa.innerHTML = '<div class="painel-vazio"><p>Erro ao carregar o jogo.</p></div>';
            return;
        }

        const jogo = await respostaJogo.json();
        const mesmoJogo = jogoSelecionado && jogoSelecionado.id === jogo.id;
        jogoSelecionado = jogo;

        const respostaEtapas = await fetch(`${API_URL}/listar_etapas/${jogo.id}`);
        const etapas = await respostaEtapas.json();
        etapasDoJogo = etapas.slice().sort((a, b) => a.numero - b.numero);

        if (etapaIdPreferida != null) {
            const indice = etapasDoJogo.findIndex(etapa => etapa.id === etapaIdPreferida);
            indiceEtapaAtiva = indice >= 0 ? indice : 0;
        } else if (numeroPreferido != null) {
            const indice = etapasDoJogo.findIndex(etapa => etapa.numero === numeroPreferido);
            indiceEtapaAtiva = indice >= 0 ? indice : 0;
        } else if (!mesmoJogo) {
            indiceEtapaAtiva = 0;
        } else if (etapasDoJogo.length === 0) {
            indiceEtapaAtiva = 0;
        } else {
            indiceEtapaAtiva = Math.min(indiceEtapaAtiva, etapasDoJogo.length - 1);
        }

        renderizarSidebar();
        mostrarEtapa(indiceEtapaAtiva);
    } catch (erro) {
        console.error('Erro ao carregar detonado:', erro);
        painelEtapa.innerHTML = '<div class="painel-vazio"><p>Erro ao conectar com a API.</p></div>';
    }
}

function atualizarProgresso() {
    if (!jogoSelecionado) return;

    const total = etapasDoJogo.length;
    const concluidas = pegarConcluidas(jogoSelecionado.id).filter(id =>
        etapasDoJogo.some(etapa => etapa.id === id)
    ).length;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    progressoPercentual.textContent = `${percentual}%`;
    barraProgressoFill.style.width = `${percentual}%`;
    progressoTexto.textContent = `${concluidas} de ${total} etapas concluídas`;
}

function renderizarSidebar() {
    const jogo = jogoSelecionado;

    if (jogo.imagem_url) {
        sidebarCapa.innerHTML = `<img src="${escaparHtml(jogo.imagem_url)}" alt="${escaparHtml(jogo.nome)}">`;
    } else {
        sidebarCapa.innerHTML = '<span>capa do jogo</span>';
    }

    sidebarNomeJogo.textContent = jogo.nome;
    sidebarPlataforma.textContent = jogo.plataforma || '';

    const concluidas = pegarConcluidas(jogo.id);

    listaEtapasNav.innerHTML = etapasDoJogo.map((etapa, indice) => {
        const concluida = concluidas.includes(etapa.id);
        const ativa = indice === indiceEtapaAtiva;
        const classes = ['item-etapa-nav'];
        if (concluida) classes.push('concluida');
        if (ativa) classes.push('ativa');

        const indicador = concluida && !ativa
            ? '<span class="indicador-check">✓</span>'
            : `<span class="indicador-numero">${escaparHtml(etapa.numero)}</span>`;

        return `
            <li class="${classes.join(' ')}" data-indice="${indice}">
                ${indicador}
                <span class="item-etapa-titulo">${escaparHtml(etapa.titulo)}</span>
                <div class="menu-etapa">
                    <button type="button" class="btn-menu-etapa" aria-label="Ações da etapa">···</button>
                    <div class="menu-etapa-lista">
                        <button type="button" class="menu-etapa-editar">Editar</button>
                        <button type="button" class="menu-etapa-excluir">Excluir</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    atualizarProgresso();
}

function mostrarEtapa(indice) {
    if (!etapasDoJogo.length) {
        indiceEtapaAtiva = 0;
        renderizarSidebar();
        painelEtapa.innerHTML = `
            <div class="painel-vazio">
                <p>Nenhuma etapa cadastrada para este jogo ainda.</p>
                <p>Use o botão + Cadastrar etapa para começar.</p>
            </div>
        `;
        return;
    }

    indiceEtapaAtiva = indice;
    const etapa = etapasDoJogo[indice];
    const total = etapasDoJogo.length;
    const concluida = pegarConcluidas(jogoSelecionado.id).includes(etapa.id);
    const numeroExibido = String(indice + 1).padStart(2, '0');

    painelEtapa.innerHTML = `
        <div class="painel-cabecalho">
            <span class="painel-etapa-numero">ETAPA ${numeroExibido} DE ${total}</span>
            <div class="painel-acoes">
                <button type="button" class="btn-icone-painel" data-acao="editar" title="Editar etapa">✎</button>
                <button type="button" class="btn-icone-painel" data-acao="excluir" title="Excluir etapa">×</button>
            </div>
        </div>
        <h2 class="painel-titulo">${escaparHtml(etapa.titulo)}</h2>
        <p class="painel-subtitulo">Revela quanto você quer saber. Nada é revelado sem você clicar.</p>
        <div class="acordeoes">
            <div class="acordeao" data-nivel="leve">
                <button type="button" class="acordeao-cabecalho">
                    <span class="icone-barras icone-barras-1" aria-hidden="true"><span></span></span>
                    <span class="acordeao-textos">
                        <strong>Dica leve</strong>
                        <small>um empurrãozinho, quase nada revelado</small>
                    </span>
                    <span class="acordeao-mais">+</span>
                </button>
                <div class="acordeao-corpo">${escaparHtml(etapa.pista_leve)}</div>
            </div>
            <div class="acordeao" data-nivel="media">
                <button type="button" class="acordeao-cabecalho">
                    <span class="icone-barras icone-barras-2" aria-hidden="true"><span></span><span></span></span>
                    <span class="acordeao-textos">
                        <strong>Dica direta</strong>
                        <small>diz o lugar, mas não o caminho</small>
                    </span>
                    <span class="acordeao-mais">+</span>
                </button>
                <div class="acordeao-corpo">${escaparHtml(etapa.pista_media)}</div>
            </div>
            <div class="acordeao acordeao-completo" data-nivel="completa">
                <button type="button" class="acordeao-cabecalho">
                    <span class="icone-barras icone-barras-3" aria-hidden="true"><span></span><span></span><span></span></span>
                    <span class="acordeao-textos">
                        <strong>Passo completo</strong>
                        <small>o guia inteiro desta etapa — spoiler total</small>
                    </span>
                    <span class="acordeao-mais">+</span>
                </button>
                <div class="acordeao-corpo">${escaparHtml(etapa.resposta_completa)}</div>
            </div>
        </div>
        <div class="painel-rodape">
            <button type="button" class="btn-concluir ${concluida ? 'concluida' : ''}">
                ${concluida ? 'Etapa concluída' : 'Marcar como concluída'}
            </button>
            <button type="button" class="btn-esconder-dicas">Esconder dicas</button>
            ${indice < total - 1 ? '<button type="button" class="btn-proxima-etapa">Próxima etapa →</button>' : ''}
        </div>
    `;

    painelEtapa.querySelectorAll('.acordeao-cabecalho').forEach(botao => {
        botao.addEventListener('click', () => {
            botao.closest('.acordeao').classList.toggle('aberto');
        });
    });

    painelEtapa.querySelector('[data-acao="editar"]').addEventListener('click', () => {
        abrirEditarEtapa(etapa);
    });

    painelEtapa.querySelector('[data-acao="excluir"]').addEventListener('click', () => {
        deletarEtapa(etapa);
    });

    painelEtapa.querySelector('.btn-concluir').addEventListener('click', (evento) => {
        toggleConcluida(jogoSelecionado.id, etapa.id, evento.currentTarget);
    });

    painelEtapa.querySelector('.btn-esconder-dicas').addEventListener('click', () => {
        painelEtapa.querySelectorAll('.acordeao').forEach(acordeao => {
            acordeao.classList.remove('aberto');
        });
    });

    const btnProxima = painelEtapa.querySelector('.btn-proxima-etapa');
    if (btnProxima) {
        btnProxima.addEventListener('click', () => {
            mostrarEtapa(indice + 1);
        });
    }

    renderizarSidebar();
}

function pegarConcluidas(jogoId) {
    const chave = `progresso_jogo_${jogoId}`;
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
}

function toggleConcluida(jogoId, etapaId, botao) {
    const chave = `progresso_jogo_${jogoId}`;
    let concluidas = pegarConcluidas(jogoId);

    if (concluidas.includes(etapaId)) {
        concluidas = concluidas.filter(id => id !== etapaId);
        botao.classList.remove('concluida');
        botao.textContent = 'Marcar como concluída';
    } else {
        concluidas.push(etapaId);
        botao.classList.add('concluida');
        botao.textContent = 'Etapa concluída';
    }

    localStorage.setItem(chave, JSON.stringify(concluidas));
    renderizarSidebar();
}

listaEtapasNav.addEventListener('click', (evento) => {
    const btnMenu = evento.target.closest('.btn-menu-etapa');
    if (btnMenu) {
        evento.stopPropagation();
        const menu = btnMenu.closest('.menu-etapa');
        const jaAberto = menu.classList.contains('aberto');
        fecharMenusEtapa();
        if (!jaAberto) {
            menu.classList.add('aberto');
        }
        return;
    }

    const item = evento.target.closest('.item-etapa-nav');
    if (!item) return;

    const indice = Number(item.dataset.indice);
    const etapa = etapasDoJogo[indice];

    if (evento.target.closest('.menu-etapa-editar')) {
        evento.stopPropagation();
        fecharMenusEtapa();
        abrirEditarEtapa(etapa);
        return;
    }

    if (evento.target.closest('.menu-etapa-excluir')) {
        evento.stopPropagation();
        fecharMenusEtapa();
        deletarEtapa(etapa);
        return;
    }

    mostrarEtapa(indice);
});

document.addEventListener('click', () => {
    fecharMenusEtapa();
});

function abrirEditarJogo(jogo) {
    document.getElementById('input-editar-nome').value = jogo.nome;
    document.getElementById('input-editar-plataforma').value = jogo.plataforma;
    document.getElementById('input-editar-descricao').value = jogo.descricao || '';
    document.getElementById('input-editar-imagem-url').value = jogo.imagem_url || '';
    document.getElementById('input-editar-jogo-id').value = jogo.id;

    definirModoDetonado(false);
    telaListaJogos.style.display = 'none';
    telaEditarJogo.style.display = 'block';
}

btnVoltarEditarJogo.addEventListener('click', () => {
    telaEditarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

btnCancelarEditarJogo.addEventListener('click', () => {
    telaEditarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

formEditarJogo.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = document.getElementById('input-editar-jogo-id').value;

    const jogoAtualizado = {
        nome: document.getElementById('input-editar-nome').value,
        plataforma: document.getElementById('input-editar-plataforma').value,
        descricao: document.getElementById('input-editar-descricao').value,
        imagem_url: document.getElementById('input-editar-imagem-url').value
    };

    try {
        const resposta = await fetch(`${API_URL}/atualizar_jogo/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jogoAtualizado)
        });

        if (!resposta.ok) {
            alert('Erro ao atualizar o jogo.');
            return;
        }

        alert('Jogo atualizado com sucesso!');

        telaEditarJogo.style.display = 'none';
        telaListaJogos.style.display = 'block';
        carregarJogos();

    } catch (erro) {
        console.error('Erro ao atualizar jogo:', erro);
        alert('Erro ao conectar com a API.');
    }
});

btnVoltar.addEventListener('click', () => {
    definirModoDetonado(false);
    telaDetonado.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

btnCadastrarJogo.addEventListener('click', () => {
    telaListaJogos.style.display = 'none';
    telaCadastrarJogo.style.display = 'block';
});

btnVoltarCadastro.addEventListener('click', () => {
    formCadastrarJogo.reset();
    resultadosExternos.innerHTML = '';
    document.getElementById('preview-capa').style.display = 'none';
    telaCadastrarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

btnCancelar.addEventListener('click', () => {
    formCadastrarJogo.reset();
    resultadosExternos.innerHTML = '';
    document.getElementById('preview-capa').style.display = 'none';
    telaCadastrarJogo.style.display = 'none';
    telaListaJogos.style.display = 'block';
});

formCadastrarJogo.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('input-nome').value;
    const plataforma = document.getElementById('input-plataforma').value;
    const descricao = document.getElementById('input-descricao').value;
    const imagemUrl = inputImagemUrl.value;

    const novoJogo = {
        nome: nome,
        plataforma: plataforma,
        descricao: descricao,
        imagem_url: imagemUrl
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
        document.getElementById('preview-capa').style.display = 'none';

        telaCadastrarJogo.style.display = 'none';
        telaListaJogos.style.display = 'block';
        carregarJogos();

    } catch (erro) {
        console.error('Erro ao cadastrar jogo:', erro);
        alert('Erro ao conectar com a API. Verifique se o servidor está rodando.');
    }
});

btnCadastrarEtapa.addEventListener('click', async () => {
    if (!jogoSelecionado) return;

    formCadastrarEtapa.reset();
    document.getElementById('input-numero').value = 1;

    try {
        const resposta = await fetch(`${API_URL}/listar_etapas/${jogoSelecionado.id}`);
        const etapas = resposta.ok ? await resposta.json() : [];
        const etapasDesteJogo = Array.isArray(etapas)
            ? etapas.filter(etapa => etapa.jogo_id === jogoSelecionado.id)
            : [];

        document.getElementById('input-numero').value = etapasDesteJogo.length + 1;
    } catch (erro) {
        console.error('Erro ao sugerir número da etapa:', erro);
        const etapasDesteJogo = etapasDoJogo.filter(etapa => etapa.jogo_id === jogoSelecionado.id);
        document.getElementById('input-numero').value = etapasDesteJogo.length + 1;
    }

    nomeJogoEtapa.textContent = jogoSelecionado.nome;
    definirModoDetonado(false);
    telaDetonado.style.display = 'none';
    telaCadastrarEtapa.style.display = 'block';
});

btnVoltarEtapa.addEventListener('click', () => {
    formCadastrarEtapa.reset();
    telaCadastrarEtapa.style.display = 'none';
    definirModoDetonado(true);
    telaDetonado.style.display = 'block';
});

btnCancelarEtapa.addEventListener('click', () => {
    formCadastrarEtapa.reset();
    telaCadastrarEtapa.style.display = 'none';
    definirModoDetonado(true);
    telaDetonado.style.display = 'block';
});

formCadastrarEtapa.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const numero = parseInt(document.getElementById('input-numero').value);

    const novaEtapa = {
        jogo_id: jogoSelecionado.id,
        numero: numero,
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

        telaCadastrarEtapa.style.display = 'none';
        abrirDetonado(jogoSelecionado.id, null, numero);

    } catch (erro) {
        console.error('Erro ao cadastrar etapa:', erro);
        alert('Erro ao conectar com a API.');
    }
});

function abrirEditarEtapa(etapa) {
    document.getElementById('input-editar-numero').value = etapa.numero;
    document.getElementById('input-editar-titulo').value = etapa.titulo;
    document.getElementById('input-editar-pista-leve').value = etapa.pista_leve;
    document.getElementById('input-editar-pista-media').value = etapa.pista_media;
    document.getElementById('input-editar-resposta-completa').value = etapa.resposta_completa;
    document.getElementById('input-editar-etapa-id').value = etapa.id;

    definirModoDetonado(false);
    telaDetonado.style.display = 'none';
    telaEditarEtapa.style.display = 'block';
}

btnVoltarEditarEtapa.addEventListener('click', () => {
    telaEditarEtapa.style.display = 'none';
    definirModoDetonado(true);
    telaDetonado.style.display = 'block';
});

btnCancelarEditarEtapa.addEventListener('click', () => {
    telaEditarEtapa.style.display = 'none';
    definirModoDetonado(true);
    telaDetonado.style.display = 'block';
});

formEditarEtapa.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = parseInt(document.getElementById('input-editar-etapa-id').value);

    const etapaAtualizada = {
        numero: parseInt(document.getElementById('input-editar-numero').value),
        titulo: document.getElementById('input-editar-titulo').value,
        pista_leve: document.getElementById('input-editar-pista-leve').value,
        pista_media: document.getElementById('input-editar-pista-media').value,
        resposta_completa: document.getElementById('input-editar-resposta-completa').value
    };

    try {
        const resposta = await fetch(`${API_URL}/atualizar_etapa/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(etapaAtualizada)
        });

        if (!resposta.ok) {
            alert('Erro ao atualizar a etapa.');
            return;
        }

        alert('Etapa atualizada com sucesso!');

        telaEditarEtapa.style.display = 'none';
        abrirDetonado(jogoSelecionado.id, id);

    } catch (erro) {
        console.error('Erro ao atualizar etapa:', erro);
        alert('Erro ao conectar com a API.');
    }
});

async function verificarApi() {
    try {
        const resposta = await fetch(`${API_URL}/`);
        const dados = await resposta.json();
        console.log('API online:', dados.mensagem, '- Versão:', dados.versao);
    } catch (erro) {
        console.error('API offline. Verifique se o servidor está rodando.');
    }
}

async function buscarJogoExterno(nome) {
    if (!nome) {
        resultadosExternos.innerHTML = '';
        return;
    }

    resultadosExternos.innerHTML = '<p class="aviso-buscando">Buscando...</p>';

    try {
        const resposta = await fetch(`${API_URL}/buscar_jogo_externo?nome=${encodeURIComponent(nome)}`);

        if (!resposta.ok) {
            resultadosExternos.innerHTML = '<p class="aviso-buscando">Nenhum jogo encontrado.</p>';
            return;
        }

        const jogos = await resposta.json();
        mostrarResultadosExternos(jogos);

    } catch (erro) {
        console.error('Erro ao buscar jogo externo:', erro);
        resultadosExternos.innerHTML = '<p class="aviso-buscando">Erro ao buscar. Tente novamente.</p>';
    }
}

btnBuscarExterno.addEventListener('click', () => {
    const nome = inputNome.value;

    if (!nome) {
        alert('Digite o nome do jogo primeiro!');
        return;
    }

    buscarJogoExterno(nome);
});

let timerBusca = null;

inputNome.addEventListener('input', () => {
    const nome = inputNome.value;

    clearTimeout(timerBusca);

    if (!nome || nome.length < 3) {
        resultadosExternos.innerHTML = '';
        return;
    }

    timerBusca = setTimeout(() => {
        buscarJogoExterno(nome);
    }, 500);
});

function mostrarResultadosExternos(jogos) {
    resultadosExternos.innerHTML = '';

    jogos.forEach(jogo => {
        const card = document.createElement('div');
        card.classList.add('card-resultado-externo');

        const imagem = jogo.imagem_url || 'https://via.placeholder.com/60?text=?';
        const plataformas = jogo.plataformas ? jogo.plataformas.slice(0, 3).join(', ') : 'Nao informado';
        const ano = jogo.data_lancamento ? jogo.data_lancamento.split('-')[0] : '?';

        card.innerHTML = `
            <img src="${imagem}" alt="${jogo.nome}">
            <div class="info-resultado">
                <h4>${jogo.nome}</h4>
                <p>${plataformas} • ${ano}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            document.getElementById('input-nome').value = jogo.nome;
            document.getElementById('input-plataforma').value = jogo.plataformas ? jogo.plataformas[0] : '';
            document.getElementById('input-descricao').value = `${jogo.nome} - Lancado em ${jogo.data_lancamento || 'data desconhecida'}. Generos: ${jogo.generos ? jogo.generos.join(', ') : 'nao informado'}.`;
            inputImagemUrl.value = jogo.imagem_url || '';

            resultadosExternos.innerHTML = '';

            if (jogo.imagem_url) {
                document.getElementById('preview-imagem').src = jogo.imagem_url;
                document.getElementById('preview-capa').style.display = 'flex';
            }
        });

        resultadosExternos.appendChild(card);
    });
}

verificarApi();
carregarJogos();
