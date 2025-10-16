#!/bin/bash

# Admin Creation Test Script
# This script tests the admin creation flow

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
SUPER_ADMIN_EMAIL="${SUPER_ADMIN_EMAIL:-superadmin@example.com}"
SUPER_ADMIN_PASSWORD="${SUPER_ADMIN_PASSWORD:-admin123}"

echo "=========================================="
echo "Admin Creation Test Script"
echo "=========================================="
echo ""

# Step 1: Login as Super Admin
echo "Step 1: Logging in as super admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SUPER_ADMIN_EMAIL\",
    \"password\": \"$SUPER_ADMIN_PASSWORD\"
  }")

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Successfully logged in"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create a new admin user
echo "Step 2: Creating a new admin user..."
NEW_ADMIN_EMAIL="test-admin-$(date +%s)@example.com"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/auth/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"email\": \"$NEW_ADMIN_EMAIL\",
    \"password\": \"testadmin123\",
    \"name\": \"Test Admin\",
    \"role\": \"admin\",
    \"permissions\": [
      \"view_forms\",
      \"approve_forms\",
      \"decline_forms\"
    ]
  }")

echo "Create admin response: $CREATE_RESPONSE"
echo ""

# Check if creation was successful
if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Successfully created new admin: $NEW_ADMIN_EMAIL"
else
  echo "❌ Failed to create admin"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo ""
echo "=========================================="
echo "Test completed successfully!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Super admin login: ✅"
echo "- Admin creation: ✅"
echo "- New admin email: $NEW_ADMIN_EMAIL"
echo "- New admin password: testadmin123"

