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
