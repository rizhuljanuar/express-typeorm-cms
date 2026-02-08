# Quick Start Guide

## 🚀 Setup Instructions

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env if needed (default values work for local development)
nano .env
```

### 2. Start Database (Choose One)

#### Option A: Using Docker (Recommended)
```bash
docker-compose up postgres -d
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb cms_db

# Make sure PostgreSQL is running on port 5432
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post",
    "status": "draft"
  }'

# List posts
curl http://localhost:3000/api/posts?skip=0&take=10

# Get post by ID (replace with actual ID)
curl http://localhost:3000/api/posts/{post-id}
```

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop with volume cleanup
docker-compose down -v
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 📊 Database Migrations

```bash
# Generate migration
npm run migration:generate -- --name=AddUserTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📚 Next Steps

1. Read `EXPLANATION.md` for detailed architecture (in Indonesian)
2. Check `README.md` for API documentation
3. Review code in `src/` directory
4. Run integration tests to verify setup

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Health check endpoint returns 200
- [ ] Can create a post via API
- [ ] Can list posts with pagination
- [ ] Database tables created successfully
- [ ] Tests pass successfully

## 🆘 Need Help?

- Check logs in `logs/` directory
- Review error messages in console
- Ensure all dependencies are installed
- Verify database connection settings

---

**Happy Coding! 🚀**
