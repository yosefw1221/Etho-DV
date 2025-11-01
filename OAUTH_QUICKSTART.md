# OAuth Quick Start Guide

## What Was Fixed

### Google OAuth
- ✅ Added proper authorization scopes (`openid email profile`)
- ✅ Added `prompt: consent` to force consent screen
- ✅ Added better error handling and display
- ✅ Enabled debug mode in development
- ✅ Added redirect callback for proper URL handling

### Telegram OAuth
- ✅ Replaced incorrect OAuth2 implementation with official Telegram Login Widget
- ✅ Implemented cryptographic hash verification for security
- ✅ Created TelegramLoginButton component with native widget
- ✅ Added proper credential handling through NextAuth

## Required Setup Steps

### 1. Google OAuth Configuration

**Get credentials from Google Cloud Console:**

1. Go to https://console.cloud.google.com/
2. Create a project (or select existing)
3. Enable Google+ API
4. Go to "OAuth consent screen" → Configure
5. Go to "Credentials" → Create OAuth 2.0 Client ID
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Secret

**Update `.env.local`:**
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
```

### 2. Telegram OAuth Configuration

**Create a Telegram Bot:**

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to name your bot (e.g., "Etho DV Login Bot")
4. Choose username ending in "bot" (e.g., `etho_dv_login_bot`)
5. Copy the **bot token** and **username**
6. Send `/setdomain` to BotFather, select your bot, and enter `localhost` (for dev)

**Update `.env.local`:**
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=etho_dv_login_bot
```

### 3. Update NextAuth Secret

Generate a secure random secret (at least 32 characters):

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use this in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Update `.env.local`:**
```bash
NEXTAUTH_SECRET=your-generated-secret-here
```

### 4. Restart Development Server

```bash
npm run dev
```

## Testing

1. Navigate to `http://localhost:3000/en/login`
2. Click "Continue with Google" - should show Google consent screen
3. Click Telegram widget - should show Telegram authorization
4. Any errors will now be displayed clearly on the login page

## Common Issues

### Google: "AccessDenied" Error

**Possible causes:**
- OAuth consent screen not published (if in production mode)
- Your email not added as test user (if in testing mode)
- Missing scopes in Google Cloud Console
- Redirect URI mismatch

**Solutions:**
1. In Google Cloud Console → OAuth consent screen:
   - If "Testing": Add your email under "Test users"
   - If "Production": Submit for verification (takes time)
2. Verify redirect URI exactly matches: `http://localhost:3000/api/auth/callback/google`
3. Try using an Incognito window to clear cached permissions

### Google: "redirect_uri_mismatch"

- The redirect URI in Google Cloud Console doesn't match
- Must be exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes, must match protocol (http vs https)

### Telegram: Widget Not Showing

**Causes:**
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` not set or incorrect
- Bot username doesn't exist
- JavaScript disabled

**Solutions:**
1. Verify bot exists: Open Telegram and search for `@your_bot_username`
2. Check browser console for errors
3. Ensure variable name has `NEXT_PUBLIC_` prefix

### Telegram: "Auth verification failed"

**Causes:**
- Incorrect `TELEGRAM_BOT_TOKEN`
- Auth data expired (older than 24 hours)
- Auth data tampered with

**Solutions:**
1. Verify bot token from BotFather
2. Try logging in again (don't wait too long)
3. Check server logs for verification details

## How It Works

### Google OAuth Flow
1. User clicks "Continue with Google"
2. NextAuth redirects to Google consent screen
3. User grants permissions
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth verifies the code and creates session
6. User is redirected to dashboard

### Telegram Login Flow
1. Telegram widget loads as iframe in login page
2. User clicks widget and authorizes in Telegram
3. Telegram calls `onTelegramAuth()` callback with user data
4. Data is cryptographically verified using bot token
5. User data is sent to NextAuth credentials provider
6. NextAuth creates session and redirects to dashboard

## Security Notes

- ✅ Telegram auth data is cryptographically verified using HMAC-SHA256
- ✅ Auth data expires after 24 hours
- ✅ Google OAuth uses secure authorization code flow
- ✅ All secrets stored in environment variables (never committed)
- ✅ HTTPS required for production

## Need More Help?

See the full setup guide: [OAUTH_SETUP.md](./OAUTH_SETUP.md)

For detailed Telegram widget documentation: https://core.telegram.org/widgets/login
For Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
