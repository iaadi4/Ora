# ORA (Audio Journal)

![image](https://github.com/user-attachments/assets/f0c7b960-1adf-47cc-bc10-827269ddb8c5)

**Transform your voice into meaningful insights with AI-powered transcription and emotion analysis**

![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=flat-square&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=flat-square&logo=prisma&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-232F3E?style=flat-square&logo=amazons3&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)

## Features

- **Audio Recording & Upload** - Seamlessly record or upload audio files
- **AI Transcription** - Powered by OpenAI Whisper for accurate speech-to-text
- **Emotion Analysis** - Detect emotions in your journal entries using advanced NLP
- **Journal Management** - Organize entries into multiple journals
- **Top Journals** - Track your most active journals
- **PDF Export** - Export your thoughts as beautifully formatted PDFs
- **Secure Authentication** - Protected user sessions with Better Auth
- **Cloud Storage** - Reliable audio storage with AWS S3
- **Privacy Controls** - Private entries and journals by default

## Architecture

The application follows a microservices architecture with clear separation of concerns:

- **Frontend**: Next.js with TypeScript for the user interface
- **Backend API**: Next.js API routes handling business logic
- **ML Service**: FastAPI service for audio processing and analysis
- **Database**: PostgreSQL with Prisma ORM and Prisma Accelerate
- **Storage**: AWS S3 for audio file storage
- **Authentication**: Better Auth for secure user management

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Python 3.8+
- PostgreSQL database (or Prisma Accelerate)
- AWS S3 bucket

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/iaadi4/Ora.git
cd Ora
```

**2. Frontend Setup**

```bash
# Install dependencies
yarn install

# Set up environment variables
.env
```

**Environment Variables:**
```env
# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Database (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket-name"
BUCKET_REGION="eu-north-1"
```

**3. Database Setup**

```bash
# Generate Prisma client
yarn prisma generate

# Run migrations (if using direct database connection)
yarn prisma migrate dev
```

**4. Whisper Server Setup**

```bash
# Navigate to whisper-server directory
cd whisper-server

# Install dependencies
pip install -r requirements.txt

# Activate virtual environment
source .venv/bin/activate

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8000
```

**5. Start the Application**

```bash
# Start Next.js development server
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
audio-journal/
├── app/
│   ├── (pages)/
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── export-pdf/
│   │   ├── journals/
│   │   ├── records/
│   │   └── transcribe/
│   ├── generated/
│   │   └── prisma/           # Generated Prisma client
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── helper/
├── lib/
├── prisma/
│   └── schema.prisma
├── public/
├── whisper-server/
│   ├── __pycache__/
│   ├── .venv/
│   ├── main.py
│   └── requirements.txt
└── [configuration files]
```

## AI Models

### Speech-to-Text
- **Model**: OpenAI Whisper (tiny.en, you can change it)
- **Features**: Fast, english transcription
- **Performance**: Optimized for real-time processing

### Emotion Analysis
- **Model**: j-hartmann/emotion-english-distilroberta-base
- **Emotions**: Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral
- **Output**: Confidence scores for each detected emotion

## 📊 Database Schema

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
  Entry         Entry[]
  Journal       Journal[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Entry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  audioUrl   String
  transcript String?
  sentiment  Json?
  duration   Float?
  language   String?
  isPrivate  Boolean @default(true)
  
  Journal   Journal @relation(fields: [journalId], references: [id])
  journalId String
  
  @@index([userId, createdAt])
}

model Journal {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isPrivate Boolean  @default(true)
  entries   Entry[]
}
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
yarn build
vercel --prod
```

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your production URL)
- `DATABASE_URL` (Prisma Accelerate connection string)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BUCKET_NAME`
- `BUCKET_REGION`

### ML Service (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Package Management

This project uses **Yarn** as the package manager. Common commands:

```bash
# Install dependencies
yarn install

# Add a package
yarn add package-name

# Add a dev dependency
yarn add -D package-name

# Start development server
yarn dev

# Build for production
yarn build

# Run Prisma commands
yarn prisma generate
yarn prisma studio
yarn prisma migrate dev
```

## Database Management

### Prisma Accelerate
This project uses Prisma Accelerate for improved database performance and connection pooling. The Prisma client is generated to `app/generated/prisma/` directory.

### Useful Commands
```bash
# Generate client
yarn prisma generate

# View database in browser
yarn prisma studio

# Reset database (development)
yarn prisma migrate reset
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Screenshots
![image](https://github.com/user-attachments/assets/2d814be6-8051-4267-af1d-d323e6269a1d)
![image](https://github.com/user-attachments/assets/58fb1d1c-99bf-4ff7-a0c1-15e32c57c0af)
![image](https://github.com/user-attachments/assets/64931986-8357-41a8-b292-6ff39135aa15)
![image](https://github.com/user-attachments/assets/262af1ec-e808-4059-a9e4-1ad70b227966)


---

<div align="center">
  <p>Made with ❤️ for capturing and understanding your thoughts</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
