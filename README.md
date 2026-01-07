# DevRim

## 1. Introduction

DevRim is a modern social platform that combines the storytelling depth of Medium with the community engagement of Reddit. It provides a comprehensive ecosystem for developers, writers, and tech enthusiasts to create long-form content, join topic-based communities, connect with like-minded individuals, and build meaningful professional networks.

### Key Features

- **Long-form Blogging**: Create and publish rich, formatted blog posts with support for code blocks, images, headings, and multimedia content
- **Community Engagement**: Join or create communities around specific topics, share posts within communities, and engage in targeted discussions
- **Social Networking**: Follow authors, connect with peers, send connection requests, and build your professional network
- **Real-time Messaging**: Direct messaging with authors and group chat functionality for community discussions
- **Content Management**: Save posts to custom collections, like posts, comment and reply to build discussions
- **User Profiles**: Customizable profiles with bylines, about sections, and profile pictures
- **Search & Discovery**: Search and filter posts by topics, frameworks, and communities

The platform is designed to foster knowledge sharing, collaboration, and community building within the tech and developer ecosystem.

---

## 2. Tools Used

### Backend Technologies

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.21.2
- **Database**: 
  - MongoDB 8.16.1 (via Mongoose) - Primary data storage
  - Redis 5.8.3 - Caching and real-time user status tracking
- **Authentication**: 
  - Better Auth 1.3.34 - Modern authentication framework
  - Google OAuth 2.0 - Social authentication
  - JWT (jsonwebtoken 9.0.2) - Token-based authentication
  - bcrypt 6.0.0 - Password hashing
- **Real-time Communication**: Socket.io 4.8.1 - WebSocket server for live messaging and notifications
- **File Storage**: AWS S3 (via @aws-sdk/client-s3 3.879.0) - Cloud storage for images, audio, and files
- **Email Service**: MailerSend 2.6.0 - Transactional emails (verification, password reset)
- **Security**: 
  - Arcjet 1.0.0-beta.14 - Bot detection, rate limiting, and security protection
  - CORS - Cross-origin resource sharing
- **Task Scheduling**: node-cron 4.2.1 - Scheduled jobs for analytics aggregation
- **Utilities**: 
  - dotenv 16.6.1 - Environment variable management
  - cookie-parser - HTTP cookie parsing
  - morgan - HTTP request logger

### Frontend Technologies

- **Framework**: React 19.2.1 with React Router 7.8.2
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 6.3.3
- **Styling**: 
  - Tailwind CSS 4.1.11 - Utility-first CSS framework
  - SCSS/Sass - Additional styling capabilities
- **Rich Text Editor**: TipTap 3.0.7 - Extensible rich text editor with custom extensions
- **Real-time Communication**: Socket.io-client 4.8.1 - WebSocket client
- **Animation**: 
  - GSAP 3.13.0 - Advanced animations and scroll triggers
  - Lenis 1.3.11 - Smooth scrolling
- **UI Components**: 
  - Radix UI - Accessible component primitives
  - Lucide React - Icon library
- **Media Handling**: 
  - react-easy-crop 5.5.6 - Image cropping
  - mic-recorder-to-mp3 2.2.2 - Audio recording
- **State Management**: React Context API (custom userContext)
- **HTTP Client**: Native Fetch API
- **3D Graphics**: OGL 1.0.11 - WebGL library

### Development Tools

- **Package Manager**: npm
- **Development Server**: Nodemon 3.1.10 (backend), React Router Dev Server (frontend)
- **Type Checking**: TypeScript compiler
- **Code Quality**: ESLint (implicit)

---

## 3. Design / Architecture

### System Architecture

DevRim follows a **client-server architecture** with a clear separation between frontend and backend:

```
┌─────────────────┐          ┌─────────────────┐         ┌─────────────────┐
│   React Client  │ ◄─────►  │  Express API    │ ◄─────► │    MongoDB      │
│   (Frontend)    │  HTTP    │   (Backend)     │         │   (Database)    │
└─────────────────┘          └─────────────────┘         └─────────────────┘
       │                             │                            │
       │                             │                            │
       │                    ┌────────┴────────┐                   │
       │                    │                 │                   │
       └──────────────────► │   Socket.io     │                   │
            WebSocket       │  (Real-time)    │                   │
                            └─────────────────┘                   │
                                   │                              │
                            ┌──────┴──────┐                       │
                            │             │                       │
                            ▼             ▼                       ▼
                       ┌─────────┐  ┌─────────┐            ┌─────────────┐
                       │  Redis  │  │  AWS S3 │            │  MailerSend │
                       │ (Cache) │  │(Storage)│            │   (Email)   │
                       └─────────┘  └─────────┘            └─────────────┘
```

