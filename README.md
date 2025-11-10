# Veridian — Sistema de Biblioteca Online

Sistema de gerenciamento de biblioteca. Backend em FastAPI. Frontend em React. Banco de dados SQLite para desenvolvimento.

## Visão geral

Projeto acadêmico do curso de Ciência da Computação da UNIJORGE.  
Permite cadastrar obras, exemplares, usuários, empréstimos e reservas.  
Suporta papéis de usuário e administrador.

## Principais funcionalidades

**Administradores**

* Gerenciar obras, exemplares e categorias.
* Cadastrar e gerenciar usuários.
* Controlar empréstimos e devoluções.
* Gerenciar reservas.
* Gerar relatórios básicos.
* Fazer upload de capas.

**Usuários**

* Navegar catálogo de obras.
* Reservar obras.
* Visualizar empréstimos ativos e histórico.
* Editar perfil.

## Tecnologias

**Backend**

* Python 3.8+
* FastAPI
* SQLAlchemy
* SQLite (desenvolvimento)
* Pydantic
* Uvicorn
* Bcrypt (hash de senhas)

**Frontend**

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Radix UI
* Lucide Icons
* Sonner (toasts)

## Pré-requisitos

* Python 3.8+
* Node.js 18+
* npm

## Instalação e execução

### 1. Clone o repositório

```bash
git clone https://github.com/soaaresxd/sistema-biblioteca-veridian.git
cd sistema-biblioteca-veridian
```

### 2. Backend

```bash
# crie e ative ambiente virtual
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

# instale dependências
pip install -r backend/requirements.txt

# acesse o backend
cd backend/src

# recrie o banco de dados
python recriar_bd.py

# crie o usuário administrador padrão
python criar_admin.py

# rode o backend
uvicorn main:app --reload
```

### 3. Frontend

```bash
# na raiz do projeto
npm install
npm run dev
```

**Frontend disponível em:** `http://localhost:5173`

## Estrutura do banco de dados

### `usuarios`
* `id`, `nome`, `cpf` (único), `email` (único), `senha`, `telefone`, `endereco`, `role`

### `administradores`
* `id`, `nome`, `cpf` (único), `senha`, `email`

### `categorias`
* `id`, `nome` (único)

### `obras`
* `id`, `titulo`, `autor`, `editora`, `ano_publicacao`, `isbn` (único), `sinopse`, `categoria_id` (FK), `imagem_capa`

### `exemplares`
* `id`, `obra_id` (FK), `codigo` (único), `status` (disponivel | emprestado | reservado | manutencao)

### `emprestimos`
* `id`, `usuario_id` (FK), `exemplar_id` (FK), `data_emprestimo`, `data_devolucao_prevista`, `data_devolucao_real`, `status`

### `reservas`
* `id`, `usuario_id` (FK), `obra_id` (FK), `data_reserva`, `status` (ativa | cancelada | concluida)

## Endpoints principais (API)

### Autenticação
* `POST /auth/login` — Login de usuários e administradores

### Obras
* `GET /obras` — Listar todas as obras
* `GET /obras/{id}` — Buscar obra por ID
* `POST /obras` — Criar nova obra (admin)
* `PUT /obras/{id}` — Atualizar obra (admin)
* `DELETE /obras/{id}` — Deletar obra (admin)

### Exemplares
* `GET /exemplares` — Listar exemplares
* `POST /exemplares` — Criar exemplar (admin)
* `PUT /exemplares/{id}` — Atualizar exemplar (admin)
* `DELETE /exemplares/{id}` — Deletar exemplar (admin)

### Empréstimos
* `GET /emprestimos` — Listar empréstimos
* `GET /emprestimos/usuario/{id}` — Empréstimos por usuário
* `POST /emprestimos` — Criar empréstimo (admin)
* `PUT /emprestimos/{id}/devolver` — Registrar devolução

### Reservas
* `GET /reservas` — Listar reservas
* `GET /reservas/usuario/{id}` — Reservas por usuário
* `POST /reservas` — Criar reserva
* `PUT /reservas/{id}/cancelar` — Cancelar reserva

### Usuários
* `GET /usuarios` — Listar usuários (admin)
* `POST /usuarios` — Criar usuário (admin)
* `PUT /usuarios/{id}` — Atualizar usuário (admin)
* `DELETE /usuarios/{id}` — Deletar usuário (admin)

### Categorias
* `GET /categorias` — Listar categorias
* `POST /categorias` — Criar categoria (admin)

## Segurança e boas práticas

* Senhas armazenadas com hash seguro (Bcrypt).
* Validação de dados com Pydantic.
* Uso de ORM para evitar injeção SQL (SQLAlchemy).
* Validação de CPF no frontend e backend.
* Controle de papéis (usuário comum vs administrador).
* Relacionamentos CASCADE no banco de dados.

## Estrutura do projeto

```
veridian/
├── backend/
│   ├── requirements.txt
│   └── src/
│       ├── main.py              # Aplicação FastAPI principal
│       ├── database.py          # Configuração do banco de dados
│       ├── criar_admin.py       # Script para criar administrador
│       ├── recriar_bd.py        # Script para recriar banco de dados
│       ├── models/              # Modelos SQLAlchemy (ORM)
│       ├── routes/              # Endpoints da API REST
│       ├── schemas/             # Schemas Pydantic (validação)
│       └── services/            # Lógica de negócio
├── src/
│   ├── components/              # Componentes React
│   │   ├── admin/              # Painel administrativo
│   │   ├── user/               # Painel do usuário
│   │   └── ui/                 # Componentes reutilizáveis
│   ├── lib/                    # Utilitários e helpers
│   ├── types/                  # Definições TypeScript
│   └── App.tsx                 # Componente principal
├── public/                     # Assets estáticos
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
```

## Boas práticas de código

* Código legível e modular (máximo possível).
* Nomes de variáveis e funções claros e descritivos.
* Separação de responsabilidades (models, routes, schemas, services).
* Componentes React reutilizáveis e bem organizados.
* Tipagem forte com TypeScript.
* Validação de dados em múltiplas camadas.

## Licença

Projeto desenvolvido para fins educacionais.

## Autores

**Felipe Soares Santana**  
**Gabriel Cerqueira**  
**Matheus Meneses**

**Orientador:** Prof. Jailson José dos Santos | Igor Gonzalez
  
**Centro Universitário Jorge Amado (UNIJORGE)**  
Ciência da Computação — Salvador, BA — 2025

---

**Desenvolvido com ❤️ pela equipe Veridian**
