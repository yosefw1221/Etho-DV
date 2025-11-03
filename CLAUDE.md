# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Etho-DV is a multilingual DV (Diversity Visa) lottery application service built with Next.js 15, designed primarily for Ethiopian users. The application supports four locales (English, Amharic, Tigrinya, Oromo) and facilitates the complete DV lottery application process from user registration through form submission.

## Development Commands

```bash
# Development
npm run dev          # Start development server (default: http://localhost:3000)
yarn dev            # Alternative using yarn

# Build & Production
npm run build       # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler checks without emitting files
```

## Architecture Overview

### Application Structure

The app follows Next.js 15 App Router architecture with a locale-based routing system:

- **Routing Pattern**: `app/[locale]/[route]/page.tsx`
  - All user-facing pages are under `app/[locale]/` with locale prefixes (en, am, ti, or)
  - Middleware (`src/middleware.ts`) automatically redirects non-localized paths to English locale
  - API routes are at `app/api/` and are not localized

### Page Structure
User-facing pages under `src/app/[locale]/`:
- `/` - Landing page
- `/login` - User/agent login
- `/register` - User registration
- `/apply` - DV application form (multi-step wizard)
- `/dashboard` - User dashboard (application status, history)
- `/profile` - User profile management
- `/history` - Application history list
- `/history/[id]` - Detailed view of specific application
- `/agent` - Agent dashboard (bulk uploads, statistics)
- `/forgot-password` - Password recovery

### Key Architectural Components

#### Authentication System
- **JWT-based authentication** managed through `src/lib/auth.ts`
  - Token expiry: 7 days
  - Uses `NEXTAUTH_SECRET` environment variable as JWT_SECRET
  - Password hashing with bcrypt (12 salt rounds)
- **OAuth authentication** via NextAuth.js (`src/app/api/auth/[...nextauth]/route.ts`)
  - Supported providers: Google, Telegram
  - Session strategy: JWT with 7-day expiry
  - OAuth accounts are linked to existing local accounts by email
  - User model supports mixed authentication (provider field: 'local' | 'google' | 'telegram')
- **Middleware helpers** at `src/middleware/auth.ts` provide:
  - `authenticateUser()`: Validates JWT tokens and verifies user existence
  - `requireAuth()`: HOF wrapper for protected API routes
  - `requireRole()`: Role-based access control for user/agent routes
- **User roles**: `user` (standard applicant) and `agent` (bulk submission handler)
- **Authentication flow**:
  - Local: Bearer token in Authorization header → Token verification → User database lookup
  - OAuth: NextAuth session → JWT token → User database lookup with provider ID

#### Database Layer
- **MongoDB with Mongoose** - Connection managed via `src/lib/mongodb.ts`
- **Connection caching**: Uses global cache to prevent multiple connections in development
  - Cached in `global.mongoose` to persist across hot reloads
  - Auto-reconnects if connection drops
- **Models** located in `src/lib/models/`:
  - `User.ts`: Standard users and agents (differentiated by role field)
  - `Application.ts`: DV lottery form submissions
  - `Payment.ts`: Payment verification records
  - `Agent.ts`: Agent-specific data and bulk submissions
- **Model exports**: Centralized in `src/lib/models/index.ts` with TypeScript interfaces

#### Multi-Step Form System
The DV application form (`src/components/forms/DVApplicationForm.tsx`) is a complex multi-step wizard with:

1. **Personal Information** (`PersonalInfoStep.tsx`)
2. **Contact Information** (`ContactInfoStep.tsx`)
3. **Background & Education** (`BackgroundInfoStep.tsx`)
   - Includes integrated photo upload with 400x400 crop tool
4. **Family Members** (`FamilyInfoStep.tsx`)
   - Dynamic addition of spouse/children with individual photo uploads
5. **Review & Submit** (`ReviewStep.tsx`)

Form state structure defined in `src/types/form.ts` as `DVFormData` interface.

#### File Upload & Storage
- **Photo requirements**:
  - Format: JPEG only
  - Dimensions: 600x600 to 1200x1200 pixels (square)
  - File size: Maximum 240KB
  - Client-side cropping to 400x400 using `react-image-crop`
