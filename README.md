# 🟢 Virtus Backend

A modular and type-safe RESTful backend for the **Virtus eCommerce Platform**, built with **Bun**, **Elysia.js**, and **TypeScript**, using **Docker** and **PostgreSQL** as relational database with **Prisma** as ORM.  
This backend was tested with **Vitest**, documented with **Swagger (OpenAPI 3.0)**.

---

## 🔵 Table of Contents

- [📦 Features](#-features)
- [⚙️ Technologies Used](#-technologies-used)
- [🧑‍💼 Getting Started](#-getting-started)
  - [Prerequisites](#-prerequisites)
  - [Local Development](#-local-development)
  - [Docker Development](#-docker-development)
- [🧪 Running Tests](#-running-tests)
- [📘 API Documentation (Swagger)](#-api-documentation-swagger)
- [🗂️ Project Structure](#️-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🟠 Some Features

🔄 CRUD Support: Manage eCommerce resources like products and orders consistently.

🛡 Automatic Request Validation: Ensures data integrity and security.

🧠 Data Persistence: PostgreSQL database managed via Prisma ORM.

📄 Documented API: Swagger UI makes endpoints easy to explore and test.

🔍 Integrated Observability: Structured logs and metrics with OpenTelemetry for monitoring and debugging.

🧪 Testing: Unit and integration tests powered by Vitest.

📦 Production-Ready: Dockerized setup, easy to run in any environment.

---

## 🟡 Technologies Used

- **Bun** as JavaScript/TypeScript runtime
- **Elysia.js** as Web framework
- **TypeScript** for type safety
- **PostgreSQL** as database layer with **Prisma ORM**
- **Docker** and **Docker-Hub**
- **Elysia t** for runtime schema validation
- **Swagger** / **OpenAPI 3.0** for API documentation
- **OpenTelemetry** for observability and logging
- **Vitest** for testing
- **SonarQube** and **snyk** as SAST tool

---

## 🟣 Getting Started

### 🟡 Prerequisites

- **Bun** (>= 1.1.x)
- **PostgreSQL**
- **Git**
- **Docker** (recommended, for containerized setup)

### ⚪ Clone the repository and run locally

```bash
git clone https://github.com/your-username/virtus-backend.git
cd virtus-backend/app
bun install
bun prisma migrate dev --name init
bun prisma generate
bun dev
```

API available at: http://localhost:3000
Swagger UI: http://localhost:3000/swagger

### ⚪ Clone the repository and run with containers

```bash
git clone https://github.com/devdartjs/Virtus-backend.git
cd virtus-backend/app/
docker-compose --profile <"env" > up --build
```

Replace <"env"> with:

- dev → Development with Adminer (Database UI)
- stage → Staging
- test → Testing

### ⚪ Testing

```bash
bun run test:coverage
```

### ⚪ Testing inside containers

```bash
docker-compose --profile test up --build -d
docker exec <app_container > bun run test:coverage
```
