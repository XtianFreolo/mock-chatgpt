
My MOCK CHAT-GPT app. 

A full stack MOCK Chat-GPT style web application built for my capstone project. 

Users can 
Register for an Account
Log-in with JWT based Auth
Chat with the mock GPT bot that 
saves conversation through postgresQL database
return rule based responses with special behavior when you talk about taylor swift or football. 


Tech stack

FE

React and VITE
React router for multi-page navi 
React Context API for Global Auth state persisted with local storage
CSS modules for styling 

BE

Node.js and Express
REST API (`/api/auth`, `/api/chat`)
JWT for auth and protected routes
postgreSQL for persistent storage
`pg` for database access

Testing
Mocha 
Chai
SuperTest



Register with email + password
Passwords are hashed with bcrypt before storing
Login returns a JWT that is stored on the client
Protected routes on the backend require a valid `Authorization: Bearer <token>` header
React Context provides global auth state and persists it via `localStorage`


Authenticated users can send messages to `/api/chat`
Backend:
Stores user message in `messages` table
Generates a mock response via a rule-based `generateMockReply` function
Stores assistant response as well

Frontend:
Displays conversation history
Loads history from `/api/chat/history` when the user logs in
Includes preset prompt buttons for common topics
Clicking the chat window focuses the input for smoother UX


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