- **PhotoUploadWithCrop.tsx**: Main photo upload component with client-side cropping
- **Storage options**:
  - Local filesystem via `src/lib/simpleStorage.ts`
    - Photos stored in `public/uploads/`
    - Accessible via `/uploads/{filename}`
    - Path structure: `photos/{userId}/{formId}/{personType}-{timestamp}-{randomId}.jpg`

#### API Route Structure
```
/api
  /auth              # Authentication endpoints
    /login          # POST: User/agent login
    /register       # POST: New user registration
    /me             # GET: Current user info (protected)
  /agent            # Agent-specific routes (role: agent)
    /bulk-upload    # POST: Bulk DV submissions via CSV
    /stats          # GET: Agent statistics
  /user             # User-specific routes (role: user)
    /submit-form    # POST: Submit DV application
    /photos         # POST: Upload photos
      /status       # GET: Check photo upload status
    /forms          # GET: List user's forms
      /[formId]     # GET/PATCH/DELETE: Form CRUD operations
        /download   # GET: Download form as PDF
        /payment    # POST: Submit payment for form
    /applications   # GET: List user's applications
      /[id]         # GET: Get specific application details
    /profile        # GET/PATCH: User profile management
    /change-password # POST: Change user password
    /stats          # GET: User statistics
  /admin            # Admin routes (role: admin)
    /pending-payments # GET: List pending payment verifications
    /verify-payment   # POST: Verify and approve payment
  /payments         # Payment processing
    /verify         # POST: Verify payment from gateway
  /test-db          # Database connection test endpoint
```

### Component Organization
```
src/components/
  /forms          # Multi-step form components
    - DVApplicationForm.tsx (main form orchestrator)
    - PersonalInfoStep.tsx, ContactInfoStep.tsx, BackgroundInfoStep.tsx
    - FamilyInfoStep.tsx (dynamic family member management)
    - ReviewStep.tsx (final review before submission)
    - PhotoUploadWithCrop.tsx (cropping component)
  /ui             # Reusable UI primitives (Input, Select, Modal, etc.)
  /auth           # Login/registration forms
  /layout         # Navigation, headers, footers
  /payment        # Payment-related components
  /agent          # Agent dashboard components
  /user           # User dashboard components
```

### Middleware Ecosystem
Located in `src/middleware/`:
- `auth.ts`: JWT authentication and role-based authorization helpers
- `errorHandler.ts`: Global error handling utilities
- `logger.ts`: Request/response logging
- `photoValidation.ts`: Server-side photo validation

Root-level `src/middleware.ts` handles locale routing for the entire application.

### Internationalization
- Uses `next-intl` for translations
- Translation files located in `src/locales/{locale}/common.json`
- Supported locales: `['en', 'am', 'ti', 'or']` (English, Amharic, Tigrinya, Oromo)
- Default locale: `'en'`
- Locale routing handled by `src/middleware.ts`:
  - Automatically redirects non-localized paths to `/en/*`
  - All user-facing pages must be under `/[locale]/` directory
  - API routes and internal paths (_next, favicon.ico) are excluded from locale middleware

## Important Development Notes

### Path Aliases
TypeScript configured with `@/*` alias mapping to `src/*`:
```typescript
import { authenticateUser } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { User, Application } from '@/lib/models';
```

**Important**: Always use `@/lib/models` for model imports, not `@/models`. The models are located in `src/lib/models/`.

### Environment Variables
Required variables in `.env.local` (see `.env.example` for template):

**Core Configuration:**
- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/etho-dv`)
- `JWT_SECRET`: Secret for JWT token signing (min 32 characters)
- `NEXTAUTH_URL`: Application URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: NextAuth session secret (min 32 characters)

**OAuth Providers:**
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 client secret
- `TELEGRAM_BOT_ID`: Telegram bot ID for OAuth
- `TELEGRAM_BOT_TOKEN`: Telegram bot token from BotFather

**Payment APIs (Optional):**
- `TELEBIRR_API_KEY`: TeleBirr payment gateway API key
- `CBE_API_KEY`: Commercial Bank of Ethiopia API key
- `ABYSSINIA_API_KEY`: Abyssinia Bank API key

#### OAuth Setup Guide

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen with authorized domains
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env.local`

