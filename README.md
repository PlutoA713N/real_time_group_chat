# 📐 ARCHITECTURE.md

## 🧩 Project Overview

This is a **real-time group chat API** backend built with Node.js, TypeScript, Express, Socket.IO, and MongoDB. It supports real-time messaging, JWT-based authentication, RESTful APIs for messaging and group chat, and Redis for scalability across multiple instances.

The application is containerized using Docker and configured via environment variables. Jest is used for unit testing across all controller layers.

---

## 🛠 Tech Stack

| Component              | Technology              |
|------------------------|--------------------------|
| Language               | TypeScript (Node.js)     |
| Framework              | Express                  |
| Real-Time Engine       | Socket.IO                |
| Database               | MongoDB                  |
| Caching / Pub-Sub      | Redis                    |
| Authentication         | JWT                      |
| Containerization       | Docker + Docker Compose  |
| Testing                | Jest                     |
| API Documentation      | Swagger (OpenAPI)        |

---

## 🧱 Folder Structure

### 📂 Folder Descriptions

- **`app.ts`**: The main file where the Express app and Socket.IO server are set up.

- **`config/`**: Contains files for environment variables and configurations related to the database, mongodb, and other integrations.

- **`controllers/`**: Handles the logic for various API endpoints, including user authentication, message handling, and group management.

- **`errors/`**: Centralized error handling classes, used for standardizing error responses and error messages.

- **`express/`**: Contains Express-specific logic, such as the app configuration, middleware setup, and routes.

- **`index.ts`**: Entry point to the app, where the server is initialized and started.

- **`interfaces/`**: Contains TypeScript interfaces, which define the structure of the data used in various parts of the application.

- **`middleware/`**: Houses authentication, validation, and error handling middleware.

- **`models/`**: Mongoose schema definitions for users, messages, groups, etc.

- **`redis/`**: Contains logic for Redis setup, including connection, configuration, redis database utils.

- **`routes/`**: Contains Express route definitions that are used to map URL paths to controller functions.

- **`sockets/`**: Handles all the logic related to Socket.IO events, such as sending/receiving real-time messages.

- **`swagger/`**: Setup files for Swagger/OpenAPI documentation for the API.

- **`tests/`**: Contains Jest test cases for various parts of the application, focusing on unit testing controllers and business logic.

- **`utils/`**: A collection of utility functions, such as data sanitization or common helper methods used across the project.

---

This Markdown file now describes the project structure clearly for anyone looking at it. Let me know if you'd like further elaboration or changes!


## 🔐 Authentication

- **JWT** is used for stateless user authentication.
- Tokens are verified for both REST requests and WebSocket connections.
- Middleware ensures that unauthorized users are blocked from protected routes or socket events.

---

## 📡 Real-Time Messaging (Socket.IO)

**Flow:**

1. Client connects and authenticates using JWT.
2. Server validates the token and adds the socket to user-specific and group rooms.
3. Messages are sent via the socket, stored in MongoDB, and emitted to receivers.
4. Redis is used here managing tokens, and in future ensure message delivery across horizontally scaled instances.

---

## 🌐 RESTful APIs

### Root

- `GET /` Get a architecture doc of this project as .md or html

### Auth

- `POST /register`: User registration and receive jwt
- `POST /login`: Login and receive JWT

### Messaging

- `POST /api/messages`: Send direct or group message
- `GET /api/messages/history`: Fetch chat history

### Group Chat

- `POST /api/groups`: Create a new group
- `POST /api/groups/:groupId/message`: Send message to a group

### Swagger Doc

- `GET /api-docs`: Get a doc of apis
---

## 🗄 Database Models

# 📚 Models Documentation

This document provides an overview of the Mongoose models used in the project. Each model is structured to handle the main features of the application, such as user registration, messaging, and groups.

---

## 🧑‍🤝‍🧑 **User Registration Model**

### Structure:

