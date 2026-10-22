# LIFE-LINK: Java 21 Spring Boot + MySQL 8 REST Backend

### College Project Context
**Easwari Engineering College**  
*Department of Artificial Intelligence and Data Science*  
*Capstone Project: LIFE-LINK — AI-Powered Disaster Response & Community Resilience Platform*

---

## Architecture Overview
- **Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Validation, Spring Security, Spring Boot Actuator)
- **Database:** MySQL 8 (`lifelink_db`) with HikariCP connection pooling
- **Build System:** Apache Maven 3.9+
- **API Standard:** RESTful JSON endpoints with CORS support for frontend clients

---

## 1. Database Setup (MySQL 8)

1. Ensure MySQL 8 is running locally or in your target container.
2. Connect to MySQL as root or an administrative user:
   ```bash
   mysql -u root -p
   ```
3. Create the database:
   ```sql
   CREATE DATABASE lifelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Tables (`incidents`, `sos_requests`, `risk_warnings`, `depots`, `inventory_items`, `allocations`, `hospitals`, `shelters`, `rescue_teams`, `volunteers`, `users`) will be automatically created and populated from `src/main/resources/schema.sql` and `src/main/resources/data.sql` when Spring Boot launches with `spring.sql.init.mode=always`.

---

## 2. Configuration & Environment Variables

Configure database credentials using environment variables or in `src/main/resources/application.properties`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Port for REST API server |
| `DB_HOST` | `localhost` | MySQL Server hostname |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `lifelink_db` | Database schema name |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `root` | Database password (never hardcoded) |

Example launch with custom credentials:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=lifelink_db
export DB_USER=root
export DB_PASSWORD=my_secure_password
```

---

## 3. Building and Running the Application

### Using Maven Wrapper / Installed Maven:
```bash
# Inside the /backend directory:
cd backend

# Compile and package into executable JAR
mvn clean package -DskipTests

# Run Spring Boot application
mvn spring-boot:run
```

Alternatively, run the packaged JAR directly:
```bash
java -jar target/lifelink-backend-1.0.0-SNAPSHOT.jar
```

---

## 4. Verifying Health Check

Once the server has booted on port 8080, run:
```bash
curl http://localhost:8080/api/health
```

Expected JSON response:
```json
{
  "status": "UP",
  "application": "LIFE-LINK Disaster Response Backend",
  "version": "1.0.0-spring-boot-mysql",
  "database": "CONNECTED",
  "timestamp": "2026-10-14T20:00:00Z"
}
```

---

## 5. Connecting the React Frontend

1. In the React root directory, open `.env` or set:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
2. Start or refresh the React Vite development server (`npm run dev`).
3. Click the badge in the top navigation bar to confirm `REST API Connected`.
4. If the backend is stopped or running on a separate student laptop without a tunnel, LIFE-LINK automatically engages **Interactive Demo Mode**, preserving complete UI responsiveness, form validation, and local storage state.
