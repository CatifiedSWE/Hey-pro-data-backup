#!/bin/bash

# Test script to verify the skills API fix
echo "Testing Skills API Fix"
echo "====================="
echo ""

# You need to replace this with an actual JWT token from your Supabase auth
# For testing, get a token by logging in through your app
TOKEN="YOUR_JWT_TOKEN_HERE"

# Test 1: Create a skill (POST)
echo "Test 1: Creating a skill..."
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "skill_name": "Adobe Premiere Pro",
    "description": "Expert level - 5+ years experience",
    "sort_order": 0
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Get all skills (GET)
echo "Test 2: Getting all skills..."
curl -X GET http://localhost:3000/api/skills \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "---"
echo ""

# Test 3: Update a skill (PATCH)
# Replace SKILL_ID with actual ID from Test 1 response
SKILL_ID="REPLACE_WITH_ACTUAL_SKILL_ID"
echo "Test 3: Updating a skill..."
curl -X PATCH http://localhost:3000/api/skills/$SKILL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Expert level - 7+ years experience",
    "sort_order": 1
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "====================="
echo "Test completed!"
