# Headless CMS API - Penjelasan Lengkap

## 📖 Pendahuluan

Dokumen ini menjelaskan arsitektur dan alur data dari aplikasi Headless CMS API yang dibangun dengan Express.js, TypeScript, TypeORM, PostgreSQL, dan Zod.

---

## 🏗️ Arsitektur Aplikasi

### Pola Desain Utama

Aplikasi ini menggunakan **Layered Architecture** dengan pemisahan tanggung jawab yang jelas:

```
Request → Middleware → Controller → Service → Repository → Database
```

Setiap layer memiliki fungsi spesifik:

1. **Middleware**: Validasi request, auth, rate limiting
2. **Controller**: Handle HTTP request/response
3. **Service**: Business logic
4. **Repository**: Database operations

---

## 📂 Struktur Direktori

```
src/
├── @types/              # Custom TypeScript definitions
├── config/              # Konfigurasi aplikasi (DB, Environment)
├── constants/           # Konstanta (HTTP status, error messages)
├── controllers/         # Request handlers
├── dtos/                # Data Transfer Objects (Zod schemas)
├── interfaces/          # Interface definitions untuk DI
├── middlewares/         # Express middlewares
├── models/              # TypeORM entities
├── repositories/        # Data access layer
├── routes/              # Route definitions
├── services/            # Business logic layer
├── utils/               # Helper functions (logger, error)
└── app.ts               # Express app setup
```

---

## 🔄 Alur Data Lengkap (Create Post)

Mari kita telusuri bagaimana request "Create Post" mengalir melalui sistem:

### 1. **HTTP Request Masuk**

```bash
POST /api/posts
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content...",
  "excerpt": "Short summary",
  "status": "draft"
}
```

### 2. **Middleware Layer** (`src/middlewares/`)

#### a. **Security Middleware** (`app.ts`)
- **Helmet**: Menambah HTTP security headers
- **CORS**: Mengatur cross-origin resource sharing
- **Rate Limiter**: Membatasi request per IP

#### b. **Body Parser** (`app.ts`)
```typescript
app.use(express.json());
```
Mengubah JSON body menjadi JavaScript object.

#### c. **Validation Middleware** (`validateRequest.ts`)
```typescript
validateRequest(createPostSchema)
```

**Apa yang terjadi:**
- Membaca Zod schema dari `src/dtos/post.dto.ts`
- Validasi request body terhadap schema
- Jika valid → lanjut ke controller
- Jika invalid → return 400 dengan error detail

**Schema dari `src/dtos/post.dto.ts`:**
```typescript
export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    featuredImage: z.string().url().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});
```

### 3. **Controller Layer** (`src/controllers/PostController.ts`)

```typescript
createPost = async (req, res, next) => {
  const postData: CreatePostDto = req.body;
  const post = await this.postService.createPost(postData);
  
  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: post,
  });
}
```

**Tanggung Jawab Controller:**
- ✅ Menerima data yang sudah tervalidasi
- ✅ Memanggil service layer
- ✅ Mengembalikan HTTP response
- ❌ TIDAK boleh mengandung business logic
- ❌ TIDAK boleh langsung akses database

### 4. **Service Layer** (`src/services/PostService.ts`)

```typescript
async createPost(data: CreatePostDto): Promise<Post> {
  const postData = {
    ...data,
    status: data.status || PostStatus.DRAFT,
  };
  
  const post = await this.postRepository.create(postData);
  return post;
}
```

**Tanggung Jawab Service:**
- ✅ Business logic (setting default status)
- ✅ Memanggil repository
- ✅ Error handling
- ❌ TIDAK tahu tentang HTTP request/response

### 5. **Repository Layer** (`src/repositories/BaseRepository.ts`)

```typescript
async create(data: DeepPartial<T>): Promise<T> {
  const entity = this.repository.create(data);
  const savedEntity = await this.repository.save(entity);
  return savedEntity;
}
```

**Tanggung Jawab Repository:**
- ✅ Database operations (CRUD)
- ✅ TypeORM queries
- ✅ Mengembalikan entity/data
- ❌ TIDAK mengandung business logic

### 6. **TypeORM & Database**

TypeORM mengubah entity menjadi SQL query:

```sql
INSERT INTO posts (id, title, content, excerpt, status, viewCount, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

Data disimpan ke PostgreSQL.

### 7. **Response Kembali ke Client**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "My First Post",
    "content": "This is the content...",
    "excerpt": "Short summary",
    "status": "draft",
    "viewCount": 0,
    "createdAt": "2025-02-08T10:30:00.000Z",
    "updatedAt": "2025-02-08T10:30:00.000Z"
  }
}
```

---

## 📁 Peran Folder Penting

### `src/dtos/` - Data Transfer Objects

**Apa itu DTO?**
DTO adalah schema yang mendefinisikan bentuk data yang valid untuk input/output.

**Kenapa penting?**
1. **Validasi Input**: Mencegah data invalid masuk ke sistem
2. **Documentation**: Schema berfungsi sebagai dokumentasi API
3. **Type Safety**: TypeScript types di-generate dari Zod schemas
4. **Single Source of Truth**: Aturan validasi dalam satu tempat

**Contoh penggunaan:**

```typescript
// Schema di dtos/post.dto.ts
export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
  }),
});

// Middleware validasi
router.post('/', validateRequest(createPostSchema), controller.createPost);

// TypeScript type (auto-generated)
export type CreatePostDto = z.infer<typeof createPostSchema>['body'];
```

