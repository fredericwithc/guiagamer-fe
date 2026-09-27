# GuiaGamer - Front-end

Interface web do **GuiaGamer**, um app web que oferece detonados de jogos com sistema de pistas progressivas para evitar spoilers indesejados.

Este repositório contém o front-end do projeto, feito em HTML, CSS e JavaScript (sem frameworks).

## Sobre o projeto

O GuiaGamer nasceu pra resolver alguns problemas comuns dos gamers ao consultar detonados online:

- Exposição a spoilers de partes do jogo que o jogador ainda não chegou
- Dificuldade de lembrar exatamente onde parou no detonado
- Necessidade de consultar diferentes sites dependendo do jogo

Para evitar spoilers, o app oferece um sistema de pistas em 3 níveis:

- **Dica leve**: uma sugestão sutil, sem entregar a resposta
- **Dica direta**: orientação mais clara
- **Passo completo**: a resposta detalhada

Assim, o jogador escolhe quanto quer revelar a cada momento.

Além disso, o app permite marcar etapas como concluídas, ajudando o jogador a acompanhar seu progresso e retomar de onde parou.

No futuro, a ideia é que o site funcione como um "wikipedia" em que temos um sistema de login e que os usuários podem cadastrar os jogos e detonados e fazerem sugestões de ajustes quando preferirem.

## Arquitetura

O projeto segue o Cenário 1 da proposta do MVP, com três componentes se comunicando:

- **Front-end** (este repositório): interface web em HTML, CSS e JavaScript, servida por nginx quando rodada em container
- **API GuiaGamer**: API REST em Python com Flask
- **RAWG API** (externa): base de dados de jogos usada para enriquecer os cadastros

![Arquitetura do GuiaGamer](arquitetura-guiagamer.png)

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript
- Google Fonts (Space Grotesk e Albert Sans)
- nginx (servidor web quando roda em container)
- Docker

## Como rodar

### Pré-requisitos

Para usar o front-end, você precisa que a API esteja rodando localmente. Repositório do back-end aqui: https://github.com/fredericwithc/guiagamer-be

### Passo a passo

1. Clonar o repositório: `git clone https://github.com/fredericwithc/guiagamer-fe.git`

2. Certifique-se de que a API está rodando em `http://localhost:5000`

3. Só abrir o arquivo `index.html` no seu navegador.

## Funcionalidades

### Tela inicial

- Lista todos os jogos cadastrados em formato de cards com capas
- Cada card mostra imagem, nome, plataforma e descrição
- Botão para cadastrar um novo jogo
- Botão de editar em cada card
- Botão de deletar em cada card

### Cadastro de jogos com API externa

- Ao digitar o nome de um jogo, a busca acontece automaticamente na base RAWG
- Também tem botão de buscar para quando o usuário preferir clicar
- Ao selecionar um jogo dos resultados, os campos são preenchidos automaticamente
- Preview da capa do jogo aparece ao lado do formulário

### Tela de detonado

- Mostra as etapas do jogo selecionado em ordem
- Sistema de pistas em 3 níveis (reversíveis)
- Marcar etapa como concluída
- Botão para cadastrar nova etapa
- Botão para editar etapas
- Botão para deletar etapas

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

## API Externa (RAWG)

O front-end aproveita a integração do back-end com a RAWG Video Games Database API para trazer dados enriquecidos dos jogos.

### Como funciona

Ao cadastrar um novo jogo:

1. O usuário digita o nome do jogo (a busca é feita automaticamente enquanto digita)
2. O front-end faz uma requisição para o back-end (rota `/buscar_jogo_externo`)
3. O back-end consulta a RAWG e retorna os resultados
4. Os resultados aparecem em cards com capa, plataforma e ano de lançamento
5. Ao clicar em um resultado, os campos do formulário são preenchidos automaticamente e a capa do jogo aparece do lado

Assim, o usuário não precisa preencher os dados manualmente e ainda ganha a capa do jogo pra deixar os cards mais bonitos.

### Sobre a RAWG

A RAWG é uma das maiores bases de dados de videogames do mundo, com mais de 500 mil jogos catalogados. A API é gratuita para uso pessoal (até 20.000 requisições por mês).

Mais informações em rawg.io/apidocs.

## Como rodar com Docker

O projeto tem um Dockerfile pronto para rodar em containers usando nginx.

### Pré-requisitos

- Docker Desktop instalado e rodando
- API do back-end também rodando (veja o repositório do back-end)

### Passo a passo

1. Clonar o repositório: `git clone https://github.com/fredericwithc/guiagamer-fe.git` e depois `cd guiagamer-fe`

2. Fazer o build da imagem: `docker build -t guiagamer-fe .`

3. Rodar o container: `docker run -d -p 8080:80 --name guiagamer-front guiagamer-fe`

4. Acessar o app em `http://localhost:8080`

### Comandos úteis

- Ver logs: `docker logs guiagamer-front`
- Parar o container: `docker stop guiagamer-front`
- Iniciar de novo: `docker start guiagamer-front`
- Remover o container: `docker rm guiagamer-front`

## Back-end

Este projeto depende da API que está em outro repositório: https://github.com/fredericwithc/guiagamer-be

## Feito por

Frederic Chomé Bombini Leyenberger - Projeto de MVP da pós-graduação da PUC-Rio