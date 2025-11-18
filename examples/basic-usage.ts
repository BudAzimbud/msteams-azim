import { MSGraphService } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function basicExample() {
  console.log('=== Basic Microsoft Graph Calendar Example ===\n');

  // Initialize the service
  const graphService = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    timeZone: 'Singapore Standard Time',
    verbose: true
  });

  try {
    // Test connection
    console.log('Testing Graph API connection...');
    const isConnected = await graphService.testGraphAccess();
    
    if (!isConnected) {
      console.error('Failed to connect to Microsoft Graph API');
      return;
    }

    console.log('\n✅ Successfully connected to Microsoft Graph API\n');

    // Get availability for a user
    const userEmail = 'dev@boneconsulting.com'; // Replace with your test user
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];

    console.log(`Fetching availability for ${userEmail}...`);
    console.log(`Date range: ${startDate} to ${endDate}\n`);

    const availability = await graphService.getCalendarAvailability(
      userEmail,
      startDate,
      endDate
    );

    console.log('\n📅 Calendar Availability:');
    availability.forEach(day => {
      console.log(`\nDate: ${day.date}`);
      console.log(`Available: ${day.available}`);
      console.log(`Time Slots: ${day.timeSlots.join(', ')}`);
    });

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

// Run the example
basicExample().catch(console.error);