### Backend Architecture

The backend is organized using a **MVC (Model-View-Controller) pattern**:

```
backend/
├── app.js                 # Main Express application setup
├── bin/www                # Server entry point with Socket.io
├── authentication.js      # Better Auth configuration
├── models/                # Mongoose schemas (User, Post, Comment, Chat, etc.)
├── controllers/           # Business logic handlers
├── routes/                # API route definitions
├── functions/             # Utility functions (auth middleware)
├── config/                # Configuration files (Redis)
├── jobs/                  # Scheduled tasks (cron jobs)
└── sendEmail.js           # Email service integration
```

**Key Architectural Patterns:**
- **RESTful API Design**: Standard HTTP methods (GET, POST, PUT, DELETE) for resource operations
- **Middleware Pattern**: Authentication, CORS, error handling, logging
- **Repository Pattern**: Mongoose models abstract database operations
- **Event-Driven**: Socket.io for real-time features

### Frontend Architecture

The frontend uses **React Router** with a file-based routing system:

```
frontend/
├── app/
│   ├── root.tsx           # Root layout with providers
│   ├── routes.ts          # Route configuration
│   ├── routes/            # Page components
│   ├── layouts/           # Layout components (base, blog)
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context providers
│   ├── apiCalls/          # API integration functions
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
```

**Key Architectural Patterns:**
- **Component-Based**: Modular, reusable React components
- **Context API**: Global state management for user data
- **Custom Hooks**: Reusable logic (useUser, useSession)
- **API Abstraction**: Centralized API call functions

### Database Schema

**Core Models:**

1. **User Model**
   - Authentication fields (googleId, email, emailVerified)
   - Profile data (name, picture, byline, about)
   - Social graph (following, followers, connections, requestsSent, requestsReceived)
   - Content relationships (liked posts, lists, communities)
   - Status tracking (online/offline, lastSeen)

2. **Post Model**
   - Content (title, summary, content object, coverImage)
   - Metadata (releaseDate, categories)
   - Relationships (user, comments, likes)
   - Community association (via community.posts)

3. **Community Model**
   - Basic info (title, description, picture, topics)
   - Governance (creator, moderators, rules, announcements)
   - Membership (members array)
   - Content (posts array)

4. **Chat Model**
   - Type (isGroupChat boolean)
   - Participants (users array)
   - Metadata (chatName, groupAdmin, latestMessage, pinned messages)
   - Timestamps (createdAt, updatedAt)

5. **Message Model**
   - Content (text, audio, images, files)
   - Relationships (sender, chat)
   - Metadata (pinned status)

6. **Comment Model**
   - Content (text)
   - Relationships (post, user, replies)
   - Timestamps

7. **List Model**
   - User collections for saved posts
   - Custom lists with names and descriptions

### API Design

**RESTful Endpoints:**
- `/posts` - Blog post CRUD operations
- `/users` - User profile and social operations
- `/chats` - Chat management
- `/messages` - Message operations
- `/comments` - Comment operations
- `/communities` - Community management
- `/lists` - User collections
- `/analytics` - User analytics
- `/status` - User status updates
- `/s3/*` - File upload presigned URLs

**Authentication Endpoints:**
- `/auth/google` - Google OAuth login
- `/api/auth/*` - Better Auth endpoints (signup, login, password reset)
- `/me` - Get current user data
- `/logout` - Sign out

**Real-time Events (Socket.io):**
- `setup` - User connection setup
- `join chat` - Join chat room
- `new message` - Send message
- `message received` - Receive message
- `typing` / `stop typing` - Typing indicators
- `userStatusUpdate` - Online/offline status

### Security Architecture

- **Authentication**: Multi-provider (Google OAuth + Email/Password via Better Auth)
- **Authorization**: JWT tokens stored in HTTP-only cookies
- **Rate Limiting**: Arcjet token bucket algorithm (100 requests per 60 seconds)
- **Bot Protection**: Arcjet bot detection with allowlist for search engines
- **CORS**: Whitelist-based origin validation
- **Input Validation**: Mongoose schema validation
- **File Upload Security**: Presigned S3 URLs with expiration (5 minutes)

---

## 4. Implementation

### Authentication Flow

1. **Google OAuth Flow:**
   - User clicks "Login with Google" on frontend
   - Frontend uses `@react-oauth/google` to get authorization code
   - Code sent to `/auth/google` endpoint
   - Backend verifies token with Google, creates/updates user
   - JWT token generated and set as HTTP-only cookie
   - User data fetched via `/me` endpoint

