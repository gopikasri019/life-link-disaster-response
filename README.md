# LIFE-LINK – Disaster Response & Community Resilience Platform

## Project Overview

LIFE-LINK is a disaster management and emergency response platform designed to support disaster monitoring, incident management, emergency SOS requests, and resource allocation. It aims to improve coordination among government officials, hospitals, NGOs, volunteers, and affected communities.

## Objectives

- Monitor and manage multi-hazard incidents.
- Support emergency SOS request management.
- Improve allocation of essential relief resources.
- Coordinate rescue teams, volunteers, and hospitals.
- Provide a centralized dashboard for disaster response activities.
- Support disaster preparedness and community resilience.

## Key Features

- Disaster incident management
- Emergency SOS request management
- Smart resource allocation interface
- Hospital bed management interface
- Relief depot inventory management
- NGO and volunteer coordination
- Risk monitoring and early-warning interface
- Shelter management
- Reports and analytics dashboard
- Interactive GIS map interface

*Note: Feature availability and live-data integration depend on the current implementation. Some dashboard data may be demonstrative.*

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA
- Maven

**Database**
- MySQL 8

**Development Tools**
- Visual Studio Code
- Git and GitHub
- MySQL Workbench

## Project Structure

```text
life-link-disaster-response/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
├── src/
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── package-lock.json
├── index.html
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- Java JDK 21
- Apache Maven
- MySQL Server 8

## Run the Frontend

Open a terminal in the project root directory and execute:

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Run the Backend

Configure your MySQL database and environment variables before starting the backend.

From the project root, run:

```powershell
cd backend
mvn spring-boot:run
```

If Maven is not available in your system PATH, use your local Maven installation's `mvn.cmd` executable.

The backend uses port `8080` by default. Its health endpoint is:

```text
http://localhost:8080/actuator/health
```

## Database Configuration

Configure the following environment variables according to your environment:

- `DB_HOST` – MySQL server hostname
- `DB_PORT` – MySQL port
- `DB_NAME` – database name
- `DB_USER` – database username
- `DB_PASSWORD` – database password

Never commit real passwords, API keys, or other secrets to a public repository.

## Future Enhancements

- User registration and secure login
- Role-based dashboards and access control
- Real-time disaster alerts and data integration
- Live GIS-based incident monitoring
- Improved emergency notifications
- Cloud deployment and production monitoring

## Project Purpose

LIFE-LINK aims to provide a centralized digital platform for disaster response coordination, emergency resource management, and community resilience.

---

**Project:** LIFE-LINK – Disaster Response & Community Resilience Platform  
**Type:** Java Full-Stack Mini Project
