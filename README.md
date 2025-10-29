# Sistema de Gerenciamento de Produtos (SGP)

## 🎯 Sobre o Projeto

O SGP é um sistema web desenvolvido para gerenciar o ciclo completo de vendas e estoque. O foco principal deste projeto é lidar com a complexidade de um esquema de banco de dados robusto, que inclui chaves primárias e estrangeiras compostas e relacionamentos de dados detalhados entre empresas, clientes e produtos.

É uma prova de conceito de aplicação para gestão de dados em ambientes de alta exigência de integridade.

## ✨ Funcionalidades Principais

* **Gestão de Entidades:** CRUD completo para Empresas, Unidades de Medida e Estoque.
* **Cadastro Detalhado:** Inserção e edição de Produtos e Clientes com múltiplos atributos de relacionamento.
* **Controle de Pedidos:** Registro de transações, vinculando Clientes, Produtos e a Empresa responsável.
* **Relatórios Complexos:** Consultas avançadas (JOINs) para extrair dados consolidados de 5 ou mais tabelas simultaneamente.
* **Validação de Dados:** Aplicação de formatação para CPF/CNPJ e tratamento de dados numéricos (ex: `LPAD` para zeros à esquerda).

## 📊 Estrutura do Banco de Dados (MySQL)

O esquema do banco de dados (esquema `sgp`) é o núcleo do sistema, desenhado com alta integridade referencial.

| Tabela | Chave Primária (PK) | Relacionamentos (FK) |
| :--- | :--- | :--- |
| `empresa` | `id_empresa`, `estoque_id_estoque` | N/A |
| `unidade_de_medida` | `id_unidade_medidas` | N/A |
| `estoque` | `id_estoque` | `empresa` |
| `cliente` | PK Composta (3 colunas) | `empresa` |
| `tipo_de_cliente` | PK Composta (4 colunas) | `cliente` |
| **`produto`** | PK Composta (7 colunas) | `empresa`, `unidade_de_medida`, `estoque` |
| **`pedido`** | PK Composta (13 colunas) | `cliente`, `produto` |

*Nota: A complexidade das Chaves Primárias Compostas em tabelas como `produto` e `pedido` exige atenção especial no desenvolvimento do backend para garantir a correta manipulação de dados.*

## 💻 Arquitetura e Benefícios do Next.js

O projeto SGP é desenvolvido utilizando **Next.js**, que serve como uma solução robusta tanto para o frontend (baseado em React) quanto para o backend (através das API Routes).

### Vantagens Chave para o SGP:

1.  **Alto Desempenho (SSR):** Utilizamos **Server-Side Rendering (SSR)** para renderizar as tabelas e relatórios diretamente no servidor. Isso elimina o tempo de espera no cliente, tornando a navegação e a visualização de relatórios complexos praticamente instantânea.
2.  **API Integrada e Simples:** As **API Routes** do Next.js permitem que a lógica de acesso ao MySQL (onde ocorrem os complexos comandos `JOIN` de 5 tabelas) resida no mesmo repositório, simplificando o desenvolvimento e a manutenção.
3.  **Experiência de Desenvolvimento:** A base em React e a arquitetura unificada aceleram a criação de novas funcionalidades e a manutenção de um sistema com tantas regras de negócio.

---

## 🛠️ Tecnologias Utilizadas 

| Categoria | Tecnologia |
| :--- | :--- |
| **Framework** | **Next.js (com React)** |
| **Backend/API** | Node.js (via API Routes do Next.js) |
| **Banco de Dados** | MySQL 8.0+ |
| **Estilização** | Tailwind |

Estudo de Caso: Projeto SGP (Sistema de Gestão de Pedidos)

Tipo de Projeto: Estudo de Caso (Projeto de Estudo Full-Stack)
Status: Fase 1 Concluída

1. O Desafio: Objetivo do Projeto

O SGP nasceu como um projeto de estudo individual com o objetivo de aplicar, em um cenário prático, conceitos avançados de desenvolvimento web full-stack. O desafio era construir, do zero, o núcleo de um sistema de gestão (ERP) web, capaz de gerenciar Clientes, Produtos e Estoque, estabelecendo a base para um futuro módulo de Pedidos.

O foco principal não era apenas entregar a funcionalidade, mas dominar a arquitetura de aplicações modernas, seguras e eficientes.

2. Tecnologias e Conceitos Aplicados

A seleção da stack foi uma decisão deliberada para explorar o ecossistema Next.js e suas práticas mais recentes.

Framework Principal: Next.js (App Router)

Por quê? Para dominar a arquitetura de Server Components e a integração nativa com Server Actions, eliminando a necessidade de uma API REST separada.

Linguagem: TypeScript

Por quê? Essencial para a robustez do projeto, garantindo segurança de tipos do banco de dados (Prisma) até a interface (React).

Banco de Dados e ORM: PostgreSQL e Prisma

Por quê? O Prisma oferece uma experiência de desenvolvimento superior, com type-safety automático e um sistema de migração intuitivo.

