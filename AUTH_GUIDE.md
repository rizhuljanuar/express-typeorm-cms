# Authentication & Authorization Guide

## 🔐 Authentication & Authorization System

This Headless CMS API now includes a complete JWT-based authentication and role-based authorization system.

### Features Implemented

✅ **JWT Authentication** - Secure token-based authentication
✅ **Password Hashing** - Bcrypt with salt rounds
✅ **Role-Based Access Control** - 4 roles: Admin, Editor, Author, Subscriber
✅ **Protected Routes** - Middleware for authentication & authorization
✅ **User Management** - Register, login, profile management
✅ **Author Ownership** - Posts linked to authors with ownership checks
✅ **Integration Tests** - Complete auth test coverage

---

## 📋 User Roles

### 1. **ADMIN**
- Full system access
- Manage all users
- Update user roles
- Create, edit, delete any post
- View all users

### 2. **EDITOR**
- Create, edit, delete any post
- View all users (read-only)

### 3. **AUTHOR**
- Create own posts
- Edit own posts
- View own profile

### 4. **SUBSCRIBER**
- Read published posts
- View own profile
- No post creation/editing

---

## 🚀 API Endpoints

### Authentication Endpoints

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "author"  // optional, defaults to "subscriber"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer {token}
```

### User Management Endpoints

#### Get All Users (Admin/Editor only)
```bash
GET /api/users?skip=0&take=10
Authorization: Bearer {token}
```

#### Get User by ID
```bash
GET /api/users/{id}
Authorization: Bearer {token}
```

#### Update User Role (Admin only)
```bash
PATCH /api/users/{id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "editor"
}
```

#### Deactivate User (Admin only)
```bash
DELETE /api/users/{id}
Authorization: Bearer {token}
```

### Post Endpoints (Updated)

#### Create Post (Authenticated)
```bash
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Post",
  "content": "Post content",
  "status": "draft"
}
```

**Note:** `authorId` is automatically set from authenticated user.

#### Update Post
```bash
PATCH /api/posts/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

**Note:** Users can only edit their own posts (unless Admin/Editor).

#### Delete Post
```bash
DELETE /api/posts/{id}
Authorization: Bearer {token}
```

**Note:** Only Admin and Editor can delete posts.

---

## 🔒 Middleware Usage

### Authentication Middleware
```typescript
import { authenticate } from '../middlewares/auth';

router.get('/profile', authenticate, controller.getProfile);
```

### Authorization Middleware
```typescript
import { authorize, UserRole } from '../middlewares/auth';

// Only Admin and Editor
router.post('/', authorize(UserRole.ADMIN, UserRole.EDITOR), controller.create);

// Only Admin
router.delete('/', authorize(UserRole.ADMIN), controller.delete);
```

### Ownership Check Middleware
```typescript
import { checkOwnership } from '../middlewares/auth';

// Allow admin or owner
router.patch('/:id', checkOwnership('id'), controller.update);
```

---

## 📝 Usage Examples

### 1. Register as Author
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "SecurePass123",
    "firstName": "Jane",
    "lastName": "Author",
    "role": "author"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "author@example.com",
      "firstName": "Jane",
      "lastName": "Author",
      "role": "author"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Create Post with Auth Token
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content",
    "status": "draft"
  }'
```

### 4. Update Own Post
```bash
curl -X PATCH http://localhost:3000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

### 5. Admin Updates User Role
```bash
curl -X PATCH http://localhost:3000/api/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "editor"
  }'
```

---

## 🛡️ Security Features

1. **Password Hashing** - Bcrypt with 10 salt rounds
2. **JWT Tokens** - 7-day expiration
3. **Token Verification** - Middleware validates tokens on protected routes
4. **Role-Based Authorization** - Access control based on user roles
5. **Ownership Checks** - Users can only modify their own resources
6. **Password Requirements** - Minimum 8 chars, uppercase, lowercase, number
7. **Email Validation** - Proper email format validation
8. **No Password in Response** - Password excluded from JSON responses

---

## 🧪 Testing

Run authentication tests:

```bash
npm test
```

Test coverage includes:
- User registration
- Login with valid/invalid credentials
- Token verification
- Role-based authorization
- Protected route access
- Ownership checks

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'subscriber',
  isActive BOOLEAN DEFAULT true,
  lastLoginAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);
```

### Posts Table (Updated)
```sql
ALTER TABLE posts ADD COLUMN authorId UUID REFERENCES users(id);
```

---

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

**⚠️ Important:** Change `JWT_SECRET` in production!

---

## 📚 Code Examples

### Creating Admin User
```typescript
const adminData = {
  email: 'admin@example.com',
  password: 'AdminPass123',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN
};

const result = await userService.register(adminData);
```

### Protecting Custom Routes
```typescript
import { authenticate, authorize, UserRole } from '../middlewares/auth';

// Authenticated users only
router.get('/dashboard', authenticate, dashboardController.index);

// Specific roles only
router.post('/admin', authenticate, authorize(UserRole.ADMIN), adminController.create);

// Multiple roles
router.post('/content', authenticate, authorize(UserRole.ADMIN, UserRole.EDITOR), contentController.create);
```

### Getting Current User in Controller
```typescript
createPost = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;  // Authenticated user ID
  const userRole = req.user!.role;  // User role

  // Your logic here
};
```

---

## ✅ Best Practices

1. **Always use HTTPS** in production for token transmission
2. **Change JWT_SECRET** before deploying to production
3. **Use strong passwords** (enforced by validation)
4. **Implement rate limiting** on auth endpoints
5. **Log authentication attempts** for security monitoring
6. **Use short token expiration** for sensitive operations
7. **Implement refresh tokens** for better user experience (future enhancement)
8. **Never log passwords** or expose them in errors

---

## 🚨 Common Issues

### Token Expired
**Error:** "Token has expired"
**Solution:** User must login again to get new token

### Invalid Token
**Error:** "Invalid token"
**Solution:** Check token format and JWT_SECRET matches

### Access Denied
**Error:** "Access denied. Required role: admin"
**Solution:** User doesn't have required role

### Not Authenticated
**Error:** "User not authenticated"
**Solution:** Add `Authorization: Bearer {token}` header

---

## 🎯 Next Steps

1. **Refresh Tokens** - Implement token refresh mechanism
2. **Email Verification** - Verify email on registration
3. **Password Reset** - Forgot password flow
4. **Two-Factor Auth** - Add 2FA for enhanced security
5. **Session Management** - Logout and token blacklisting
6. **OAuth Integration** - Google, GitHub, etc.
7. **Audit Logs** - Track all authentication events

---

**Happy Coding! 🚀**