**Telegram OAuth:**
1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newbot` command and follow instructions
3. Copy the bot token and bot ID
4. Configure bot settings:
   - Set domain: `/setdomain yourdomain.com`
   - Enable login widget (automatic with OAuth flow)
5. Add credentials to `.env.local`

### Image Processing
- **Client-side cropping**: `react-image-crop` library
- **Server-side processing**: `src/lib/imageProcessor.ts` (Sharp-based for Node.js)
- **Client-side processing**: `src/lib/clientImageProcessor.ts` (Canvas API for browser)
- **DV lottery photo requirements**:
  - Upload: 600x600 to 1200x1200 pixels (square, JPEG, max 240KB)
  - Final crop: Exactly 400x400 pixels for submission
- **Validation utilities** in `src/lib/storage.ts`:
  - `validatePhotoFile()`: Checks file type and size
  - `validateImageDimensions()`: Checks pixel dimensions
- **Photo upload middleware**: `src/middleware/photoValidation.ts` for server-side validation

### Form Validation
- Validation utilities in `src/lib/validation.ts`
- Zod schemas used for type-safe validation
- Per-step validation in form components
- Final validation before API submission

### Utility Libraries
Located in `src/lib/`:
- `auth.ts`: JWT and password hashing utilities
- `mongodb.ts`: Database connection with caching
- `simpleStorage.ts`: Local filesystem storage
- `imageProcessor.ts`: Server-side image processing (Sharp)
- `clientImageProcessor.ts`: Browser-based image processing (Canvas)
- `validation.ts`: Zod schemas and validation helpers
- `utils.ts`: General utility functions (including `cn()` for className merging with tailwind-merge)
- `i18n.ts`: Internationalization configuration
- `notifications.ts`: Notification/alert utilities

## Common Development Patterns

### Creating Protected API Routes
```typescript
import { requireAuth } from '@/middleware/auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = requireAuth(async (req) => {
  const userId = req.user?.userId;
  // Handle authenticated request
});
```

### Role-Based Routes
```typescript
import { requireRole } from '@/middleware/auth';

export const POST = requireRole(['agent'])(async (req) => {
  // Agent-only endpoint
});
```

### Database Operations
```typescript
import connectDB from '@/lib/mongodb';
import { User, Application } from '@/lib/models';

// Always call connectDB() before database operations
await connectDB();
const user = await User.findById(userId);
```

**Important**: The models are exported from `src/lib/models/index.ts` which provides:
- `User` (IUser, IUserMethods, UserModel types)
- `Application` (IApplication, IFamilyMember types)
- `Agent` (IAgent type)
- `Payment` (IPayment type)
- `connectDB` (re-exported for convenience)

### Working with Localized Routes
- All page components under `[locale]` receive `params.locale`
- Use `useTranslations()` hook from `next-intl` for client components
- Server components can use `getTranslations()` or import translation files directly

## Testing the Application

1. **Start MongoDB**: Ensure MongoDB is running locally or connection string is valid
2. **Seed Environment**: Copy `.env.local` and fill required values
3. **Run Development Server**: `npm run dev`
4. **Test Flow**:
   - Register user at `/[locale]/register`
   - Login at `/[locale]/login`
   - Navigate to `/[locale]/apply` for DV application form
   - Test photo upload with crop functionality
   - Submit form and verify in database

## Known Technical Details

- Next.js 15 with React 18 using App Router
- Mongoose connection uses global caching to prevent multiple connections
- File uploads handled via FormData API
- Photos stored with unique identifiers to prevent collisions
- Agent dashboard supports bulk CSV uploads for multiple applications (via papaparse library)
- Payment verification is manual (admin approval required)
- Styling: Tailwind CSS with custom configuration

## Known Issues & Considerations

1. **Import Path Inconsistency**: Some files may import models from `@/models/User` instead of the correct `@/lib/models/User`. Always use `@/lib/models/*` for consistency.

2. **JWT Secret Configuration**: The JWT secret falls back to `NEXTAUTH_SECRET` environment variable if `JWT_SECRET` is not set. Ensure `NEXTAUTH_SECRET` is properly configured.

3. **Storage**: The application uses local filesystem storage via `simpleStorage.ts`:
   - Photos stored in `public/uploads/`
   - Accessible via `/uploads/{filename}`

4. **Photo Dimensions**: The application enforces 600x600 to 1200x1200 pixel uploads but crops to 400x400. This is intentional to meet DV lottery requirements while maintaining quality.