- **username**: A unique string identifier for the user.
- **email**: The user's email address (must be unique).
- **password**: The user's password with validation (complexity requirements).
- **createdAt**: Timestamp for when the user was created.
- **updatedAt**: Timestamp for when the user data was last updated.

### Purpose:

This model handles the user registration process. It ensures that each user has a unique username and email, and that the password adheres to complexity rules.

---

## 💬 **User Message Model**

### Structure:

- **senderId**: The ID of the user sending the message (required).
- **receiverId**: The ID of the recipient user (optional for group messages).
- **groupId**: The ID of the group receiving the message (optional for direct messages).
- **content**: The content of the message (required).
- **createdAt**: Timestamp for when the message was created.
- **updatedAt**: Timestamp for the last update of the message.

### Purpose:

This model stores the messages sent between users and within groups. It supports direct messages between users as well as messages sent to specific groups.

### Indexes:

- **senderId** and **receiverId** index: Facilitates quick retrieval of user-to-user messages.
- **senderId** and **groupId** index: Optimizes fetching messages sent to specific groups.

---

## 🏢 **Group Model**

### Structure:

- **name**: The name of the group (required).
- **members**: An array of user IDs that belong to the group (required).
- **creatorId**: The ID of the user who created the group (required).
- **createdAt**: Timestamp for when the group was created.
- **updatedAt**: Timestamp for when the group data was last updated.

### Purpose:

This model is used to define and store information about groups. It ensures that groups have a name, a list of members, and a creator ID.

---


## 🔄 **Indexes**

- **User Message Indexes**:
    - `senderId` and `receiverId` for user-to-user messages.
    - `senderId` and `groupId` for user-to-group messages.

---

## 🔐 **Security Considerations**

- **User Registration Model**: Passwords should follow the specified complexity rules (e.g., length, uppercase/lowercase, numeric, and special characters).
- **Encryption**: Passwords and sensitive data should be encrypted before storing them in the database.

---

## ⚡ **Potential Improvements**

- **User Message Model**:
    - Introduce a `messageType` field to support richer message types (e.g., image, video, or file messages).
- **Group Model**:
    - Add a `privacy` field to allow configuration of public or private groups.
- **Indexes**:
    - Additional indexing on `groupId` and `createdAt` to support more efficient querying of group messages.

---

This is the design overview for the main data models used in the application. Each model has been structured to meet the requirements for real-time messaging, user authentication, and group management while ensuring efficiency and scalability.

# 📋 Project Overview

## ✅ Testing

All controller logic is tested using Jest.

- Test cases are located in `src/tests/`.

**Focus areas:**

- **Input Validation**: Ensure all input is validated before processing.
- **Authentication Flows**: Test registration, login, and token handling.
- **Message and Group Logic**: Ensure messaging and group functionality work as expected.
- **Error Handling and Edge Cases**: Ensure proper error responses for edge cases.

---

## 📦 Deployment

- **Dockerized** using a `Dockerfile` and `docker-compose.yml`.
- **Environment variables** managed via `.env`.
- Suitable for deployment on platforms like:
    - Railway
    - Render
    - AWS ECS

---

## 📊 Swagger Documentation

- **Swagger** is set up under `src/swagger/`.
- API documentation is generated and served via an endpoint, typically `/docs`.

---

## 🚀 Potential Improvements

| Area           | Suggestions                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Performance** | Add indexing on `messages.createdAt` for faster queries.                    |
| **Scalability** | Introduce Kafka/RabbitMQ for high-throughput message queues.                |
| **Monitoring**  | Integrate logging with Winston + Prometheus or Logtail for better observability. |
| **Security**    | Add rate limiting and brute force protection (e.g., on login).              |
| **Features**    | Support media messages via S3 or CDN, add typing indicators for real-time feedback. |
| **Testing**     | Add integration tests for full socket <-> REST workflows.                   |

---

## 📌 Design Considerations

- **Modular Structure**: Logical separation of concerns for maintainability.
- **Type Safety**: TypeScript ensures contract enforcement across layers.
- **Docker-Ready**: Easy to spin up locally and deploy consistently.

