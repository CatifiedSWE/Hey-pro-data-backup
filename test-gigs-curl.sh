#!/bin/bash

##############################################################################
# Gigs API Testing Script (using curl)
# Tests all gigs endpoints with curl commands
#
# Usage: ./test-gigs-curl.sh [BASE_URL]
# Example: ./test-gigs-curl.sh http://localhost:3000
##############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
API_BASE="${BASE_URL}/api"
AUTH_TOKEN="${AUTH_TOKEN:-}"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test data storage
GIG_ID=""
GIG_SLUG=""
APPLICATION_ID=""

# Helper functions
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$2" == "PASS" ]; then
        echo -e "${GREEN}✓ [PASS]${NC} $1"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$2" == "FAIL" ]; then
        echo -e "${RED}✗ [FAIL]${NC} $1${3:+: $3}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    else
        echo -e "${YELLOW}⊘ [SKIP]${NC} $1${3:+: $3}"
    fi
}

# Test functions
test_health_check() {
    print_header "Test: Health Check"
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        print_test "API Health Check" "PASS" "API is running"
    else
        print_test "API Health Check" "FAIL" "Status: $http_code"
    fi
    
    echo "Response: $body"
}

test_list_gigs() {
    print_header "Test: GET /api/gigs - List Gigs"
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs?page=1&limit=5")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        gig_count=$(echo "$body" | grep -o '"id"' | wc -l)
        print_test "List Gigs" "PASS" "Retrieved $gig_count gigs"
        
        # Extract first gig slug for later use
        GIG_SLUG=$(echo "$body" | grep -o '"slug":"[^"]*"' | head -n1 | sed 's/"slug":"\([^"]*\)"/\1/')
        if [ -n "$GIG_SLUG" ]; then
            print_test "Extract Gig Slug" "PASS" "Slug: $GIG_SLUG"
        fi
    else
        print_test "List Gigs" "FAIL" "Status: $http_code"
    fi
    
    echo "Sample response:"
    echo "$body" | head -c 500
    echo "..."
}

test_create_gig() {
    print_header "Test: POST /api/gigs - Create Gig"
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Create Gig" "SKIP" "No AUTH_TOKEN provided"
        echo "Set AUTH_TOKEN environment variable to test authenticated endpoints"
        return
    fi
    
    timestamp=$(date +%s)
    payload=$(cat <<EOF
{
  "title": "Test Gig $timestamp",
  "description": "This is a test gig created by curl script",
  "qualifyingCriteria": "3+ years experience",
  "amount": 5000,
  "currency": "AED",
  "crewCount": 2,
  "role": "editor",
  "type": "contract",
  "department": "Post-production",
  "company": "Test Productions",
  "isTbc": false,
  "requestQuote": false,
  "expiryDate": "$(date -d '+30 days' -Iseconds 2>/dev/null || date -v+30d -Iseconds)",
  "supportingFileLabel": "Test file",
  "referenceUrl": "https://example.com",
  "dateWindows": [
    { "label": "Jan 2025", "range": "15-20" },
    { "label": "Feb 2025", "range": "1-5" }
  ],
  "locations": ["Dubai", "Abu Dhabi"],
  "references": [
    { "label": "Document.pdf", "url": "https://example.com/doc.pdf", "type": "file" }
  ],
  "status": "active"
}
EOF
)
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE}/gigs" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "201" ]; then
        GIG_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -n1 | sed 's/"id":"\([^"]*\)"/\1/')
        GIG_SLUG=$(echo "$body" | grep -o '"slug":"[^"]*"' | head -n1 | sed 's/"slug":"\([^"]*\)"/\1/')
        print_test "Create Gig" "PASS" "Gig ID: $GIG_ID, Slug: $GIG_SLUG"
    elif [ "$http_code" == "401" ]; then
        print_test "Create Gig" "SKIP" "Authentication required (expected)"
    elif [ "$http_code" == "403" ]; then
        print_test "Create Gig" "SKIP" "Profile must be complete (expected)"
    else
        print_test "Create Gig" "FAIL" "Status: $http_code"
    fi
    
    echo "Response:"
    echo "$body" | head -c 500
}

