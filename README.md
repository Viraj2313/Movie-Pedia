# 🎬 Movie Pedia Project

Welcome to **Movie Pedia**, a dynamic web application where users can explore movies, connect with friends, and chat about their favorite recommendations.
### Live preview - https://moviepedia.virajdeveloper.online/
## 📁 Folder Structure

```
├─ Movie-Pedia/   # ASP.NET Core API
│  ├─ backend/# API code
│  └─ README.md   # Backend-specific information
├─ frontend/      # React app
│  ├─ src/        # React components and logic
│  ├─ public/     # Static files
│  ├─ tests/      # Frontend tests
│  └─ README.md   # Frontend-specific information
├─ movie-recommender/
|  ├─ app.py      # Movie recommendation (Machine Learning script)
├─ .github/       # CI/CD workflows
├─ .gitignore     # Git ignore rules
└─ README.md      # Project overview
```

## 🔑 Technologies Used
### Backend
- ASP.NET Core 8
- MySQL
- Entity Framework Core
- JWT Authentication

### Frontend
- React (Vite)
- Tailwind CSS
- Context API
  
### Containerization 
- **Docker**
- **Docker-compose**

### Infrastructure
- **Database Hosting**: Linux VM
- **Deployment**: Linux VM
- **CI/CD**: GitHub Actions

## 🌟 Features
- 🔍 Browse movies by title and IMDb rating
- 💬 Real-time chat to share movie recommendations with friends
- ❤️ Wishlist functionality
- `Social Login with Google OAuth 2.0 or Custom Login
- 🔐 Secure JWT-based authentication 
- ⚡ Context API-based global state management
- 🌐 Cross-domain cookie support
- Movie recommendation through machine learning based on user’s preferences
## 🚀 Installation

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd MovieApiApp
   ```
2. Install dependencies:
   ```bash
   dotnet restore
   ```
3. Run the API:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables
Configure your environment by creating a `.env` file in both the `frontend` and `MovieApiApp` folders.

### Backend
```
ConnectionStrings__DefaultConnection=your_mysql_connection_string
Jwt__Secret=your_jwt_secret
```

### Frontend
```
VITE_API_URL=your_backend_api_url
```

## 🤝 Contributing
Contributions are welcome! Fork the repository, create your feature branch, and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
