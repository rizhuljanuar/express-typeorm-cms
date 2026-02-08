# Express TypeORM CMS API

Production-grade Headless CMS REST API built with Express.js, TypeScript, TypeORM, PostgreSQL, and Zod.

## 🚀 Features

- ✅ **TypeScript Strict Mode** - Type-safe codebase
- ✅ **TypeORM** - Modern ORM with DataSource pattern
- ✅ **Zod Validation** - Runtime type validation
- ✅ **Repository Pattern** - Clean data access layer
- ✅ **Soft Delete** - Data recovery capability
- ✅ **Pagination** - Efficient data retrieval
- ✅ **Security** - Helmet, CORS, Rate Limiting
- ✅ **Structured Logging** - Winston with file rotation
- ✅ **Error Handling** - Centralized error management
- ✅ **Docker** - Containerized deployment
- ✅ **Testing** - Vitest for unit & integration tests

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## 🗄️ Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Run application
npm run dev
```

### Using Local PostgreSQL

```bash
# Create database
createdb cms_db

# Set DATABASE_URL in .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=cms_db
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start with hot-reload

# Production
npm run build        # Compile TypeScript
npm start            # Run compiled code

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Database
npm run migration:generate   # Create migration
npm run migration:run        # Run migrations
npm run migration:revert     # Rollback migration
```

## 📡 API Endpoints

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts` | List posts (with pagination) |
| GET | `/api/posts/:id` | Get post by ID |
| PATCH | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post (soft delete) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## 📝 Usage Examples

### Create Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post",
    "excerpt": "A short summary",
    "status": "draft"
  }'
```

### List Posts (with Pagination)

```bash
curl "http://localhost:3000/api/posts?skip=0&take=10&status=published"
```

### Get Post by ID

```bash
curl http://localhost:3000/api/posts/{post-id}
```

### Update Post

```bash
curl -X PATCH http://localhost:3000/api/posts/{post-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "published"
  }'
```

### Delete Post

```bash
curl -X DELETE http://localhost:3000/api/posts/{post-id}
```

## 🏗️ Project Structure

```
src/
├── @types/              # Custom TypeScript definitions
├── config/              # Database & environment configuration
├── constants/           # HTTP status codes, error messages
├── controllers/         # Request handlers
├── dtos/                # Zod validation schemas
├── interfaces/          # Dependency injection interfaces
├── middlewares/         # Express middlewares
├── models/              # TypeORM entities
├── repositories/        # Data access layer
├── routes/              # Route definitions
├── services/            # Business logic layer
├── utils/               # Helper functions
├── app.ts               # Express app setup
└── server.ts            # Server bootstrap
```

## 🔒 Security Features

- **Helmet** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests/15min per IP
- **Input Validation** - Zod schema validation
- **Soft Delete** - Data recovery capability

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop with volume cleanup
docker-compose down -v
```

## 📊 Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cms_db
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=true
```

## 📚 Documentation

For detailed architecture explanation in Indonesian, see [EXPLANATION.md](./EXPLANATION.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using Express.js, TypeORM, and TypeScript