2. **Email/Password Flow:**
   - Better Auth handles signup/login
   - Email verification required on signup
   - Password reset via email link
   - Session managed by Better Auth

### Real-time Messaging Implementation

**Socket.io Setup:**
- Server initializes Socket.io on HTTP server
- Clients connect with credentials
- User joins personal room (userId) for direct messages
- Users join chat rooms for group conversations

**Message Flow:**
1. User sends message via POST `/messages`
2. Message saved to database
3. Socket.io emits `new message` event
4. All chat participants receive `message received` event
5. Frontend updates UI in real-time

**User Status Tracking:**
- Redis stores online users (userId → timestamp)
- On connect: User added to Redis, status broadcast
- On disconnect: User removed from Redis, status updated
- Frontend displays online/offline indicators

### Blog Post Creation

1. **Editor Setup:**
   - TipTap editor initialized with custom extensions
   - Extensions: code blocks, images, lists, text alignment, highlighting
   - Custom image upload node for S3 integration

2. **Content Creation:**
   - User writes in natural editor interface
   - Content stored as JSON object (TipTap document format)
   - Cover image uploaded via presigned S3 URL
   - Post saved with title, summary, content, categories

3. **Publishing:**
   - User selects community (optional)
   - Post associated with community
   - Post appears in community feed and user's dashboard

### File Upload System

**S3 Presigned URL Pattern:**
1. Frontend requests presigned URL from backend
2. Backend generates presigned PUT URL (5-minute expiration)
3. Frontend uploads file directly to S3
4. Backend returns public file URL
5. URL stored in database

**Upload Types:**
- Profile pictures: `/s3/profile-picture-upload`
- Post cover images: `/s3/post-cover-upload`
- TipTap images: `/s3/tiptap-image-upload`
- Community images: `/s3/community-image-upload`
- General files: `/s3/presign-upload`

### Community System

**Community Creation:**
- User creates community with title, description, rules
- Creator becomes first moderator
- Community image uploaded to S3
- Topics/categories assigned

**Community Features:**
- Members can join/leave communities
- Moderators can manage rules and announcements
- Posts can be shared within communities
- Community-specific feeds and search

### Social Networking Features

**Connection System:**
- Users send connection requests
- Requests stored in `requestsSent` and `requestsReceived`
- Recipient can accept or decline
- Accepted connections stored in `connections` array

**Follow System:**
- Users can follow other users
- Followers/following arrays maintained
- Followed users' posts appear in feed

**Lists/Collections:**
- Users create custom lists
- Posts saved to lists
- Lists can be organized by topic or purpose

### Scheduled Jobs

**Analytics Aggregation:**
- Cron job runs periodically (via `cronWorker.js`)
- Aggregates user statistics
- Updates trending posts
- Maintains community metrics

### Frontend State Management

**User Context:**
- `UserProvider` wraps application
- `useUser` hook provides user data
- `useSession` hook manages Better Auth session
- User data fetched on app load and after authentication

**Component Structure:**
- Layout components (`base.tsx`, `blog.tsx`) provide consistent UI
- Route components handle page-specific logic
- Reusable components in `components/` directory
- API calls abstracted in `apiCalls/` directory

### Performance Optimizations

- **Image Optimization**: S3 CDN for fast image delivery
- **Caching**: Redis for user status and frequently accessed data
- **Code Splitting**: React Router handles route-based code splitting
- **Lazy Loading**: Dynamic imports for GSAP and heavy libraries
- **Presigned URLs**: Direct S3 uploads reduce server load

### Error Handling

- **Backend**: Express error middleware catches and formats errors
- **Frontend**: React Router ErrorBoundary handles route errors
- **API**: Consistent error response format
- **Validation**: Mongoose schema validation for data integrity

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Redis server
- AWS S3 bucket (for file storage)
- Google OAuth credentials
- MailerSend account (for emails)
- Arcjet account (for security)

### Environment Variables

**Backend (.env):**
```
MONGO_DB=mongodb://...
REDIS_URL=redis://...
AWS_REGION=...
AWS_ACCESS_KEY=...
AWS_SECRET=...
S3_BUCKET_FILE=...
S3_TIPTAP_BUCKET=...
S3_COMMUNITY_IMAGE_BUCKET=...
CLIENT_ID=... (Google OAuth)
CLIENT_SECRET=... (Google OAuth)
JWT_SECRET=...
ARCJET_KEY=...
MAILERSEND_API_KEY=...
NODE_ENV=production|development
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000 (or production URL)
```

### Installation

1. **Backend:**
```bash
cd backend
npm install
npm run server  # Development with nodemon
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev  # Development server
```

### Production Build

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm start  # Serve production build
```

---

## License

See LICENSE file for details.

