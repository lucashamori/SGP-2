# Estudo de Caso: Sistema de Gerenciamento de Produtos (SGP)

**Tipo de Projeto:** Estudo de Caso (Projeto de Estudo Full-Stack)

---

## 🎯 Sobre o Projeto

O SGP nasceu como um projeto de estudo individual com o objetivo de aplicar, em um cenário prático, conceitos avançados de desenvolvimento web full-stack. O desafio era construir, do zero, o núcleo de um sistema de gestão (ERP) web, capaz de gerenciar Clientes, Produtos e Estoque, estabelecendo a base para um futuro módulo de Pedidos.
A aplicação foi construída com **Next.js 14**, **TypeScript**, **Prisma ORM**, **Firebase Authentication** e **Neon Database (PostgreSQL Serverless)**.  
O objetivo é integrar todos os módulos de uma empresa em um único sistema prático, seguro e escalável.


O foco principal não era apenas *entregar a funcionalidade*, mas *dominar a arquitetura* necessária para interagir com um esquema de banco de dados robusto e de alta complexidade, simulando um ambiente corporativo real.

---

## ⚙️ Funcionalidades Principais

### 🔐 1. Autenticação de Usuários (Firebase)
- Login seguro via **Firebase Authentication** (e-mail e senha).  
- Controle de acesso a rotas protegidas (dashboard, estoque, pedidos).  
- Logout com limpeza automática de sessão.  
- Feedback visual para erros de autenticação.

### 👥 2. Cadastro e Edição de Clientes
- CRUD completo de clientes (Pessoa Física e Jurídica).  
- Identificação automática do tipo de cliente (CPF/CNPJ).  
- Validação e normalização antes do envio ao banco.

### 🧾 3. Pedidos
- Registro de pedidos com múltiplos produtos.  
- Cálculo automático de valores totais.  
- Atualização instantânea do estoque após finalização do pedido.  
- Auditoria de alterações (`Usuario_Alteracao = SYSTEM_PEDIDO`).

### 📦 4. Controle de Estoque
- Consulta detalhada de quantidades disponíveis e reservadas.  
- Atualização em tempo real após novos pedidos.  
- Registro de data e hora de cada modificação.

### 🏷️ 5. Produtos e Unidades de Medida
- Cadastro de produtos vinculados a unidades de medida.  
- Controle via chaves estrangeiras no Prisma.  
- Exibição padronizada no dashboard.

### 🌐 6. Deploy e Integração Contínua
- Deploy automático via **Vercel**, integrado ao repositório GitHub.  
- Atualização contínua a cada push no branch `main`.  
- Conexão direta com o banco de dados **Neon** em produção.

---

## 🚀 Tecnologias Utilizadas

| Categoria | Ferramenta |
|------------|-------------|
| **Frontend** | Next.js 14, TypeScript, React, Tailwind CSS |
| **UI Components** | Shadcn/UI |
| **Backend / ORM** | Prisma ORM |
| **Banco de Dados** | Neon Database (PostgreSQL Serverless) |
| **Autenticação** | Firebase Authentication |
| **Deploy** | Vercel |
| **Versionamento** | Git e GitHub |
| **Formatação e Padronização** | ESLint, Prettier |

## 📊 O Desafio Central: A Estrutura do Banco (Neon + Prisma)

O esquema do banco de dados (PostgreSQL) é o núcleo do desafio, desenhado com alta integridade referencial e uma complexidade que dita toda a arquitetura do backend.

| Tabela | Chave Primária (PK) | Relacionamentos (FK) |
| --- | --- | --- |
| `empresa` | `id_empresa`, `estoque_id_estoque` | N/A |
| `unidade_de_medida` | `id_unidade_medidas` | N/A |
| `estoque` | `id_estoque` | `empresa` |
| `cliente` | PK Composta (3 colunas) | `empresa` |
| `tipo_de_cliente` | PK Composta (4 colunas) | `cliente` |
| **`produto`** | **PK Composta (7 colunas)** | `empresa`, `unidade_de_medida`, `estoque` |
| **`pedido`** | **PK Composta (13 colunas)** | `cliente`, `produto` |

