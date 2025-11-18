import { MSGraphService } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function diagnosticExample() {
  console.log('=== Microsoft Graph Diagnostic Tool ===\n');

  const graphService = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    verbose: true
  });

  try {
    // Run full diagnostic
    await graphService.diagnoseSetup();

  } catch (error: any) {
    console.error('\n❌ Diagnostic Error:', error.message);
    console.error('\nPlease check your configuration and try again.');
  }
}

diagnosticExample().catch(console.error);
