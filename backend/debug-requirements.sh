#!/bin/bash

# Debug script to check order requirements

BASE_URL="http://localhost:3000/api"

echo "🔍 Debugging Document Upload Issue"
echo "=================================="
echo ""

# Step 1: Login as vendor
echo "1️⃣  Logging in as vendor..."
VENDOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@fastlogistics.com","password":"vendor123"}')

TOKEN=$(echo $VENDOR_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed!"
  echo "Response: $VENDOR_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Step 2: Get vendor orders
echo "2️⃣  Fetching vendor orders..."
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/vendor/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Full response:"
echo "$ORDERS_RESPONSE" | jq '.'
echo ""

# Step 3: Extract order details
ORDER_COUNT=$(echo "$ORDERS_RESPONSE" | jq -r '.orders | length')
echo "📊 Found $ORDER_COUNT orders"
echo ""

if [ "$ORDER_COUNT" -gt 0 ]; then
  # Get first order
  ORDER_ID=$(echo "$ORDERS_RESPONSE" | jq -r '.orders[0].id')
  ORDER_NUMBER=$(echo "$ORDERS_RESPONSE" | jq -r '.orders[0].orderNumber')
  ORDER_STATUS=$(echo "$ORDERS_RESPONSE" | jq -r '.orders[0].status')
  REQUIREMENTS=$(echo "$ORDERS_RESPONSE" | jq -r '.orders[0].requirements')
  
  echo "📦 Order Details:"
  echo "   Order Number: $ORDER_NUMBER"
  echo "   Order ID: $ORDER_ID"
  echo "   Status: $ORDER_STATUS"
  echo ""
  
  echo "📋 Requirements:"
  echo "$REQUIREMENTS" | jq '.'
  echo ""
  
  REQ_COUNT=$(echo "$REQUIREMENTS" | jq -r 'length')
  echo "   Total Requirements: $REQ_COUNT"
  
  if [ "$REQ_COUNT" -eq 0 ]; then
    echo ""
    echo "❌ PROBLEM FOUND: No requirements attached to this order!"
    echo ""
    echo "🔧 Possible causes:"
    echo "   1. No compliance rules defined for this product"
    echo "   2. Backend not creating requirements when order is accepted"
    echo "   3. Database issue"
    echo ""
    echo "💡 Solutions:"
    echo "   1. Check if compliance rules exist for this product"
    echo "   2. Check backend logs when accepting an order"
    echo "   3. Verify the 'accept order' endpoint creates requirements"
  else
    echo ""
    echo "✅ Requirements found!"
    echo ""
    echo "📄 Requirement statuses:"
    echo "$REQUIREMENTS" | jq -r '.[] | "   \(.docType): \(.status)"'
    
    MISSING_COUNT=$(echo "$REQUIREMENTS" | jq -r '[.[] | select(.status == "MISSING")] | length')
    echo ""
    echo "📤 Documents you can upload: $MISSING_COUNT"
    
    if [ "$MISSING_COUNT" -gt 0 ]; then
      echo ""
      echo "✅ Upload buttons should be visible in the UI!"
      echo ""
      echo "To upload, look for the '📎 Upload PDF' button next to:"
      echo "$REQUIREMENTS" | jq -r '.[] | select(.status == "MISSING") | "   - \(.docType)"'
    fi
  fi
fi

echo ""
echo "=================================="
echo "Debug complete!"