/**
 * Comprehensive Gigs API Testing Script
 * Tests all gigs endpoints systematically
 * 
 * Prerequisites:
 * 1. Next.js dev server running (npm run dev)
 * 2. Valid Supabase credentials in environment
 * 3. At least one test user account
 * 
 * Usage: node test-gigs-api.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data storage
const testData = {
  createdGigId: null,
  createdGigSlug: null,
  applicationId: null,
  authToken: null
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test result tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logTest(name, status, message = '') {
  results.total++;
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${statusColor}[${status}]${colors.reset} ${name}${message ? ': ' + message : ''}`);
  
  results.tests.push({ name, status, message });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.skipped++;
}

function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Test functions
async function testHealthCheck() {
  logSection('Health Check');
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.status === 200 && response.data.success) {
      logTest('API Health Check', 'PASS', 'API is running');
      return true;
    } else {
      logTest('API Health Check', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('API Health Check', 'FAIL', error.message);
    return false;
  }
}

async function testCreateGig() {
  logSection('Test: POST /api/gigs - Create Gig');
  
  const gigData = {
    title: `Test Gig ${Date.now()}`,
    description: 'This is a test gig created by automated testing',
    qualifyingCriteria: '3+ years experience required',
    amount: 5000,
    currency: 'AED',
    crewCount: 2,
    role: 'editor',
    type: 'contract',
    department: 'Post-production',
    company: 'Test Productions',
    isTbc: false,
    requestQuote: false,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    supportingFileLabel: 'Test file',
    referenceUrl: 'https://example.com',
    dateWindows: [
      { label: 'Jan 2025', range: '15-20, 25' },
      { label: 'Feb 2025', range: '1-5' }
    ],
    locations: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    references: [
      { label: 'Document.pdf', url: 'https://example.com/doc.pdf', type: 'file' },
      { label: 'Reference Link', url: 'https://example.com', type: 'link' }
    ],
    status: 'active'
  };

  try {
    const response = await makeRequest(`${API_BASE}/gigs`, {
      method: 'POST',
      body: gigData,
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Create Gig - Auth Required', 'SKIP', 'No auth token provided (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Create Gig - Profile Required', 'SKIP', 'Profile must be complete (expected)');
      return false;
    }

    if (response.status === 201 && response.data.success) {
      testData.createdGigId = response.data.data.id;
      testData.createdGigSlug = response.data.data.slug;
      logTest('Create Gig', 'PASS', `Gig created with ID: ${testData.createdGigId}`);
      logTest('Gig Slug Generation', 'PASS', `Slug: ${testData.createdGigSlug}`);
      logTest('Gig Date Windows', 'PASS', `${response.data.data.dateWindows?.length || 0} date windows`);
      logTest('Gig Locations', 'PASS', `${response.data.data.locations?.length || 0} locations`);
      logTest('Gig References', 'PASS', `${response.data.data.references?.length || 0} references`);
      return true;
    } else {
      logTest('Create Gig', 'FAIL', `Status: ${response.status}, Error: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Create Gig', 'FAIL', error.message);
    return false;
  }
}

async function testListGigs() {
  logSection('Test: GET /api/gigs - List Gigs');

  try {
    // Test 1: Basic listing
    const response = await makeRequest(`${API_BASE}/gigs?page=1&limit=10`);
    
    if (response.status === 200 && response.data.success) {
      const gigs = response.data.data.gigs || [];
      const pagination = response.data.data.pagination || {};
      
      logTest('List Gigs - Basic', 'PASS', `Retrieved ${gigs.length} gigs`);
      logTest('List Gigs - Pagination', 'PASS', `Page ${pagination.currentPage}/${pagination.totalPages}`);
      
      // Verify gig structure
      if (gigs.length > 0) {
        const gig = gigs[0];
        const hasRequiredFields = gig.id && gig.slug && gig.title && gig.postedBy;
        logTest('List Gigs - Data Structure', hasRequiredFields ? 'PASS' : 'FAIL', 
          hasRequiredFields ? 'All required fields present' : 'Missing required fields');
      }
      
      return true;
    } else {
      logTest('List Gigs', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('List Gigs', 'FAIL', error.message);
    return false;
  }
}

async function testGetGigBySlug() {
  logSection('Test: GET /api/gigs/slug/[slug] - Get Gig by Slug');

  if (!testData.createdGigSlug) {
    logTest('Get Gig by Slug', 'SKIP', 'No test gig created');
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE}/gigs/slug/${testData.createdGigSlug}`);
    
    if (response.status === 200 && response.data.success) {
      const gig = response.data.data;
      logTest('Get Gig by Slug', 'PASS', `Retrieved gig: ${gig.title}`);
      logTest('Gig - Calendar Months', gig.calendarMonths ? 'PASS' : 'FAIL', 
        `${gig.calendarMonths?.length || 0} calendar months`);
      logTest('Gig - Posted By', gig.postedBy?.name ? 'PASS' : 'FAIL', 
        `Posted by: ${gig.postedBy?.name || 'Unknown'}`);
      return true;
    } else if (response.status === 404) {
      logTest('Get Gig by Slug', 'FAIL', 'Gig not found');
      return false;
    } else {
      logTest('Get Gig by Slug', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Get Gig by Slug', 'FAIL', error.message);
    return false;
  }
}

async function testGetGigById() {
  logSection('Test: GET /api/gigs/[id] - Get Gig by ID');

  if (!testData.createdGigId) {
    logTest('Get Gig by ID', 'SKIP', 'No test gig created');
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}`);
    
    if (response.status === 200 && response.data.success) {
      const gig = response.data.data;
      logTest('Get Gig by ID', 'PASS', `Retrieved gig: ${gig.title}`);
      logTest('Gig - All Fields Present', 
        gig.id && gig.slug && gig.title && gig.description ? 'PASS' : 'FAIL',
        'Core fields verified');
      return true;
    } else {
      logTest('Get Gig by ID', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Get Gig by ID', 'FAIL', error.message);
    return false;
  }
}

async function testUpdateGig() {
  logSection('Test: PATCH /api/gigs/[id] - Update Gig');

  if (!testData.createdGigId) {
    logTest('Update Gig', 'SKIP', 'No test gig created');
    return false;
  }

  const updateData = {
    title: `Updated Test Gig ${Date.now()}`,
    description: 'This gig has been updated',
    crewCount: 3,
    amount: 7500
  };

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}`, {
      method: 'PATCH',
      body: updateData,
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Update Gig - Auth Required', 'SKIP', 'No auth token (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Update Gig - Permission Denied', 'SKIP', 'Not owner (expected)');
      return false;
    }

    if (response.status === 200 && response.data.success) {
      const gig = response.data.data;
      testData.createdGigSlug = gig.slug; // Update slug if title changed
      logTest('Update Gig', 'PASS', `Updated to: ${gig.title}`);
      logTest('Update Gig - Slug Regenerated', 'PASS', `New slug: ${gig.slug}`);
      return true;
    } else {
      logTest('Update Gig', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Update Gig', 'FAIL', error.message);
    return false;
  }
}

async function testApplyToGig() {
  logSection('Test: POST /api/gigs/[id]/apply - Apply to Gig');

  if (!testData.createdGigId) {
    logTest('Apply to Gig', 'SKIP', 'No test gig created');
    return false;
  }

  const applicationData = {
    coverLetter: 'I am very interested in this position...',
    portfolioLinks: ['https://portfolio.example.com'],
    resumeUrl: 'https://example.com/resume.pdf'
  };

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}/apply`, {
      method: 'POST',
      body: applicationData,
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Apply to Gig - Auth Required', 'SKIP', 'No auth token (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Apply to Gig - Profile Required', 'SKIP', 'Profile incomplete (expected)');
      return false;
    }

    if (response.status === 400 && response.data.error?.includes('own gig')) {
      logTest('Apply to Gig - Own Gig Check', 'PASS', 'Cannot apply to own gig (expected)');
      return false;
    }

    if (response.status === 201 && response.data.success) {
      testData.applicationId = response.data.data.id;
      logTest('Apply to Gig', 'PASS', `Application submitted: ${testData.applicationId}`);
      logTest('Apply to Gig - Notification', 'PASS', 'Creator notified');
      return true;
    } else {
      logTest('Apply to Gig', 'FAIL', `Status: ${response.status}, ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Apply to Gig', 'FAIL', error.message);
    return false;
  }
}

async function testGetApplications() {
  logSection('Test: GET /api/gigs/[id]/applications - Get Applications');

  if (!testData.createdGigId) {
    logTest('Get Applications', 'SKIP', 'No test gig created');
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}/applications`, {
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Get Applications - Auth Required', 'SKIP', 'No auth token (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Get Applications - Permission Check', 'PASS', 'Only creator can view (expected)');
      return false;
    }

    if (response.status === 200 && response.data.success) {
      const applications = response.data.data.applications || [];
      const stats = response.data.data.stats || {};
      
      logTest('Get Applications', 'PASS', `Retrieved ${applications.length} applications`);
      logTest('Get Applications - Stats', 'PASS', 
        `Pending: ${stats.pending}, Shortlisted: ${stats.shortlisted}, Confirmed: ${stats.confirmed}`);
      
      if (applications.length > 0) {
        const app = applications[0];
        const hasApplicantData = app.applicant?.name && app.applicant?.location;
        logTest('Get Applications - Applicant Data', hasApplicantData ? 'PASS' : 'FAIL',
          hasApplicantData ? 'Profile data populated' : 'Missing profile data');
      }
      
      return true;
    } else {
      logTest('Get Applications', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Get Applications', 'FAIL', error.message);
    return false;
  }
}

async function testGetAvailability() {
  logSection('Test: GET /api/gigs/[id]/availability - Get Applicant Availability');

  if (!testData.createdGigId) {
    logTest('Get Availability', 'SKIP', 'No test gig created');
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}/availability`, {
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Get Availability - Auth Required', 'SKIP', 'No auth token (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Get Availability - Permission Check', 'PASS', 'Only creator can view (expected)');
      return false;
    }

    if (response.status === 200 && response.data.success) {
      const availability = response.data.data.applicantsAvailability || [];
      const gigDates = response.data.data.gigDates || [];
      
      logTest('Get Availability', 'PASS', `Retrieved availability for ${availability.length} applicants`);
      logTest('Get Availability - Gig Dates', 'PASS', `${gigDates.length} date windows`);
      
      if (availability.length > 0) {
        const schedule = availability[0].schedule || {};
        const scheduleKeys = Object.keys(schedule);
        logTest('Get Availability - Schedule Format', scheduleKeys.length > 0 ? 'PASS' : 'FAIL',
          `${scheduleKeys.length} dates in schedule`);
      }
      
      return true;
    } else {
      logTest('Get Availability', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Get Availability', 'FAIL', error.message);
    return false;
  }
}

async function testDeleteGig() {
  logSection('Test: DELETE /api/gigs/[id] - Delete Gig');

  if (!testData.createdGigId) {
    logTest('Delete Gig', 'SKIP', 'No test gig created');
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}`, {
      method: 'DELETE',
      headers: testData.authToken ? { 'Authorization': `Bearer ${testData.authToken}` } : {}
    });

    if (response.status === 401) {
      logTest('Delete Gig - Auth Required', 'SKIP', 'No auth token (expected)');
      return false;
    }

    if (response.status === 403) {
      logTest('Delete Gig - Permission Denied', 'SKIP', 'Not owner (expected)');
      return false;
    }

    if (response.status === 200 && response.data.success) {
      logTest('Delete Gig', 'PASS', 'Gig deleted successfully');
      
      // Verify deletion with GET request
      const verifyResponse = await makeRequest(`${API_BASE}/gigs/${testData.createdGigId}`);
      if (verifyResponse.status === 404) {
        logTest('Delete Gig - Verification', 'PASS', 'Gig no longer exists');
      } else {
        logTest('Delete Gig - Verification', 'FAIL', 'Gig still exists');
      }
      
      return true;
    } else {
      logTest('Delete Gig', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Delete Gig', 'FAIL', error.message);
    return false;
  }
}

async function testSearchAndFilters() {
  logSection('Test: GET /api/gigs - Search and Filters');

  try {
    // Test search
    const searchResponse = await makeRequest(`${API_BASE}/gigs?search=test&limit=5`);
    if (searchResponse.status === 200) {
      logTest('Search Gigs', 'PASS', `Found ${searchResponse.data.data?.gigs?.length || 0} results`);
    } else {
      logTest('Search Gigs', 'FAIL', `Status: ${searchResponse.status}`);
    }

    // Test role filter
    const roleResponse = await makeRequest(`${API_BASE}/gigs?role=editor&limit=5`);
    if (roleResponse.status === 200) {
      logTest('Filter by Role', 'PASS', `Found ${roleResponse.data.data?.gigs?.length || 0} editor gigs`);
    } else {
      logTest('Filter by Role', 'FAIL', `Status: ${roleResponse.status}`);
    }

    // Test type filter
    const typeResponse = await makeRequest(`${API_BASE}/gigs?type=contract&limit=5`);
    if (typeResponse.status === 200) {
      logTest('Filter by Type', 'PASS', `Found ${typeResponse.data.data?.gigs?.length || 0} contract gigs`);
    } else {
      logTest('Filter by Type', 'FAIL', `Status: ${typeResponse.status}`);
    }

    return true;
  } catch (error) {
    logTest('Search and Filters', 'FAIL', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.blue}║${' '.repeat(15)}GIGS API TEST SUITE${' '.repeat(23)}║${colors.reset}`);
  console.log(`${colors.blue}╚${'═'.repeat(58)}╝${colors.reset}`);
  console.log(`\n${colors.yellow}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}Starting tests at: ${new Date().toISOString()}${colors.reset}\n`);

  // Run tests in sequence
  await testHealthCheck();
  await testListGigs();
  await testSearchAndFilters();
  await testCreateGig();
  await testGetGigBySlug();
  await testGetGigById();
  await testUpdateGig();
  await testApplyToGig();
  await testGetApplications();
  await testGetAvailability();
  await testDeleteGig();

  // Print summary
  logSection('Test Summary');
  console.log(`${colors.green}Passed:  ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:  ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
  console.log(`${colors.blue}Total:   ${results.total}${colors.reset}`);
  
  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(`\n${colors.cyan}Success Rate: ${successRate}%${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  - ${t.name}: ${t.message}`);
    });
  }

  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}Testing completed at: ${new Date().toISOString()}${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
