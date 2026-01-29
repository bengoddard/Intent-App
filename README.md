# Intent - Full-Stack Application
This app is designed to help users take control of their free time by intentionally choosing better experiences. It serves as a social platform for tracking, reviewing, and discovering media across multiple formats, including movies, TV shows, books, video games, and music.

## Project Description
Inspired by platforms like Letterboxd, this app expands the concept beyond film to create a unified space for all types of media. Users can maintain a personal To-Experience list—a single, organized place to save anything they want to watch, read, play, or listen to. The list can be filtered by media type, making it easy to find something that fits the user’s current mood or available time.

Ultimately, this app aims to turn passive consumption into intentional experience—helping users waste less time deciding, and spend more time enjoying things that matter to them.

## Technologies Used

### Frontend
- **React 19** - UI library for building interactive user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM 7** - Client-side routing and navigation
This project was created using Flask for the backend and React for the frontend.

### Backend
- **Flask 3.0** - Python web framework
- **Flask-SQLAlchemy 3.1** - ORM for database operations
- **Flask-JWT-Extended 4.6** - JWT token management for authentication
- **Flask-CORS 4.0** - Cross-origin resource sharing
- **bcrypt 4.1** - Password hashing and security
- **flask-migrate 4.0** -Simplifies database schema migrations for applications using SQLAlchemy.
- **SQLAlchemy** - Database abstraction layer


## Setup and Run Instructions

### Backend Setup
1. **Install backend dependencies:**
    ```bash
   pipenv install
   ```
2. **Create virtual environment:**
    ```bash
   pipenv shell
   ```
3. **Navigate to server directory:**
   ```bash
   cd server
   ```
4. **Start flask server:**
   ```bash
   flask run --port 5555
   ```

    The backend needs to run at **http://localhost:5555**

### Frontend Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start React App:**
   ```bash
   npm run start
   ```

   The frontend will run at **http://localhost:4000**
   To see some sample data, you can login with username: Ben, and password: password123


### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
