import { MSGraphService } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function bookMeetingExample() {
  console.log('=== Book Meeting Example ===\n');

  const graphService = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    verbose: true
  });

  try {
    const consultantEmail = 'richard@boneconsulting.com';
    const clientEmail = 'dev@boneconsulting.com'; // Replace with client email
    
    // Get availability first
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking availability for ${tomorrowStr}...\n`);

    const availability = await graphService.getCalendarAvailability(
      consultantEmail,
      tomorrowStr,
      tomorrowStr
    );

    if (availability.length === 0 || !availability[0].available) {
      console.log('❌ No available slots found');
      return;
    }

    const firstSlot = availability[0].timeSlots[0];
    console.log(`✅ Found available slot: ${tomorrowStr} at ${firstSlot}\n`);

    // Book the meeting
    console.log('Booking meeting...\n');

    const booking = await graphService.bookMeeting({
      date: tomorrowStr,
      time: firstSlot,
      duration: 60, // 1 hour meeting
      teamMemberEmail: consultantEmail,
      leadEmail: clientEmail,
      leadName: 'John Client',
      subject: 'Initial Consultation - Project Discussion',
      description: `
        <h2>Meeting Agenda</h2>
        <ul>
          <li>Project requirements review</li>
          <li>Timeline discussion</li>
          <li>Budget overview</li>
          <li>Q&A session</li>
        </ul>
        <p>Looking forward to our discussion!</p>
      `
    });

    console.log('\n✅ Meeting booked successfully!\n');
    console.log('Meeting Details:');
    console.log(`  ID: ${booking.id}`);
    console.log(`  Subject: ${booking.subject}`);
    console.log(`  Start: ${booking.start.dateTime}`);
    console.log(`  End: ${booking.end.dateTime}`);
    
    if (booking.onlineMeeting) {
      console.log(`  Teams Join URL: ${booking.onlineMeeting.joinUrl}`);
    }

    console.log('\n📧 Calendar invites sent to all attendees');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

bookMeetingExample().catch(console.error);
