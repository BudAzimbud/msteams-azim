import { MSGraphService } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function teamAvailabilityExample() {
  console.log('=== Team Availability Example ===\n');

  const graphService = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    verbose: true
  });

  try {
    // Set team members
    graphService.setTeamMembers([
      { 
        id: '1', 
        email: 'richard@boneconsulting.com', 
        name: 'Richard - Senior Consultant' 
      },
      { 
        id: '2', 
        email: 'dev@boneconsulting.com', 
        name: 'Dev - Junior Consultant' 
      }
    ]);

    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 5); // 5 days window

    const start = today.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    console.log(`Checking team availability from ${start} to ${end}\n`);

    // Get individual team member availability
    const teamAvailability = await graphService.getTeamAvailability(start, end);

    console.log('\n📊 Individual Team Member Availability:\n');
    Object.entries(teamAvailability).forEach(([email, availability]) => {
      console.log(`\n👤 ${email}:`);
      availability.forEach(day => {
        if (day.available) {
          console.log(`  ${day.date}: ${day.timeSlots.length} slots available`);
        }
      });
    });

    // Get consolidated availability
    console.log('\n\n📅 Consolidated Team Availability (any member available):\n');
    const consolidated = await graphService.getConsolidatedAvailability(start, end);

    consolidated.forEach(day => {
      if (day.available) {
        console.log(`\n${day.date}:`);
        console.log(`  Slots: ${day.timeSlots.join(', ')}`);
      }
    });

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

teamAvailabilityExample().catch(console.error);
