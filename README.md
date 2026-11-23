# AndesCore - Sistema de Suporte Técnico

Sistema web para abertura, gerenciamento e acompanhamento de chamados de suporte técnico da AndesCore.

## O problema

O atendimento aos clientes era realizado principalmente por e-mail e WhatsApp, dificultando a organização das solicitações. Não havia uma maneira centralizada de acompanhar quais problemas já haviam sido atendidos, identificar chamados prioritários ou verificar o andamento de cada solicitação.

## A solução

Foi desenvolvido um sistema web para centralizar e organizar o gerenciamento dos chamados de suporte técnico, utilizando-se, principalmente:

- **Abertura de chamados:** formulário para registrar solicitações com nome do solicitante, setor, descrição do problema e nível de urgência.
- **Listagem de chamados:** visualização dos chamados cadastrados, com informações organizadas em componentes reutilizáveis que recebem os dados por meio de props.
- **Acompanhamento de status:** identificação da situação de cada chamado, classificados como aberto, em andamento ou resolvido.
- **Detalhamento do chamado:** página individual com informações completas da solicitação e possibilidade de alterar seu status.

## Tecnologias utilizadas

- **React 18:** construção da interface por meio de componentes.
- **TypeScript:** tipagem estática e maior segurança na organização do código.
- **Vite:** servidor de desenvolvimento e ferramenta de build.
- **React Router:** gerenciamento da navegação entre as páginas.
- **Vercel:** plataforma de hospedagem e deploy.

## Estrutura e funcionamento

O código-fonte TypeScript e TSX fica organizado na pasta `src`. Durante o processo de build, o Vite compila e empacota os arquivos necessários para a aplicação, gerando a versão de produção na pasta `dist`.

Os dados dos chamados são armazenados localmente no navegador por meio do `localStorage`.

## Como executar o projeto

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

### Outros comandos

```bash
npm run build       # gera a versão de produção
npm run preview     # permite visualizar o build localmente
npm run typecheck   # verifica os tipos do TypeScript
```

## Autores

Ana Beatriz França - 01896652
Thiago Lucas - 01902382
Erick Dante - 01911983
Richard Eduardo da Silva - 01905736
