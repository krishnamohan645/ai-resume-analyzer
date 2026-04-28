# AI Resume Analyzer

AI Resume Analyzer is a full-stack web application that reviews resumes against a job description, scores the match, identifies missing keywords, highlights weak bullet points, and generates stronger resume content using LLMs.

The project is built as a practical SaaS-style application with authentication, protected routes, resume history, PDF parsing, AI fallback providers, and a PostgreSQL-backed API.

![AI Resume Analyzer Preview](frontend/src/assets/hero.png)

## Features

- **AI resume analysis** with a match score from 0-100
- **Job description matching** for role-specific feedback
- **Missing keyword detection** with importance labels
- **Weak bullet detection** with explanation
- **Rewrite suggestions** for stronger impact statements
- **Resume optimization** that generates improved Markdown content
- **User authentication** with JWT
- **Protected dashboard** with previous analysis history
- **PDF upload and parsing** using in-memory uploads for cloud deployment
- **AI fallback system** using Groq and Google Gemini
- **Rate limiting** for analysis requests
- **Responsive React UI** built with Vite and Tailwind CSS

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- React Markdown

### Backend

- Node.js
- Express 5
- PostgreSQL
- Sequelize
- JWT authentication
- Multer
- pdf-parse
- Groq SDK
- Google Generative AI SDK
- Express Rate Limit

## Project Structure

```text
ai-resume-builder/
|-- backend/
|   |-- index.js
|   |-- package.json
|   `-- src/
|       |-- api/
|       |   |-- controllers/
|       |   |-- data/
|       |   |-- models/
|       |   |-- routes/
|       |   `-- services/
|       |-- config/
|       `-- middleware/
|-- frontend/
|   |-- index.html
|   |-- package.json
|   `-- src/
|       |-- components/
|       |-- context/
|       |-- pages/
|       `-- services/
`-- README.md
```

## How It Works

1. A user registers or logs in.
2. The user uploads a PDF resume and optionally pastes a job description.
3. The backend parses the PDF text in memory.
4. The analysis service adds expert resume context from `knowledge.json`.
5. The prompt is sent to Groq first, with fallback models if one provider fails.
6. The API returns structured JSON containing score, gaps, strengths, keywords, and rewrites.
7. The analysis is saved to PostgreSQL and shown in the dashboard.

## Getting Started

### Prerequisites

Make sure you have:

- Node.js 22.21.0 or newer
- npm
- PostgreSQL database
- Groq API key
- Google Gemini API key

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside the `backend` folder. You can start from the example file:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
ANALYZE_RATE_LIMIT_MAX=30
```

Create a `.env` file inside the `frontend` folder. You can start from the example file:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000
```

Never commit real `.env` files or API keys.

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the app:

```text
http://localhost:5173
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |

### User

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/me` | Get authenticated user profile |

### Resume Analysis

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/analyze` | Upload and analyze a resume |
| `GET` | `/api/analyze/history` | Get previous analyses |
| `POST` | `/api/analyze/improve` | Generate optimized resume content |

Protected endpoints require:

```http
Authorization: Bearer <token>
```

## Example Analyze Request

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@resume.pdf" \
  -F "jobDescription=Frontend Developer role requiring React, APIs, and testing"
```

## Deployment Notes

### Backend

The backend can be deployed on platforms like Render, Railway, or similar Node.js hosts.

Important production settings:

- Add all backend environment variables.
- Use a hosted PostgreSQL database.
- Set `FRONTEND_URL` to your deployed frontend URL.
- Keep `app.set("trust proxy", 1)` enabled when running behind a platform proxy.
- Tune `ANALYZE_RATE_LIMIT_MAX` based on your usage limits.

### Frontend

The frontend can be deployed on Vercel, Netlify, or any static hosting provider.

Set:

```env
VITE_API_URL=https://your-backend-url.com
```

Then build:

```bash
npm run build
```

## Security Notes

- Passwords are hashed before storage.
- JWTs are used for protected API access.
- Resume uploads are processed in memory instead of being permanently stored.
- API keys must stay on the backend only.
- Rate limiting protects expensive AI analysis routes.

## Roadmap

- Support DOCX parsing
- Add downloadable optimized resume exports
- Add admin usage analytics
- Add email verification
- Add password reset flow
- Add better prompt versioning and evaluation tests
- Add cloud file storage for optional resume archive support

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Run lint/build checks.
5. Open a pull request with a clear description.

## License

This project is licensed under the ISC License.

## Author

Built by Krishna Mohan.
