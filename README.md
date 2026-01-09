# Primetrade.ai Full Stack Intern Task

## Overview
A modern, responsive web application for traders to journal their trades and get AI-powered analysis. Built with React (Vite) and FastAPI.

## Features
- **Frontend**: React, TailwindCSS, GSAP Animations, Glassmorphism UI.
- **Backend**: FastAPI, SQLAlchemy (MySQL), JWT Authentication.
- **AI Feature**: Mock AI analysis for trade notes.
- **Security**: Password hashing (Bcrypt), Protected Routes.

## Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.8+
- MySQL Server

### 1. Database Setup
Ensure MySQL is running. Create a database named `primetrade`.
Update `backend/.env` with your credentials if different:
```env
DATABASE_URL=mysql+pymysql://root:@localhost/primetrade
```

### 2. Backend Setup
Navigate to `backend/` folder (or root if running from workspace root):
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run Server
cd backend
uvicorn main:app --reload
```
API Docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
Navigate to `intern-task/` (or `frontend/` if renamed):
```bash
cd intern-task
# Install dependencies
npm install

# Run Dev Server
npm run dev
```
Open `http://localhost:5173` in your browser.

## Scalability Note
To scale this application for production:
1.  **Backend**: Containerize with Docker/Kubernetes. Use Gunicorn behind Nginx. Implement Redis for caching.
2.  **Database**: Use connection pooling (already in SQLAlchemy), migrate to a managed DB (AWS RDS), and implement read replicas.
3.  **Frontend**: CDN for static assets, lazy loading for routes/components.
4.  **Auth**: Switch to OAuth2 provider (Auth0/Firebase) or refined Refresh Token rotation.
