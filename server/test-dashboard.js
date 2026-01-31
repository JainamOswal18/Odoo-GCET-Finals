#!/usr/bin/env bun

// Test dashboard API endpoint
const API_URL = 'http://localhost:5000/api';

async function testDashboard() {
  console.log('🔐 Logging in...\n');
  
  // Login first
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId: 'admin', password: 'admin123' })
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Login failed:', await loginResponse.text());
    return;
  }
  
  const { token, user } = await loginResponse.json();
  console.log('✅ Logged in as:', user.full_name || user.login_id);
  console.log('🎫 Token:', token.substring(0, 20) + '...\n');
  
  // Fetch dashboard stats
  console.log('📊 Fetching dashboard statistics...\n');
  const dashboardResponse = await fetch(`${API_URL}/reports/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!dashboardResponse.ok) {
    console.error('❌ Dashboard fetch failed:', await dashboardResponse.text());
    return;
  }
  
  const stats = await dashboardResponse.json();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('                  DASHBOARD STATISTICS                 ');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('💰 BUDGET OVERVIEW:');
  console.log(`   Total Budget:        ₹${stats.totalBudget?.toLocaleString('en-IN') || 0}`);
  console.log(`   Actual Spending:     ₹${stats.actualSpending?.toLocaleString('en-IN') || 0}`);
  console.log(`   Remaining Balance:   ₹${stats.remainingBudget?.toLocaleString('en-IN') || 0}`);
  console.log(`   Utilization:         ${stats.budgetUtilization || 0}%`);
  console.log(`   Active Budgets:      ${stats.activeBudgets || 0}`);
  console.log(`   Total Budgets:       ${stats.totalBudgets || 0}\n`);
  
  console.log('📄 INVOICES:');
  console.log(`   Pending Invoices:    ${stats.pendingInvoices || 0}`);
  console.log(`   Total Invoices:      ${stats.totalInvoices || 0}`);
  console.log(`   Total Invoiced:      ₹${stats.totalInvoiced?.toLocaleString('en-IN') || 0}\n`);
  
  console.log('🧾 BILLS:');
  console.log(`   Pending Bills:       ${stats.pendingBills || 0}`);
  console.log(`   Total Bills:         ${stats.totalBills || 0}`);
  console.log(`   Total Billed:        ₹${stats.totalBilled?.toLocaleString('en-IN') || 0}\n`);
  
  console.log('💳 PAYMENTS:');
  console.log(`   Total Payments:      ${stats.totalPayments || 0}`);
  console.log(`   Payments Amount:     ₹${stats.totalPaymentsAmount?.toLocaleString('en-IN') || 0}\n`);
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('✅ Dashboard data fetched successfully!');
  console.log('\n📝 Raw response:', JSON.stringify(stats, null, 2));
}

testDashboard().catch(console.error);
