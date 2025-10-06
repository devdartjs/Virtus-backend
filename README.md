# 🔹 Virtus Backend

A modular and type-safe RESTful backend for the **Virtus eCommerce Platform**, built with **Bun**, **Elysia.js**, and **TypeScript**, using **Docker** and **PostgreSQL** as database.

---

## Table of Contents

- [📄 Features](#-features)
- [📄 Technologies Used](#-technologies-used)
- [📄 Getting Started](#-getting-started)
  - [Prerequisites](#-prerequisites)
  - [Local Development](#-local-development)
  - [Docker Development](#-docker-development)
- [📄Running Tests](#-running-tests)
- [📄Sonar-scanner report](#-running-sonar-scanner)
- [📄API Documentation (Swagger)](#-api-documentation-swagger)

---

## Some Features

- CRUD Support: Manage eCommerce resources like products and orders consistently.

- Automatic Request Validation: Ensures data integrity and security.

- Data Persistence: PostgreSQL database managed via Prisma ORM.

- Documented API: Swagger UI makes endpoints easy to explore and test.

- Integrated Observability: Structured logs and metrics with OpenTelemetry for monitoring and debugging.

- Testing: Unit and integration tests using by Vitest.

- Production-Ready: Dockerized setup, easy to run in any environment.

---

## Technologies Used

- **Bun** as JavaScript/TypeScript runtime
- **Elysia.js** as Web framework
- **TypeScript**
- **PostgreSQL** as database layer with **Prisma ORM**
- **Docker** and **Docker-Hub**
- **Elysia type box** for runtime schema validation
- **Swagger** / **OpenAPI 3.0** for API documentation
- **OpenTelemetry** for simple observability
- **Vitest** for testing
- **SonarQube** and **Snyk** as SAST tool

---

## Getting Started

### Prerequisites

- **Bun** (>= 1.1.x)

### - Clone the repository and run with containers in dev/stage mode

```bash
git clone https://github.com/devdartjs/Virtus-backend.git
cd virtus-backend/app/ && bun install
docker-compose --profile <dev || stage> up --build
```

### - Testing with containers

```bash
bun run build
docker-compose --profile stage up --build -d
docker exec <app_container > bun run test:coverage
```

---
