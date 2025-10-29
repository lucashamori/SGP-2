# Estudo de Caso: Sistema de Gerenciamento de Produtos (SGP)

**Tipo de Projeto:** Estudo de Caso (Projeto de Estudo Full-Stack)
**Status:** Fase 1 Concluída

## 1. 🎯 Sobre o Projeto

O SGP nasceu como um projeto de estudo individual com o objetivo de aplicar, em um cenário prático, conceitos avançados de desenvolvimento web full-stack. O desafio era construir, do zero, o núcleo de um sistema de gestão (ERP) web, capaz de gerenciar Clientes, Produtos e Estoque, estabelecendo a base para um futuro módulo de Pedidos.

O foco principal não era apenas *entregar a funcionalidade*, mas *dominar a arquitetura* necessária para interagir com um esquema de banco de dados robusto e de alta complexidade, simulando um ambiente corporativo real.

## 2. ✨ Funcionalidades Principais

- **Gestão de Entidades:** CRUD completo para Empresas, Unidades de Medida e Estoque.
- **Cadastro Detalhado:** Inserção e edição de Produtos e Clientes com múltiplos atributos de relacionamento.
- **Controle de Pedidos:** Registro de transações, vinculando Clientes, Produtos e a Empresa responsável.
- **Relatórios Complexos:** Consultas avançadas (JOINs) para extrair dados consolidados de 5 ou mais tabelas simultaneamente.
- **Validação de Dados:** Aplicação de formatação para CPF/CNPJ e tratamento de dados numéricos (ex: `LPAD` para zeros à esquerda).

## 3. 📊 O Desafio Central: A Estrutura do Banco (MySQL)

O esquema do banco de dados (MySQL) é o núcleo do desafio, desenhado com alta integridade referencial e uma complexidade que dita toda a arquitetura do backend.

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

## 4. 💻 Arquitetura e Tecnologias Aplicadas

A seleção da stack foi uma decisão deliberada para resolver os desafios de performance e complexidade de dados.

- **Framework Principal:** [Next.js](https://nextjs.org/) (com React)
    
    > 
    Por quê? Para unir o frontend (React) e o backend (API Routes) em um único projeto, e usar Server-Side Rendering (SSR) como solução de performance para relatórios.
    > 
- **Backend & API:** Node.js (via [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes))
    
    > 
    Por quê? As API Routes serviram como a camada de backend dedicada para se comunicar com o MySQL. Elas encapsulam as queries SQL complexas, protegendo a lógica de negócios e as credenciais do banco.
    > 
- **Banco de Dados:** MySQL 8.0+
    
    > 
    Por quê? Um banco de dados relacional robusto, escolhido especificamente pelo desafio de lidar com seu esquema de alta integridade (chaves compostas e estrangeiras).
    > 
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
    
    > 
    Por quê? Para a construção ágil de interfaces limpas e profissionais, mantendo o controle total sobre os componentes.
    > 

## 5. 🛠️ Desafios Técnicos e Aprendizados-Chave

Esta seção detalha os problemas mais complexos encontrados e as soluções aplicadas.

### 5.1. Desafio 1: Chaves Primárias Compostas (Extremas)

> 
O Problema: O schema do banco, com chaves primárias de 7 (produto) e 13 (pedido) colunas, torna impossível o uso de um CRUD padrão baseado em um único id. Qualquer operação (find, update, delete) exige que todas as colunas da chave sejam passadas e filtradas.
> 

> 
A Solução: Foi necessário um design cuidadoso das API Routes e das queries SQL (ou do ORM) para garantir que todas as colunas da chave fossem passadas (geralmente via req.body ou parâmetros de query complexos) e usadas corretamente na cláusula WHERE da consulta ao banco.
> 

> 
Aprendizado-Chave: Domínio no design de APIs para interagir com esquemas de banco de dados legados ou de alta complexidade. Isso forçou a criação de uma camada de backend robusta, muito além de um CRUD genérico, para garantir a integridade referencial.
> 

### 5.2. Desafio 2: Performance de Relatórios (JOINs)

> 
O Problema: As funcionalidades de relatórios exigiam JOINs de 5 ou mais tabelas simultaneamente (ex: pedido -> cliente -> produto -> empresa -> unidade_de_medida). Carregar esses dados no lado do cliente (CSR) seria lento e pesado.
> 

> 
A Solução: Utilização de Server-Side Rendering (SSR) no Next.js (com getServerSideProps ou o equivalente no App Router). As queries complexas são executadas no servidor no momento da requisição. O HTML final, já com a tabela de relatório preenchida, é enviado ao cliente, tornando a exibição dos dados praticamente instantânea.
> 

> 
Aprendizado-Chave: Aplicação prática de SSR como uma ferramenta de otimização de performance para páginas com alta densidade de dados (data-heavy pages), contrastando com a abordagem de SPA/CSR.
> 

### 5.3. Desafio 3: Atomicidade em Transações

> 
O Problema: Ao cadastrar um novo Produto, era necessário criar duas entradas em tabelas diferentes: uma em produto e outra em estoque (que era parte da chave da empresa). Se a segunda operação falhasse, a primeira não poderia persistir.
> 

> 
A Solução: Utilização de Transações SQL (START TRANSACTION, COMMIT, ROLLBACK) dentro da API Route. A lógica de cadastrarProduto envolve as duas operações de INSERT dentro de um bloco de transação. Se qualquer uma falhar, o ROLLBACK é executado, garantindo a integridade dos dados.
> 

> 
Aprendizado-Chave: Aplicação de transações de banco de dados (neste caso, MySQL) para garantir a atomicidade de operações de negócios complexas.
> 

## 6. Próximos Passos (Fase 2)

A fundação do projeto está sólida. A próxima fase se concentrará no desenvolvimento do módulo de **Gestão de Pedidos**, que utilizará as bases de clientes e estoque já criadas.

Isso envolverá:

1. **Modelagem de Dados:** Criação das tabelas `pedido` e `item_pedido`.
2. **Lógica de Negócios:** Desenvolvimento de API Routes transacionais (ex: `POST /api/pedidos`) que irão criar o pedido e, atomicamente, atualizar a `qtd_reservada` na tabela `estoque`.
3. **UI:** Criação de um formulário de "Novo Pedido" com consulta de estoque em tempo real (provavelmente usando `fetch` para uma API Route de consulta).
