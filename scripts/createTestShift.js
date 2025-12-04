#!/usr/bin/env node

/**
 * Test Shift Creator
 * Creates shifts with backdated sign-on times for testing alerts
 * 
 * Usage:
 *   node scripts/createTestShift.js 8    # Creates shift 8 minutes ago
 *   node scripts/createTestShift.js 14   # Creates shift 14 minutes ago
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';
const TESTING_MODE = process.env.TESTING_MODE === 'true';

// Get minutes ago from command line argument
const minutesAgo = parseInt(process.argv[2]) || 8;

if (!TESTING_MODE) {
  console.warn('⚠️  WARNING: TESTING_MODE is not enabled!');
  console.warn('⚠️  This will create a shift with hours-based calculations.');
  console.warn('⚠️  Set TESTING_MODE=true in .env for minute-based testing.');
}

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@railway.com',
      password: 'Admin@123'
    });
    return response.data.data.accessToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure the server is running and default admin user exists');
    process.exit(1);
  }
}

async function createShift(token, minutesAgo) {
  // Calculate sign-on time
  const signOnDateTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  const shiftData = {
    trainNumber: `TEST${Date.now().toString().slice(-4)}`,
    trainName: 'Test Express',
    locomotiveNo: `WAP-7-${Date.now().toString().slice(-5)}`,
    locoPilot: {
      employeeId: `LP${Date.now().toString().slice(-3)}`,
      name: 'Test Loco Pilot',
      phone: '+91-9876543210'
    },
    trainManager: {
      employeeId: `TM${Date.now().toString().slice(-3)}`,
      name: 'Test Train Manager',
      phone: '+91-9876543211'
    },
    trainArrivalDateTime: signOnDateTime.toISOString(),
    signOnDateTime: signOnDateTime.toISOString(),
    signOnStation: 'MUMBAI',
    section: 'Mumbai-Delhi',
    dutyType: 'SP',
    // lobbySignOn removed from schema
  };

  try {
    const response = await axios.post(`${API_URL}/shifts`, shiftData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Shift creation failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    process.exit(1);
  }
}

async function getAlerts(token, shiftId) {
  try {
    const response = await axios.get(`${API_URL}/shifts/${shiftId}/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    return null;
  }
}

// Main execution
(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 Test Shift Creator');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Mode: ${TESTING_MODE ? 'TESTING (minutes)' : 'PRODUCTION (hours)'}`);
  console.log(`Creating shift with sign-on time: ${minutesAgo} ${TESTING_MODE ? 'minutes' : 'hours'} ago`);
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Login
  console.log('1️⃣  Logging in...');
  const token = await login();
  console.log('✅ Logged in successfully\n');

  // 2. Create shift
  console.log('2️⃣  Creating test shift...');
  const shift = await createShift(token, minutesAgo);
  console.log('✅ Shift created successfully\n');

  // 3. Display shift details
  console.log('📋 Shift Details:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Shift ID: ${shift.id}`);
  console.log(`Train Number: ${shift.trainNumber}`);
  console.log(`Train Name: ${shift.trainName}`);
  console.log(`Locomotive: ${shift.locomotiveNo}`);
  console.log(`Sign-on Time: ${new Date(shift.signOnDateTime).toLocaleString()}`);
  console.log(`Sign-on Station: ${shift.signOnStation}`);
  console.log(`Section: ${shift.section}`);
  console.log(`Status: ${shift.status}`);
  console.log('─────────────────────────────────────────────────────\n');

  // 4. Expected alerts
  console.log('⏰ Expected Alerts:');
  console.log('─────────────────────────────────────────────────────');
  
  const alerts = [
    { threshold: 7, label: '7-minute/hour alert (Info only)' },
    { threshold: 8, label: '8-minute/hour alert (Plan Relief)' },
    { threshold: 9, label: '9-minute/hour alert (Critical)' },
    { threshold: 10, label: '10-minute/hour alert (Extended)' },
    { threshold: 11, label: '11-minute/hour alert (Emergency)' },
    { threshold: 14, label: '14-minute/hour alert (Maximum)' }
  ];

  alerts.forEach(({ threshold, label }) => {
    if (minutesAgo >= threshold) {
      console.log(`✅ ${label} - Will trigger on next monitoring cycle`);
    } else {
      const remaining = threshold - minutesAgo;
      console.log(`⏳ ${label} - In ${remaining} ${TESTING_MODE ? 'minutes' : 'hours'}`);
    }
  });

  console.log('─────────────────────────────────────────────────────\n');

  // 5. Wait and check for alerts
  if (minutesAgo >= 7) {
    console.log('⏳ Waiting 35 seconds for monitoring cycle...\n');
    await new Promise(resolve => setTimeout(resolve, 35000));

    console.log('4️⃣  Checking alert history...');
    const alertHistory = await getAlerts(token, shift.id);
    
    if (alertHistory && alertHistory.alertHistory.length > 0) {
      console.log(`✅ Found ${alertHistory.alertHistory.length} alert(s):\n`);
      
      alertHistory.alertHistory.forEach((alert, index) => {
        console.log(`   ${index + 1}. ${alert.type} Alert`);
        console.log(`      Sent: ${new Date(alert.sentAt).toLocaleString()}`);
        console.log(`      Requires Action: ${alert.requiresAction ? 'Yes' : 'No'}`);
        if (alert.response) {
          console.log(`      Response: ${alert.response}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No alerts found yet. Check again in 30 seconds.\n');
    }
  }

  // 6. Next steps
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 Next Steps:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`1. Monitor logs for alert messages`);
  console.log(`2. Connect Socket.io client to receive real-time alerts`);
  console.log(`3. Submit responses for alerts that require action:`);
  console.log(`   POST /shifts/${shift.id}/alert-response`);
  console.log(`4. Check alert history:`);
  console.log(`   GET /shifts/${shift.id}/alerts`);
  console.log(`5. View shift details:`);
  console.log(`   GET /shifts/${shift.id}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Example curl commands
  console.log('🔧 Example Commands:');
  console.log('─────────────────────────────────────────────────────');
  console.log('\n# Get alert history:');
  console.log(`curl http://localhost:8080/api/v1/shifts/${shift.id}/alerts \\`);
  console.log(`  -H "Authorization: Bearer ${token.substring(0, 20)}..."`);
  
  console.log('\n# Submit 8HR response:');
  console.log(`curl -X POST http://localhost:8080/api/v1/shifts/${shift.id}/alert-response \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "Authorization: Bearer ${token.substring(0, 20)}..." \\`);
  console.log(`  -d '{"alertType":"8HR","response":"PLAN_RELIEF","remarks":"Test"}'`);
  
  console.log('\n─────────────────────────────────────────────────────\n');
})();
