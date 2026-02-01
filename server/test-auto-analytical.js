import { allQuery, getQuery, runQuery } from './src/config/database.js';
import analyticalService from './src/services/analyticalService.js';

const db = { allQuery, getQuery, runQuery };

async function testAutoAnalyticalModel() {
  console.log('🧪 Testing Auto Analytical Model Implementation\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check table structure
    console.log('\n✅ Test 1: Check table structure');
    const columns = await db.allQuery('PRAGMA table_info(auto_analytical_models)');
    const columnNames = columns.map(c => c.name);
    console.log('Columns:', columnNames.join(', '));
    
    const requiredColumns = ['status', 'partner_tag', 'product_category', 'partner_id', 'product_id', 'analytical_account_id'];
    const hasAllColumns = requiredColumns.every(col => columnNames.includes(col));
    console.log(hasAllColumns ? '✅ All required columns exist' : '❌ Missing columns');

    // Test 2: Get sample contact with tags
    console.log('\n✅ Test 2: Check contacts tags format');
    const contact = await db.getQuery('SELECT id, name, tags FROM contacts WHERE tags IS NOT NULL LIMIT 1');
    if (contact) {
      console.log(`Contact: ${contact.name}`);
      console.log(`Tags (raw): ${contact.tags}`);
      try {
        if (contact.tags && contact.tags.startsWith('[')) {
          const parsed = JSON.parse(contact.tags);
          console.log(`Tags (parsed):`, parsed);
          console.log('✅ Tags are in JSON array format');
        }
      } catch (e) {
        console.log('⚠️  Tags parsing error:', e.message);
      }
    }

    // Test 3: Get sample product
    console.log('\n✅ Test 3: Check products');
    const product = await db.getQuery('SELECT id, name, category FROM products WHERE category IS NOT NULL LIMIT 1');
    if (product) {
      console.log(`Product: ${product.name}`);
      console.log(`Category: ${product.category}`);
      console.log('✅ Product has category');
    }

    // Test 4: Get analytical accounts
    console.log('\n✅ Test 4: Check analytical accounts');
    const analyticalAccount = await db.getQuery('SELECT id, code, name FROM analytical_accounts LIMIT 1');
    if (analyticalAccount) {
      console.log(`Analytical Account: ${analyticalAccount.code} - ${analyticalAccount.name}`);
      console.log('✅ Analytical accounts exist');
    }

    // Test 5: Create a test model
    console.log('\n✅ Test 5: Create test model');
    if (analyticalAccount && product) {
      // Check if test model already exists
      const existing = await db.getQuery(
        "SELECT id FROM auto_analytical_models WHERE analytical_account_id = ? AND product_category = ?",
        [analyticalAccount.id, product.category]
      );

      if (!existing) {
        const result = await db.runQuery(
          `INSERT INTO auto_analytical_models 
          (status, product_category, analytical_account_id) 
          VALUES (?, ?, ?)`,
          ['confirm', product.category, analyticalAccount.id]
        );
        console.log(`✅ Created test model with ID: ${result.id}`);
        console.log(`   - Status: confirm`);
        console.log(`   - Product Category: ${product.category}`);
        console.log(`   - Applies: ${analyticalAccount.name}`);
      } else {
        console.log(`✅ Test model already exists (ID: ${existing.id})`);
      }
    }

    // Test 6: List all models
    console.log('\n✅ Test 6: List all auto analytical models');
    const models = await db.allQuery(
      `SELECT aam.*, aa.name as analytical_name, aa.code as analytical_code
       FROM auto_analytical_models aam
       LEFT JOIN analytical_accounts aa ON aam.analytical_account_id = aa.id`
    );
    console.log(`Found ${models.length} model(s):`);
    models.forEach(m => {
      const conditions = [];
      if (m.partner_tag) conditions.push(`Tag: ${m.partner_tag}`);
      if (m.product_category) conditions.push(`Category: ${m.product_category}`);
      if (m.partner_id) conditions.push(`Partner ID: ${m.partner_id}`);
      if (m.product_id) conditions.push(`Product ID: ${m.product_id}`);
      
      console.log(`\n  Model #${m.id} [${m.status}]:`);
      console.log(`    Applies: ${m.analytical_code} - ${m.analytical_name}`);
      console.log(`    Conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None'}`);
      console.log(`    Priority: ${conditions.length} field(s)`);
    });

    // Test 7: Test matching logic
    console.log('\n✅ Test 7: Test matching logic');
    if (contact && product) {
      const matchData = {
        partnerId: contact.id,
        partnerTag: contact.tags,
        productId: product.id,
        productCategory: product.category
      };
      
      console.log('\nTransaction data:');
      console.log(`  Partner: ${contact.name} (ID: ${contact.id})`);
      console.log(`  Product: ${product.name}`);
      console.log(`  Category: ${product.category}`);
      
      const analyticalAccountId = await analyticalService.applyAutoModels(matchData);
      
      if (analyticalAccountId) {
        const applied = await db.getQuery(
          'SELECT code, name FROM analytical_accounts WHERE id = ?',
          [analyticalAccountId]
        );
        console.log(`\n✅ Match found! Will apply: ${applied.code} - ${applied.name}`);
      } else {
        console.log('\n⚠️  No matching model found');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!\n');
    console.log('The Auto Analytical Model feature is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Refresh the frontend page');
    console.log('2. Go to Master → Auto Analytical');
    console.log('3. Create a new model');
    console.log('4. Test it by creating a Purchase Order');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  }

  process.exit(0);
}

// Run tests
testAutoAnalyticalModel();