test_get_gig_by_slug() {
    print_header "Test: GET /api/gigs/slug/[slug] - Get Gig by Slug"
    
    if [ -z "$GIG_SLUG" ]; then
        print_test "Get Gig by Slug" "SKIP" "No gig slug available"
        return
    fi
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs/slug/${GIG_SLUG}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        title=$(echo "$body" | grep -o '"title":"[^"]*"' | head -n1 | sed 's/"title":"\([^"]*\)"/\1/')
        print_test "Get Gig by Slug" "PASS" "Title: $title"
        
        # Check for calendarMonths
        if echo "$body" | grep -q '"calendarMonths"'; then
            print_test "Calendar Months Present" "PASS"
        else
            print_test "Calendar Months Present" "FAIL"
        fi
    elif [ "$http_code" == "404" ]; then
        print_test "Get Gig by Slug" "FAIL" "Gig not found"
    else
        print_test "Get Gig by Slug" "FAIL" "Status: $http_code"
    fi
    
    echo "Sample response:"
    echo "$body" | head -c 500
    echo "..."
}

test_get_gig_by_id() {
    print_header "Test: GET /api/gigs/[id] - Get Gig by ID"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Get Gig by ID" "SKIP" "No gig ID available"
        return
    fi
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs/${GIG_ID}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        print_test "Get Gig by ID" "PASS"
    else
        print_test "Get Gig by ID" "FAIL" "Status: $http_code"
    fi
}

test_update_gig() {
    print_header "Test: PATCH /api/gigs/[id] - Update Gig"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Update Gig" "SKIP" "No gig ID available"
        return
    fi
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Update Gig" "SKIP" "No AUTH_TOKEN provided"
        return
    fi
    
    timestamp=$(date +%s)
    payload=$(cat <<EOF
{
  "title": "Updated Test Gig $timestamp",
  "description": "This gig has been updated",
  "crewCount": 3
}
EOF
)
    
    response=$(curl -s -w "\n%{http_code}" -X PATCH "${API_BASE}/gigs/${GIG_ID}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        print_test "Update Gig" "PASS"
    elif [ "$http_code" == "403" ]; then
        print_test "Update Gig" "SKIP" "Not owner (expected)"
    else
        print_test "Update Gig" "FAIL" "Status: $http_code"
    fi
}

test_apply_to_gig() {
    print_header "Test: POST /api/gigs/[id]/apply - Apply to Gig"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Apply to Gig" "SKIP" "No gig ID available"
        return
    fi
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Apply to Gig" "SKIP" "No AUTH_TOKEN provided"
        return
    fi
    
    payload=$(cat <<EOF
{
  "coverLetter": "I am very interested in this position",
  "portfolioLinks": ["https://portfolio.example.com"],
  "resumeUrl": "https://example.com/resume.pdf"
}
EOF
)
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE}/gigs/${GIG_ID}/apply" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "$payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "201" ]; then
        APPLICATION_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -n1 | sed 's/"id":"\([^"]*\)"/\1/')
        print_test "Apply to Gig" "PASS" "Application ID: $APPLICATION_ID"
    elif [ "$http_code" == "400" ]; then
        if echo "$body" | grep -q "own gig"; then
            print_test "Apply to Gig" "SKIP" "Cannot apply to own gig (expected)"
        elif echo "$body" | grep -q "already applied"; then
            print_test "Apply to Gig" "SKIP" "Already applied (expected)"
        else
            print_test "Apply to Gig" "FAIL" "Bad request"
        fi
    else
        print_test "Apply to Gig" "FAIL" "Status: $http_code"
    fi
}

test_get_applications() {
    print_header "Test: GET /api/gigs/[id]/applications - Get Applications"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Get Applications" "SKIP" "No gig ID available"
        return
    fi
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Get Applications" "SKIP" "No AUTH_TOKEN provided"
        return
    fi
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs/${GIG_ID}/applications" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        app_count=$(echo "$body" | grep -o '"applicant"' | wc -l)
        print_test "Get Applications" "PASS" "Found $app_count applications"
    elif [ "$http_code" == "403" ]; then
        print_test "Get Applications" "SKIP" "Only creator can view (expected)"
    else
        print_test "Get Applications" "FAIL" "Status: $http_code"
    fi
}

