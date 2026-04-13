# Streamline Backend

Backend service for a video-based platform (similar to YouTube-lite) built with Node.js, Express, and MongoDB.

---

## Features

* User authentication & authorization (JWT-based)
* Video upload & management
* Comments system
* Subscriptions (follow creators)
* Middleware handling (auth, multer for file uploads)
* Scalable MVC architecture

---

## Project Structure

```
backend/
│── src/
│   ├── controller/       # Business logic (user, video)
│   ├── db/               # Database connection
│   ├── middleware/       # Auth & file upload middleware
│   ├── model/            # Mongoose schemas
│   ├── router/           # API routes
│   ├── utils/            # Helper functions
│   ├── app.js            # Express app config
│   └── server.js         # Entry point
│
├── .env                  # Environment variables
├── .gitignore
├── package.json
```

---

##  Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* Multer (file upload)
* JWT Authentication

---

## Installation Procedure

Clone the repo:

```bash
git clone <your-repo-url>
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in root:

```
PORT=5000
MONGODB_URI=your_mongo_connection
JWT_SECRET=your_secret
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET=your_secret
```

---

##  Running the Server

Development mode:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

##  API Overview

### User Routes

* Register User
* Login User
* Get User Profile

### Video Routes

* Upload Video
* Get All Videos
* Get User Videos

### Other

* Comments
* Subscriptions

---

## Authentication Flow

1. User logs in
2. JWT token is generated
3. Token is stored (cookie or header)
4. Protected routes use `auth.middleware.js`

---

## Important Files

* `auth.middleware.js` → Protect routes
* `multer.middleware.js` → Handle file uploads
* `user.model.js` → User schema
* `video.model.js` → Video schema

---

##  Notes

* `.env` and `node_modules` should never be pushed
* Always validate user input
* Use async error handling properly

---


## 👨‍💻Author

RJha
