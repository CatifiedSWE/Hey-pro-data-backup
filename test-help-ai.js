// Test script to verify n8n webhook integration for help page
const axios = require('axios');

// Test function to call n8n webhook
async function testN8nWebhook() {
  try {
    console.log('Testing n8n webhook integration...\n');
    
    // Generate random section ID (10 alphanumeric characters)
    const generateSectionId = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let sectionId = '';
      for (let i = 0; i < 10; i++) {
        sectionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return sectionId;
    };
    
    const sectionId = generateSectionId();
    const testQuestion = "How do I update my profile?";
    
    console.log(`Section ID: ${sectionId}`);
    console.log(`Question: ${testQuestion}\n`);
    
    // Call the n8n webhook
    const response = await axios.get(
      'https://n8n.srv882974.hstgr.cloud/webhook/3e37b379-3432-43ea-b3e3-abe9d5c2d18f',
      {
        params: {
          question: testQuestion,
          section_id: sectionId
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Extract and display the bot's response
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log('\n=== Bot Response ===');
      console.log(response.data[0].output);
    } else if (response.data && response.data.output) {
      console.log('\n=== Bot Response ===');
      console.log(response.data.output);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from webhook');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testN8nWebhook();
