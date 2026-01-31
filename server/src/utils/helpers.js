const calculatePaymentStatus = (totalAmount, amountPaid) => {
  const remaining = totalAmount - amountPaid;
  
  if (remaining <= 0) {
    return 'paid';
  } else if (amountPaid > 0) {
    return 'partially_paid';
  } else {
    return 'unpaid';
  }
};

const calculateBudgetMetrics = (budgeted, actual, theoretical) => {
  const achievementPercentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const remainingBalance = budgeted - actual;
  const variance = actual - theoretical;
  
  return {
    achievementPercentage: parseFloat(achievementPercentage.toFixed(2)),
    remainingBalance: parseFloat(remainingBalance.toFixed(2)),
    variance: parseFloat(variance.toFixed(2))
  };
};

const calculateTheoreticalAmount = (budgetedAmount, periodStart, periodEnd, currentDate) => {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const current = new Date(currentDate || new Date());
  
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((current - start) / (1000 * 60 * 60 * 24));
  
  if (elapsedDays <= 0) return 0;
  if (elapsedDays >= totalDays) return budgetedAmount;
  
  return parseFloat(((budgetedAmount / totalDays) * elapsedDays).toFixed(2));
};

const generateUniqueNumber = (prefix, lastNumber) => {
  const num = lastNumber ? parseInt(lastNumber.replace(prefix, '')) + 1 : 1;
  return `${prefix}${String(num).padStart(5, '0')}`;
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

const calculateTotals = (lines) => {
  let subtotal = 0;
  let taxAmount = 0;
  
  lines.forEach(line => {
    const lineSubtotal = parseFloat(line.quantity) * parseFloat(line.unit_price);
    const lineTax = lineSubtotal * (parseFloat(line.tax_rate || 0) / 100);
    
    subtotal += lineSubtotal;
    taxAmount += lineTax;
  });
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat((subtotal + taxAmount).toFixed(2))
  };
};

export {
  calculatePaymentStatus,
  calculateBudgetMetrics,
  calculateTheoreticalAmount,
  generateUniqueNumber,
  formatDate,
  paginate,
  sanitizeInput,
  calculateTotals
};