Lógica de Negócios: Next.js Server Actions

Por quê? Permitiram a execução de lógica de backend (mutações no banco) diretamente a partir de componentes, simplificando radicalmente o fluxo de dados.

Validação de Dados: Zod

Por quê? Para garantir a integridade dos dados na "fronteira" do servidor. Todo dado vindo do cliente é validado pelo Zod dentro da Server Action, antes de tocar o banco de dados.

UI e Estilização: shadcn/ui e Tailwind CSS

Por quê? Para a construção ágil de interfaces limpas e profissionais, mantendo o controle total sobre os componentes.

3. Arquitetura e Fluxo de Dados

A arquitetura foi desenhada para ser "verticalmente integrada", onde cada funcionalidade (ex: "Clientes") possui seus dados, lógica e UI claramente definidos.

Fluxo de uma Requisição (Ex: Atualização de Cliente):

UI (page.tsx): O usuário clica em "Salvar" em um formulário de edição.

Ação (cliente-actions.ts): A Server Action updateCliente é chamada (via useFormState).

Validação (Zod): A action primeiro valida os dados do formulário com o UpdateClienteSchema. Se falhar, retorna os erros para a UI.

Banco de Dados (Prisma): Se os dados forem válidos, a action converte os tipos (ex: string para BigInt) e executa o prisma.cliente.update.

Revalidação (Next.js): A action chama revalidatePath("/exibirClientes") para limpar o cache da página de listagem.

Redirecionamento (Next.js): A action chama redirect("/exibirClientes") para navegar o usuário de volta, onde ele verá os dados atualizados.

4. Desafios Técnicos e Aprendizados-Chave

Esta seção detalha os problemas mais complexos encontrados e as soluções aplicadas, que representam os principais ganhos de aprendizado do projeto.

4.1. Desafio 1: Serialização de BigInt

O Problema: O Prisma mapeia o tipo BIGINT do PostgreSQL para BigInt no JavaScript. No entanto, BigInt não pode ser serializado em JSON, causando erros ao passar os dados de um Server Component para um Client Component (ex: ao preencher um formulário de edição).

A Solução: Implementei um padrão de "serialização/desserialização" manual.

Leitura (Servidor -> Cliente): Na função getClienteById, todos os campos BigInt são convertidos para string (ex: id_cliente.toString()) antes de serem enviados à UI.

Escrita (Cliente -> Servidor): Na Server Action (ex: updateCliente), os dados recebidos (que são string) são convertidos de volta para BigInt (ex: BigInt(keys.id_cliente)) antes de serem enviados ao Prisma.

Aprendizado-Chave: Compreensão profunda da fronteira entre Servidor e Cliente no Next.js e a necessidade de garantir a serialização dos dados que a cruzam.

4.2. Desafio 2: Chaves Primárias Compostas

O Problema: Durante o desenvolvimento, descobriu-se que o schema do banco utiliza chaves primárias compostas (ex: id_cliente + empresa_id_empresa + tipo_cliente_id_tipo_cliente) em vez de um único id. Isso quebrou todas as operações CRUD simples, pois o Prisma não aceitava um where: { id_cliente: ... } simples.

A Solução: Foi necessário refatorar todas as operações (findUnique, update, delete) para usar a sintaxe de chave composta do Prisma:

where: {
  id_cliente_empresa_id_empresa_tipo_cliente_id_tipo_cliente: {
    id_cliente: BigInt(keys.id_cliente),
    // ...outros IDs da chave
  }
}


Aprendizado-Chave: A importância crítica de entender 100% o schema do banco de dados e como o ORM (Prisma) mapeia estruturas complexas como chaves compostas. Isso exigiu a refatoração de tipos, funções e da passagem de dados em toda a aplicação.

4.3. Desafio 3: Atomicidade em Transações

O Problema: Ao cadastrar um novo Produto, era necessário criar duas entradas em tabelas diferentes: uma em produto e outra em estoque. Se a criação do estoque falhasse, o produto não poderia existir sozinho.

A Solução: Utilização do prisma.$transaction. A ação cadastrarProduto envolve as duas operações de escrita ( tx.produto.create e tx.estoque.create) dentro de uma transação. Se qualquer uma falhar, o Prisma executa um rollback automático, garantindo a integridade dos dados.

Aprendizado-Chave: Aplicação de transações de banco de dados para garantir a atomicidade de operações de negócios complexas.

5. Próximos Passos (Fase 2)

A fundação do projeto está sólida. A próxima fase se concentrará no desenvolvimento do módulo de Gestão de Pedidos, que utilizará as bases de clientes e estoque já criadas.

Isso envolverá:

Modelagem de Dados: Criação das tabelas pedido e item_pedido.

Lógica de Negócios: Desenvolvimento de Server Actions transacionais (ex: criarPedido) que irão criar o pedido e, atomicamente, atualizar a qtd_reservada na tabela estoque.

UI: Criação de um formulário de "Novo Pedido" com consulta de estoque em tempo real.