> [!IMPORTANT]
A complexidade das Chaves Primárias Compostas, especialmente em produto (7 colunas) e pedido (13 colunas), foi o principal vetor de aprendizado, exigindo um design de backend muito mais robusto do que um CRUD padrão.
> 

## 💻 Arquitetura e Tecnologias Aplicadas

A seleção da stack foi uma decisão deliberada para resolver os desafios de performance e complexidade de dados.

- **Framework Principal:** [Next.js](https://nextjs.org/) (com React)
    
    > 
    Por quê? Para unir o frontend (React) e o backend (API Routes) em um único projeto, e usar Server-Side Rendering (SSR) como solução de performance para relatórios.
    > 
- **Backend & API:** Node.js (via [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes))
    
    > 
    Por quê? As API Routes serviram como a camada de backend dedicada para se comunicar com o MySQL. Elas encapsulam as queries SQL complexas, protegendo a lógica de negócios e as credenciais do banco.
    > 
- **Banco de Dados:** PostgreSQL
    
    > 
    Por quê? Um banco de dados relacional robusto, escolhido especificamente pelo desafio de lidar com seu esquema de alta integridade (chaves compostas e estrangeiras).
    > 
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
    
    > 
    Por quê? Para a construção ágil de interfaces limpas e profissionais, mantendo o controle total sobre os componentes.
    > 

---

## 🧠 Processo de Aprendizagem e Desenvolvimento

O **SGP-2** foi desenvolvido como parte de um projeto prático do **SENAC**, com o propósito de consolidar o aprendizado em **desenvolvimento fullstack**.

### 🔍 Etapas e desafios enfrentados:

1. **Modelagem do Banco com Prisma**
   - Criação de um schema complexo com múltiplos relacionamentos.  
   - Ajuste de tipos `Decimal` e IDs automáticos.  
   - Aprendizado sobre migrações e chaves compostas.

2. **Integração com o Neon Database**
   - Configuração de conexão segura com SSL.  
   - Criação de ambiente `.env` para separar variáveis sensíveis.  
   - Testes e sincronização entre ambientes de desenvolvimento e produção.

3. **Criação das Server Actions (Next.js)**
   - Substituição de rotas API por Server Actions.  
   - Implementação de CRUD assíncronos e atualizações em tempo real.  
   - Correção de erros de tipagem e comunicação com o banco.

4. **Autenticação com Firebase**
   - Configuração do Firebase Authentication (e-mail e senha).  
   - Criação de contexto de autenticação global.  
   - Proteção de rotas e redirecionamento condicional.  
   - Tratamento de erros e feedbacks de UI.

5. **Frontend e UX**
   - Utilização de **Tailwind CSS** e **Shadcn/UI** para um layout limpo e moderno.  
   - Criação de componentes reutilizáveis e responsivos.  
   - Validação de formulários e interação dinâmica com o usuário.

6. **Deploy e Versionamento**
   - Deploy estável na **Vercel**.  
   - Controle de versões via **Git e GitHub**.  
   - Resolução de conflitos de merge e logs de compilação.  

---

## 📘 Lições Aprendidas

- Estruturação de sistemas fullstack com **Next.js + Prisma + PostgreSQL**.  
- Integração segura com **Firebase Authentication**.  
- Aplicação prática de conceitos de **ORM, tipagem TypeScript e chaves estrangeiras**.  
- Experiência real com **deploys automatizados e logs de produção**.  
- Importância da documentação e versionamento em projetos de equipe.

---

**👤 Lucas Mori**  
Estudante do **SENAC**, com foco em **Ciência de Dados e Desenvolvimento Web**.  
Apaixonado por criar soluções completas, integrando banco de dados, lógica de negócio e interfaces modernas.

---

## 🏁 Conclusão

O **SGP-2** representa a união entre teoria e prática — um projeto construído do zero com foco em aprendizado, integração de tecnologias e experiência real de desenvolvimento.

Durante sua construção, foi possível compreender profundamente os fluxos entre **frontend, backend e banco de dados**, além de aplicar conceitos modernos de autenticação e deploy contínuo.

> “Mais do que um sistema de gestão, o SGP-2 é a materialização de uma jornada de aprendizado, persistência e evolução profissional.”

---