test_get_availability() {
    print_header "Test: GET /api/gigs/[id]/availability - Get Availability"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Get Availability" "SKIP" "No gig ID available"
        return
    fi
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Get Availability" "SKIP" "No AUTH_TOKEN provided"
        return
    fi
    
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs/${GIG_ID}/availability" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        print_test "Get Availability" "PASS"
    elif [ "$http_code" == "403" ]; then
        print_test "Get Availability" "SKIP" "Only creator can view (expected)"
    else
        print_test "Get Availability" "FAIL" "Status: $http_code"
    fi
}

test_search_and_filters() {
    print_header "Test: Search and Filters"
    
    # Test search
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs?search=test&limit=5")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" == "200" ]; then
        print_test "Search Gigs" "PASS"
    else
        print_test "Search Gigs" "FAIL" "Status: $http_code"
    fi
    
    # Test role filter
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs?role=editor&limit=5")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" == "200" ]; then
        print_test "Filter by Role" "PASS"
    else
        print_test "Filter by Role" "FAIL" "Status: $http_code"
    fi
    
    # Test type filter
    response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs?type=contract&limit=5")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" == "200" ]; then
        print_test "Filter by Type" "PASS"
    else
        print_test "Filter by Type" "FAIL" "Status: $http_code"
    fi
}

test_delete_gig() {
    print_header "Test: DELETE /api/gigs/[id] - Delete Gig"
    
    if [ -z "$GIG_ID" ]; then
        print_test "Delete Gig" "SKIP" "No gig ID available"
        return
    fi
    
    if [ -z "$AUTH_TOKEN" ]; then
        print_test "Delete Gig" "SKIP" "No AUTH_TOKEN provided"
        return
    fi
    
    response=$(curl -s -w "\n%{http_code}" -X DELETE "${API_BASE}/gigs/${GIG_ID}" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        print_test "Delete Gig" "PASS"
        
        # Verify deletion
        verify_response=$(curl -s -w "\n%{http_code}" "${API_BASE}/gigs/${GIG_ID}")
        verify_code=$(echo "$verify_response" | tail -n1)
        
        if [ "$verify_code" == "404" ]; then
            print_test "Delete Gig - Verification" "PASS" "Gig no longer exists"
        else
            print_test "Delete Gig - Verification" "FAIL" "Gig still exists"
        fi
    elif [ "$http_code" == "403" ]; then
        print_test "Delete Gig" "SKIP" "Not owner (expected)"
    else
        print_test "Delete Gig" "FAIL" "Status: $http_code"
    fi
}

# Print summary
print_summary() {
    print_header "Test Summary"
    echo -e "${GREEN}Passed:  $PASSED_TESTS${NC}"
    echo -e "${RED}Failed:  $FAILED_TESTS${NC}"
    echo -e "${YELLOW}Skipped: $((TOTAL_TESTS - PASSED_TESTS - FAILED_TESTS))${NC}"
    echo -e "${BLUE}Total:   $TOTAL_TESTS${NC}"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
        echo -e "\n${CYAN}Success Rate: ${success_rate}%${NC}"
    fi
    
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              GIGS API TEST SUITE (curl)                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${YELLOW}Base URL: $BASE_URL${NC}"
    echo -e "${YELLOW}Started: $(date)${NC}"
    
    if [ -n "$AUTH_TOKEN" ]; then
        echo -e "${GREEN}✓ Auth token provided${NC}"
    else
        echo -e "${YELLOW}⚠ No auth token - authenticated tests will be skipped${NC}"
        echo -e "${YELLOW}  Set AUTH_TOKEN environment variable to test authenticated endpoints${NC}"
    fi
    
    # Run all tests
    test_health_check
    test_list_gigs
    test_search_and_filters
    test_get_gig_by_slug
    test_create_gig
    test_get_gig_by_id
    test_update_gig
    test_apply_to_gig
    test_get_applications
    test_get_availability
    test_delete_gig
    
    # Print summary
    print_summary
    
    echo -e "${YELLOW}Completed: $(date)${NC}\n"
}

# Run the main function
main
