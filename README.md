# Mock ChatGPT App

A full-stack mock ChatGPT-style web application built for capstone project.

Users can:

- Register for an account
- Log in with JWT-based authentication
- Chat with a mock bot that:
  - Saves conversation history in a PostgreSQL database
  - Returns rule-based responses with special behavior for topics like football, Taylor Swift, and questions about the project

-------------------------------------------------------------------------------------------------------------------------

## Tech Stack

**Frontend**

- React + Vite
- React Router for multi-page navigation (Login → Register → Chat)
- React Context API for global auth state (user + JWT), persisted with `localStorage`
- CSS Modules for styling (`App.module.css`)

**Backend**

- Node.js + Express
- REST API (`/api/auth`, `/api/chat`)
- JSON Web Tokens (JWT) for authentication & protected routes
- PostgreSQL for persistent storage (users, messages)
- `pg` for database access

**Testing**

- Mocha
- Chai
- Supertest (integration tests against the Express app)

-------------------------------------------------------------------------------------------------------------------------

## Features

### Authentication

- Register with email + password
- Passwords are hashed with bcrypt before storing
- Login returns a JWT that is stored on the client
- Protected routes on the backend require a valid `Authorization: Bearer <token>` header
- React Context provides global auth state and persists it via `localStorage`

### Chat

- Authenticated users can send messages to `/api/chat`
- Backend:
  - Stores user message in `messages` table
  - Generates a mock response via a rule-based `generateMockReply` function
  - Stores assistant response as well
- Frontend:
  - Displays conversation history
  - Loads history from `/api/chat/history` when the user logs in
  - Includes preset prompt buttons for common topics
  - Clicking the chat window focuses the input for smoother UX

-----------------------------------------------------------------------------------------------------------------------------

## Project Structure

mock-chatgpt/
  server/           # Express + Node backend
    src/
      app.js       # Express app setup
      index.js     # Server entry point (listen on port)
      db.js        # PostgreSQL pool
      routes/
        authRoutes.js
        chatRoutes.js
      middleware/
        authMiddleware.js
      auth.test.js # Auth API tests (Mocha/Chai/Supertest)
      chat.test.js # Chat API tests
  client/           # React + Vite frontend
    src/
      main.jsx
      App.jsx
      App.module.css
      context/
        AuthContext.jsx
      pages/
        LoginPage.jsx
        RegisterPage.jsx
        ChatPage.jsx