**Keuntungan:**
- 🛡️ Keamanan: Data tervalidasi sebelum masuk ke service
- 📝 Dokumentasi: Schema = dokumentasi API
- 🔧 Maintainability: Ubah aturan validasi di satu tempat
- 🐛 Debugging: Error jelas dan spesifik

### `src/interfaces/` - Interface Definitions

**Apa itu Interface?**
Interface adalah kontrak yang mendefinisikan method dan properties yang harus dimiliki oleh class.

**Kenapa penting?**
1. **Dependency Injection**: Loose coupling antar layer
2. **Testing**: Mudah membuat mock untuk unit test
3. **Maintainability**: Ganti implementasi tanpa ubah dependent code
4. **Type Safety**: Compile-time checking

**Contoh Interface:**

```typescript
// src/interfaces/IPostService.ts
export interface IPostService {
  createPost(data: CreatePostDto): Promise<Post>;
  getPostById(id: string): Promise<Post | null>;
  getAllPosts(skip?: number, take?: number): Promise<Post[]>;
  // ... method lain
}
```

**Implementasi di Service:**

```typescript
// src/services/PostService.ts
export class PostService implements IPostService {
  // Implement semua method dari interface
  async createPost(data: CreatePostDto): Promise<Post> {
    // implementation
  }
}
```

**Keuntungan:**
- 🔄 Fleksibilitas: Ganti implementasi tanpa ubah controller
- 🧪 Testability: Mock service untuk unit test controller
- 📋 Contract: Jelas apa yang disediakan oleh service
- 🔒 Encapsulation: Detail implementasi tersembunyi

---

## 🎯 Prinsip-Prinsip Desain

### 1. **Separation of Concerns**
Setiap layer memiliki satu tanggung jawab spesifik.

### 2. **Dependency Inversion**
- Controller bergantung pada interface `IPostService`, bukan `PostService` langsung
- Service bergantung pada interface `IRepository`, bukan implementasi konkret

### 3. **Single Responsibility Principle**
- Controller: Handle HTTP saja
- Service: Business logic saja
- Repository: Database operation saja

### 4. **DRY (Don't Repeat Yourself)**
- BaseRepository berisi common CRUD operations
- PostRepository extends BaseRepository

---

## 🛡️ Security Features

### 1. **Helmet**
HTTP security headers untuk protection:
- XSS Protection
- Content Security Policy
- Strict Transport Security

### 2. **Rate Limiting**
Mencegah DDoS dan brute force:
- 100 request per 15 menit per IP
- Configurable per endpoint

### 3. **Input Validation**
Zod validation untuk semua input:
- Type checking
- Length constraints
- Format validation (URL, email, etc.)
- Custom validation rules

### 4. **Soft Delete**
Data tidak dihapus permanen:
- Menggunakan `@DeleteDateColumn`
- Bisa di-recovery
- Audit trail

---

## 📊 Pagination

**Implementation:**

```typescript
// Middleware extracts skip/take from query
req.pagination = { skip: 0, take: 10 };

// Service uses pagination
async getAllPosts(skip: number, take: number) {
  return this.repository.findAll(undefined, skip, take);
}

// Repository applies to TypeORM
await this.repository.find({
  skip,
  take,
  order: { createdAt: 'DESC' },
});
```

**Usage:**
```
GET /api/posts?skip=0&take=10
```

---

## 🧪 Testing Strategy

### Unit Tests
- Test individual functions/classes
- Mock dependencies
- Fast execution

### Integration Tests
- Test full flow
- Real database (test DB)
- API endpoint testing

**Contoh Integration Test:**
```typescript
it('should create a new post', async () => {
  const response = await request(app)
    .post('/api/posts')
    .send({ title: 'Test', content: 'Content' })
    .expect(201);
  
  expect(response.body.data).toHaveProperty('id');
});
```

---

## 🐳 Docker Deployment

### Dockerfile
- Multi-stage build
- Production-optimized
- Health check

### Docker Compose
- PostgreSQL database
- Application container
- Volume persistence
- Health checks

**Usage:**
```bash
docker-compose up -d
```

---

## 📝 Best Practices yang Diterapkan

1. ✅ **Strict TypeScript**: Catch error di compile-time
2. ✅ **Environment Validation**: Zod untuk env variables
3. ✅ **Centralized Error Handling**: Error handler middleware
4. ✅ **Structured Logging**: Winston dengan format JSON
5. ✅ **Graceful Shutdown**: Cleanup connections saat shutdown
6. ✅ **Health Check Endpoint**: Untuk monitoring
7. ✅ **API Versioning Ready**: Structure siap untuk versioning
8. ✅ **Documentation**: Kode dengan comments yang jelas

---

## 🔮 Langkah Selanjutnya

Untuk mengembangkan lebih lanjut:

1. **Authentication**: JWT token
2. **Authorization**: Role-based access control
3. **File Upload**: Untuk featured images
4. **Search**: Full-text search dengan PostgreSQL
5. **Caching**: Redis untuk performance
6. **API Documentation**: Swagger/OpenAPI
7. **CI/CD**: GitHub Actions workflow
8. **Monitoring**: Prometheus + Grafana

---

## 📚 Referensi

- [Express.js](https://expressjs.com/)
- [TypeORM](https://typeorm.io/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [Docker](https://docs.docker.com/)

---

## ✨ Kesimpulan

Arsitektur ini memberikan foundation yang solid untuk aplikasi production-grade dengan:
- **Scalability**: Mudah menambah feature baru
- **Maintainability**: Kode terorganisir dan mudah dibaca
- **Testability**: Setiap layer bisa di-test independently
- **Security**: Multiple layers of security
- **Performance**: Efficient database queries dan caching ready

Selamat belajar dan mengembangkan! 🚀
