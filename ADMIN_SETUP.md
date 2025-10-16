# Admin User Setup Guide

## Security Overview

The admin creation endpoint is protected with multi-level security:

1. **Initial Setup**: Creating the first super admin requires a secret key
2. **Authenticated Access**: After setup, only super admins can create new admins
3. **Role-Based Access**: Only super admins can create other super admins

---

## Initial Setup: Creating the First Super Admin

### 1. Set Environment Variable

Add this to your `.env.local` file:

```bash
SUPER_ADMIN_SECRET=your-very-secure-secret-key-here
```

⚠️ **Important**: Use a strong, random secret key. This should NEVER be committed to version control.

### 2. Create First Super Admin

**Endpoint**: `POST /api/admin/auth/create`

**Headers**:
```
Content-Type: application/json
X-Setup-Secret: your-very-secure-secret-key-here
```

**Request Body**:
```json
{
  "email": "superadmin@example.com",
  "password": "strong-password-here",
  "name": "Super Admin Name",
  "role": "super_admin",
  "permissions": [
    "view_forms",
    "approve_forms",
    "decline_forms",
    "complete_forms",
    "bulk_operations",
    "view_analytics",
    "manage_users",
    "manage_admins"
  ]
}
```

**Example using cURL**:
```bash
curl -X POST http://localhost:3000/api/admin/auth/create \
  -H "Content-Type: application/json" \
  -H "X-Setup-Secret: your-very-secure-secret-key-here" \
  -d '{
    "email": "superadmin@example.com",
    "password": "strong-password-here",
    "name": "Super Admin Name",
    "role": "super_admin"
  }'
```

### 3. Verify Setup

After creation, login at `/admin` with your credentials.

---

## Creating Additional Admin Users (After Initial Setup)

Once you have a super admin, you can create additional admins through authenticated requests.

### 1. Get Authentication Token

Login at `/admin` or via API:

**Endpoint**: `POST /api/admin/auth/login`

**Request**:
```json
{
  "email": "superadmin@example.com",
  "password": "your-password"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { ... }
}
```

### 2. Create Additional Admins

**Endpoint**: `POST /api/admin/auth/create`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin-password",
  "name": "Admin Name",
  "role": "admin",
  "permissions": [
    "view_forms",
    "approve_forms",
    "decline_forms",
    "complete_forms"
  ]
}
```

**Example using cURL**:
```bash
curl -X POST http://localhost:3000/api/admin/auth/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin@example.com",
    "password": "admin-password",
    "name": "Admin Name",
    "role": "admin"
  }'
```

---

## Admin Roles

### Super Admin (`super_admin`)
- Full system access
- Can create/manage other admins
- Can create other super admins
- Has all permissions

### Admin (`admin`)
- Can manage forms and users
- Cannot create other admins
- Permissions are customizable

---

## Available Permissions

- `view_forms` - View submitted forms
- `approve_forms` - Approve forms
- `decline_forms` - Decline/reject forms
- `complete_forms` - Mark forms as complete
- `bulk_operations` - Perform bulk operations
- `manage_users` - Manage user accounts
- `view_analytics` - View analytics dashboard
- `manage_admins` - Manage other admin users (super_admin only)

---

## Security Best Practices

1. **Secure the Setup Secret**
   - Use a strong, random secret for `SUPER_ADMIN_SECRET`
   - Never commit it to version control
   - Remove or rotate it after initial setup

2. **Protect Admin Credentials**
   - Use strong passwords for all admin accounts
   - Rotate passwords regularly
   - Never share admin credentials

3. **Limit Super Admin Access**
   - Only create super admins when necessary
   - Regularly audit admin users

4. **Monitor Admin Activity**
   - Track admin logins and actions
   - Review admin permissions periodically

---

## Troubleshooting

### "Invalid or missing setup secret"
- Ensure `SUPER_ADMIN_SECRET` is set in your environment
- Verify the header value matches exactly
- This only applies when creating the first super admin

### "Unauthorized. Admin authentication required"
- You need to be logged in as a super admin
- Include the `Authorization: Bearer <token>` header
- Ensure your token hasn't expired (7-day expiry)

### "Forbidden. Only super admins can create admin users"
- Only super admins can create new admin users
- Login with a super admin account

### "Admin user with this email already exists"
- An admin with this email is already in the database
- Use a different email or update the existing admin

---

## Collection Structure

This system uses **TWO separate collections**:

1. **`users`** - Regular users, agents, operators
2. **`adminusers`** - Admin and super admin users

❌ **Do NOT** create admin users in the `users` collection
✅ **Use** the `/api/admin/auth/create` endpoint for admin users

