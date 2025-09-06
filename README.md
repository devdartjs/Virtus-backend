# 🟢 Virtus Backend

A modular and type-safe RESTful backend for the **Virtus eCommerce Platform**, built with **Bun**, **Elysia.js**, and **TypeScript**, powered by **Prisma ORM** and **PostgreSQL** with **Docker**.  
Tested with **Vitest**, documented with **Swagger (OpenAPI 3.0)**, instrumented with **OpenTelemetry** for simple observability and logs.

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

## 🟠 Features

- ⚡️ Runtime with **Bun** + **Elysia.js**
- 🔄 RESTful API with full CRUD support
- 🛡️ Request validation using **Zod** | **Elysia t Schemas** schemas
- 🧠 **PostgreSQL** database via **Prisma ORM** with **Adminer container**
- 📦 Containers with **Docker**
- 📄 API'S Fully documented using **Swagger UI (OpenAPI 3.0)**
- 🔍 Observability with structured logs via **OpenTelemetry**
- 🧪 Unit and integration testing with **Vitest**
- ✨ Type-safe codebase written entirely in **TypeScript**

---

## 🟡 Technologies Used

- **Bun** as JavaScript/TypeScript runtime
- **Elysia.js** as Web framework
- **TypeScript** for type safety
- **Prisma ORM** + **PostgreSQL** as database layer
- **Docker** and **Docker-Hub**
- **Zod | Elysia t** for runtime schema validation
- **Swagger** / **OpenAPI 3.0** for API documentation
- **OpenTelemetry** for observability and logging
- **Vitest** for testing

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
cd virtus-backend
docker-compose --profile <env> up --build
```

Replace <env> with:

dev → Development

stage → Staging

test → Testing

Adminer (Database UI): http://localhost:8080

### ⚪ Testing inside containers

```bash
docker-compose --profile test up --build -d
docker ps
docker exec -it <app_container> sh
bun run test:coverage
```
