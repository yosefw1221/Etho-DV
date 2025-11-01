# OAuth Setup Guide for Etho-DV

This guide will help you configure Google and Telegram OAuth authentication for your Etho-DV application.

## Prerequisites

- A Google Cloud account
- A Telegram account
- Access to BotFather on Telegram

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Etho-DV")
5. Click "Create"

### Step 2: Enable Google+ API

1. In your project dashboard, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Etho-DV
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Under "Authorized domains", add your domain (skip for localhost testing)
6. Click "Save and Continue"
7. On the "Scopes" page, click "Add or Remove Scopes"
8. Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
9. Click "Save and Continue"
10. Add test users if needed (for development)
11. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Select "Web application"
4. Enter a name (e.g., "Etho-DV Web Client")
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

### Step 5: Update Environment Variables

Add to your `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Telegram OAuth Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat and send `/newbot`
3. Follow the instructions:
   - Choose a **name** for your bot (e.g., "Etho-DV Login")
   - Choose a **username** for your bot (must end in "bot", e.g., "etho_dv_login_bot")
4. BotFather will send you:
   - **Bot Token**: A long string like `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`
   - **Bot Username**: The username you chose (e.g., `etho_dv_login_bot`)
5. **IMPORTANT**: Save both the token and username

### Step 2: Configure Bot Settings

1. In BotFather, send `/setdomain`
2. Select your bot
3. Enter your domain:
   - For development: `localhost`
   - For production: `yourdomain.com`

### Step 3: Update Environment Variables

Add to your `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=etho_dv_login_bot
```

**Note**: The `NEXT_PUBLIC_` prefix is required because the bot username is used in the client-side Telegram widget.

---

## Testing OAuth Authentication

### Google OAuth Test

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/en/login`
3. Click "Continue with Google"
4. You should be redirected to Google's login page
5. Select your Google account
6. Grant permissions
7. You should be redirected back to `/en/dashboard`

**Common Issues:**
- **Error: redirect_uri_mismatch** - Check that the redirect URI in Google Cloud Console exactly matches `http://localhost:3000/api/auth/callback/google`
- **Error: AccessDenied** - Verify OAuth consent screen is configured correctly and your email is added as a test user (if in testing mode)

### Telegram OAuth Test

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/en/login`
3. You should see the Telegram login widget button
4. Click the Telegram login widget
5. If you're not logged into Telegram Web, you'll be prompted to log in
6. Authorize the bot
7. You should be redirected back to `/en/dashboard`

**Common Issues:**
- **Widget not appearing** - Check browser console for errors. Verify `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is set correctly
- **Authentication failed** - Check that `TELEGRAM_BOT_TOKEN` is correct and the bot domain is set properly
- **Auth data expired** - The Telegram auth data is valid for 24 hours. Try logging in again

---

## Production Deployment

### Update Environment Variables

When deploying to production, update your `.env` or hosting platform environment variables:

```bash
# Update these to production values
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-a-strong-random-secret-at-least-32-chars

# Google OAuth - add production redirect URI
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret

# Telegram OAuth - update domain in BotFather
TELEGRAM_BOT_TOKEN=your-bot-token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your-bot-username
```

### Update OAuth Providers

1. **Google Cloud Console**: Add production redirect URI `https://yourdomain.com/api/auth/callback/google`
2. **Telegram BotFather**: Run `/setdomain` and update to your production domain

---

## Security Considerations

1. **Never commit** `.env.local` to version control
2. **Use strong secrets** for `NEXTAUTH_SECRET` (at least 32 characters)
3. **Enable HTTPS** in production (required for OAuth)
4. **Rotate secrets** regularly
5. **Monitor OAuth usage** in respective dashboards

---

## Troubleshooting

### Check Environment Variables

```bash
# Verify variables are loaded
npm run dev

# Check logs for any OAuth-related errors
```

### Google OAuth Errors

- `redirect_uri_mismatch`: Update authorized redirect URIs in Google Cloud Console
- `access_denied`: User denied permission or OAuth consent screen not configured
- `invalid_client`: Client ID or secret is incorrect

### Telegram OAuth Errors

- `Telegram auth verification failed`: Bot token is incorrect or auth data has been tampered with
- `Auth data expired`: User took too long to authenticate (>24 hours)
- `Widget not loading`: Bot username is incorrect or bot doesn't exist

---

## Need Help?

- Google OAuth: [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Telegram Login: [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- NextAuth.js: [NextAuth.js Documentation](https://next-auth.js.org/)
