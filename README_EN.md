# Case Study: Product Management System (SGP)

**Project Type:** Case Study (Full-Stack Learning Project)

---

## 🎯 About the Project

The **SGP** was born as an individual study project with the goal of applying advanced **full-stack web development** concepts in a practical environment.
The challenge was to build, from scratch, the core of a web-based ERP management system capable of handling **Clients**, **Products**, and **Inventory**, establishing the foundation for a future **Orders** module.

The application was built with **Next.js 14**, **TypeScript**, **Prisma ORM**, **Firebase Authentication**, and **Neon Database (Serverless PostgreSQL)**.
The main goal was to integrate all company modules into a single, practical, secure, and scalable system.

The primary focus was not only to *deliver functionality*, but to *master the architecture* required to interact with a robust and complex database schema—simulating a real corporate environment.

---

## ⚙️ Key Features

### 🔐 1. User Authentication (Firebase)

* Secure login via **Firebase Authentication** (email and password).
* Access control for protected routes (dashboard, inventory, orders).
* Logout with automatic session cleanup.
* Visual feedback for authentication errors.

### 👥 2. Client Management

* Full CRUD for both individuals and companies.
* Automatic client type detection (CPF/CNPJ equivalent).
* Validation and normalization before database submission.

### 🧾 3. Orders

* Order registration with multiple products.
* Automatic calculation of total values.
* Real-time stock updates after each order.
* Change audit via `Usuario_Alteracao = SYSTEM_PEDIDO`.

### 📦 4. Inventory Control

* Detailed consultation of available and reserved quantities.
* Real-time updates after new orders.
* Record of modification timestamps.

### 🏷️ 5. Products and Measurement Units

* Product registration linked to measurement units.
* Relationship management using Prisma foreign keys.
* Standardized display on the dashboard.

### 🌐 6. Deployment and Continuous Integration

* Automatic deployment via **Vercel**, integrated with GitHub repository.
* Continuous updates on each push to the `main` branch.
* Direct connection to the **Neon Database** in production.

---

## 🚀 Technologies Used

| Category            | Tool                                        |
| ------------------- | ------------------------------------------- |
| **Frontend**        | Next.js 14, TypeScript, React, Tailwind CSS |
| **UI Components**   | Shadcn/UI                                   |
| **Backend / ORM**   | Prisma ORM                                  |
| **Database**        | Neon Database (Serverless PostgreSQL)       |
| **Authentication**  | Firebase Authentication                     |
| **Deployment**      | Vercel                                      |
| **Version Control** | Git & GitHub                                |
| **Code Formatting** | ESLint, Prettier                            |

---

## 📊 Core Challenge: Database Structure (Neon + Prisma)

The PostgreSQL database schema is the core of the challenge, designed with high referential integrity and complexity that defines the entire backend architecture.

| Table               | Primary Key (PK)                   | Relationships (FK)                        |
| ------------------- | ---------------------------------- | ----------------------------------------- |
| `empresa`           | `id_empresa`, `estoque_id_estoque` | N/A                                       |
| `unidade_de_medida` | `id_unidade_medidas`               | N/A                                       |
| `estoque`           | `id_estoque`                       | `empresa`                                 |
| `cliente`           | Composite PK (3 columns)           | `empresa`                                 |
| `tipo_de_cliente`   | Composite PK (4 columns)           | `cliente`                                 |
| **`produto`**       | **Composite PK (7 columns)**       | `empresa`, `unidade_de_medida`, `estoque` |
| **`pedido`**        | **Composite PK (13 columns)**      | `cliente`, `produto`                      |

> [!IMPORTANT]
> The complexity of the composite primary keys—especially in `produto` (7 columns) and `pedido` (13 columns)—was the main learning driver, requiring a much more robust backend design than a standard CRUD.

---

## 💻 Architecture and Applied Technologies

Each technology in the stack was deliberately chosen to handle performance and data complexity challenges.

* **Main Framework:** [Next.js](https://nextjs.org/) (with React)

  > Combines frontend and backend logic in a single project, enabling Server-Side Rendering (SSR) for faster performance and dynamic reports.

* **Backend & API:** Node.js (via [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions))

  > Acts as a dedicated backend layer communicating with PostgreSQL, encapsulating complex queries and business logic.

* **Database:** PostgreSQL

  > Chosen for its robustness and ability to maintain integrity with multiple composite keys and relational links.

* **Styling:** [Tailwind CSS](https://tailwindcss.com/)

  > Enables clean and professional UI design while maintaining complete customization and responsiveness.

---

## 🧠 Learning and Development Process

The **SGP-2** project was developed as part of a **SENAC practical course**, designed to consolidate full-stack development skills.

### 🔍 Steps and Challenges Faced

1. **Database Modeling with Prisma**

   * Designed a complex schema with multiple relations.
   * Adjusted `Decimal` types and auto-generated IDs.
   * Learned migrations and composite key structures.

2. **Integration with Neon Database**

   * Configured secure SSL connection.
   * Created `.env` files for sensitive variables.
   * Tested synchronization between development and production environments.

3. **Creating Server Actions (Next.js)**

   * Replaced API Routes with modern Server Actions.
   * Built asynchronous CRUDs and real-time updates.
   * Resolved type errors and data flow issues.

4. **Authentication with Firebase**

   * Configured Firebase Authentication (email/password).
   * Created global authentication context.
   * Implemented route protection and redirection logic.
   * Enhanced user experience with error handling and UI feedback.

5. **Frontend and UX**

   * Built a clean, modern interface with **Tailwind CSS** and **Shadcn/UI**.
   * Developed reusable, responsive components.
   * Added form validation and dynamic user interactions.

6. **Deployment and Version Control**

   * Stable deployment on **Vercel**.
   * Continuous version control with **Git and GitHub**.
   * Solved merge conflicts and monitored build logs effectively.

---

## 📘 Lessons Learned

* Building complete full-stack systems using **Next.js + Prisma + PostgreSQL**.
* Secure integration with **Firebase Authentication**.
* Applying real-world **ORM, TypeScript typing, and foreign key** concepts.
* Hands-on experience with **CI/CD pipelines and production logs**.
* The importance of clear documentation and version tracking.

---

## 🧑‍💻 Author

**👤 Lucas Mori**
Student at **SENAC**, focusing on **Data Science and Web Development**.
Passionate about creating complete solutions integrating databases, business logic, and modern interfaces.

📎 [GitHub](https://github.com/lucashamori)
📧 Contact: [lucashamori@gmail.com](mailto:lucashamori@gmail.com)

---

## 🏁 Conclusion

The **SGP-2** represents the union of theory and practice — a project built from scratch to explore learning, integration, and full-stack development experience.

Through its construction, I gained a deep understanding of **frontend-backend-database** flows and applied modern concepts of authentication, deployment, and architecture.

> “More than just a management system, SGP-2 is the embodiment of a learning journey, persistence, and professional growth.”
