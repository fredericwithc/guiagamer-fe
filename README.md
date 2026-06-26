
# GuiaGamer - Front-end

Interface web do **GuiaGamer**, um app web que oferece detonados de jogos com sistema de pistas progressivas para evitar spoilers indesejados.

Este repositório contém o front-end do projeto, feito em HTML, CSS e JavaScript (sem frameworks).

## Sobre o projeto

O GuiaGamer nasceu pra resolver alguns problemas comuns dos gamers ao consultar detonados online:

- Exposição a spoilers de partes do jogo que o jogador ainda não chegou
- Dificuldade de lembrar exatamente onde parou no detonado
- Necessidade de consultar diferentes sites dependendo do jogo

Para evitar spoilers, a API oferece um sistema de pistas em 3 níveis:

- **Dica leve**: uma sugestão sutil, sem entregar a resposta
- **Dica direta**: orientação mais clara
- **Passo completo**: a resposta detalhada

Assim, o jogador escolhe quanto quer revelar a cada momento.

Além disso, o app permite marcar etapas como concluídas, ajudando o jogador a acompanhar seu progresso e retomar de onde parou.

No futuro, a ideia é que o site funcione como um "wikipedia" em que temos um sistema de login e que os usuarios podem cadastrar os jogos e detonados e fazerem sugestões de ajustes quando preferirem.

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript
- Google Fonts (Space Grotesk e Albert Sans)

## Como rodar

### Pré-requisitos

Para usar o front-end, você precisa que a API esteja rodando localmente. Repositório do back-end aqui: [guiagamer-be](https://github.com/fredericwithc/guiagamer-be)

### Passo a passo

1. Clone o repositório:

```
git clone https://github.com/fredericwithc/guiagamer-fe.git
```

2. Certifique-se de que a API está rodando em `http://localhost:5000`

3. Só abrir o arquivo `index.html` no seu navegador e pronto.

## Funcionalidades

### Tela inicial

- Lista todos os jogos cadastrados em formato de cards
- Cada card mostra nome, plataforma e descrição
- Botão para cadastrar um novo jogo
- Botão de deletar em cada card

### Tela de detonado

- Mostra as etapas do jogo selecionado em ordem
- Sistema de pistas em 3 níveis
- Marcar etapa como concluída
- Botão para cadastrar nova etapa

### Persistência do progresso

- As etapas concluídas ficam salvas no localStorage do navegador
- O progresso continua salvo mesmo fechando o navegador
- Cada jogo tem seu próprio progresso independente

## Paleta de cores

Paleta personalizada com fundo escuro e destaque em dourado:

- Fundo: `#161A26`
- Superfície: `#212636`
- Primária (dourado): `#F0A857`
- Secundária (azul): `#7C9CFF`
- Concluído (verde): `#5FBF8A`

## Back-end

Este projeto depende da API que está em outro repositório: [guiagamer-be](LINK_DO_BACKEND)

## Feito por

Frederic Chomé Bombini Leyenberger - Projeto de MVP da pós-graduação da PUC-Rio
