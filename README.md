# AndesCore - Sistema de Suporte Técnico

Sistema web para abertura, gerenciamento e acompanhamento de chamados de suporte técnico da AndesCore.

## O problema

O atendimento aos clientes era realizado principalmente por e-mail e WhatsApp, dificultando a organização das solicitações. Não havia uma maneira centralizada de acompanhar quais problemas já haviam sido atendidos, identificar chamados prioritários ou verificar o andamento de cada solicitação.

## A solução

Foi desenvolvido um sistema web para centralizar e organizar o gerenciamento dos chamados de suporte técnico, utilizando-se, principalmente:

- Abertura de chamados: formulário para registrar solicitações com nome do solicitante, setor, descrição do problema e nível de urgência.
- Listagem de chamados: visualização dos chamados cadastrados, com informações organizadas em componentes reutilizáveis que recebem os dados por meio de props.
- Acompanhamento de status: identificação da situação de cada chamado, classificados como aberto, em andamento ou resolvido.
- Detalhamento do chamado: página individual com informações completas da solicitação e possibilidade de alterar seu status.

Além disso, foi criado um sistema de Login por e-mail e senha, difereciando-se contas de clientes e administradores que gerenciarão os chamados e atendimentos.

## A diferenciação Cliente-Administrador

A Conta Cliente abre um chamado informando nome, setor e descrição do problema. Entretanto, ela acompanha só os próprios chamados, com status, urgência e técnico, não altera nada e não vê os chamados de outras pessoas.

Enquanto que uma conta de administrador vê a fila completa, agrupada por status e ordenada por urgência, pode definir a urgência (baixa, média ou alta), mudar o status (aberto, em andamento, resolvido) e registrar o técnico responsável. A urgência é definida só pelo administrador. 

## Tecnologias

As tecnologias utilizadas foram React 18, TypeScript, Vite, React Router, TanStack Query e Supabase (banco PostgreSQL e autenticação).Ou seja, os dados são armazenados no Supabase em vez de localStorage.

O código-fonte TypeScript e TSX fica organizado na pasta `src`. Durante o processo de build, o Vite compila e empacota os arquivos necessários para a aplicação, gerando a versão de produção na pasta `dist`.



## Como executar o projeto

Como rodar

Pré-requisito: Node.js instalado e uma conta gratuita no Supabase.

1. Crie um projeto no Supabase.
2. Crie as tabelas e as regras de acesso. 
3. No projeto, abra o SQL Editor, cole o conteúdo de supabase/schema.sql e rode. O arquivo pode ser executado mais de uma vez.
4. Em Authentication, Sign In / Providers, Email, desligue "Confirm email". Assim a conta nova entra sem esperar o e-mail de confirmação.
5.Configure as variáveis. 
6. Crie um arquivo .env na raiz do projeto, ao lado do package.json:

VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publishable

Os dois valores ficam no botão Connect do painel do Supabase. Use a chave pública (sb_publishable_... ou anon), nunca a secreta. 

7. Instale e rode:

npm install
npm run dev

O terminal mostra o endereço, normalmente http://localhost:5173.

## Criar um Administrador

Para promover uma conta, crie-a pelo site e rode no SQL Editor, trocando o e-mail:

update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@exemplo.com');

## Estrutura

src/
├── main.tsx            ponto de entrada
├── App.tsx             rotas e cabeçalho
├── auth.tsx            sessão, papel do usuário e proteção de rotas
├── supabase.ts         cliente do Supabase
├── data.ts             leitura e escrita dos chamados (TanStack Query)
├── tickets.ts          tipos, rótulos, validação e ordenação
├── components/
│   └── TicketRow.tsx   linha da fila (recebe o chamado por props)
└── pages/
    ├── Login.tsx
    ├── OpenTicket.tsx  formulário de abertura
    ├── TicketList.tsx  fila (administrador) / meus chamados (cliente)
    └── TicketDetail.tsx
supabase/
└── schema.sql          tabelas, regras de acesso e permissões

## Autores

Ana Beatriz França - 01896652

Thiago Lucas - 01902382

Erick Dante - 01911983

Richard Eduardo da Silva - 01905736