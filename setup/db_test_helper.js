import { addSentOffer, checkIfOfferSentRecently, initializeDatabase } from '../web/database.js';

async function runDbTest() {
  const testCheckoutId = `gid://shopify/Checkout/test${Date.now()}`;
  const testEmail = 'test@example.com';
  const testCoupon = 'TESTCODE123';

  try {
    console.log('Initializing database for test...');
    await initializeDatabase();
    console.log('Database initialized.');

    console.log(`\nStep 1: Checking if offer was sent recently for a NEW checkout ID (${testCheckoutId})...`);
    let isRecent = await checkIfOfferSentRecently({ checkout_id: testCheckoutId });
    if (isRecent) {
      console.error('❌ FAIL: Offer should NOT exist for a new checkout ID.');
    } else {
      console.log('✅ PASS: No recent offer found, as expected.');
    }

    console.log('\nStep 2: Adding a new offer record to the database...');
    await addSentOffer({
      checkout_id: testCheckoutId,
      customer_email: testEmail,
      coupon_code: testCoupon,
      status: 'SUCCESS',
    });
    console.log('✅ PASS: Offer added successfully.');

    console.log(`\nStep 3: Checking again if an offer was sent recently for the SAME checkout ID (${testCheckoutId})...`);
    isRecent = await checkIfOfferSentRecently({ checkout_id: testCheckoutId });
    if (isRecent) {
      console.log('✅ PASS: Offer was correctly found in the database.');
    } else {
      console.error('❌ FAIL: The offer that was just added could not be found.');
    }

  } catch (error) {
    console.error('\n❌ An error occurred during the database test:', error);
    process.exit(1);
  }
}

runDbTest();
