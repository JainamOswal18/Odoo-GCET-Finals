import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company details
const COMPANY_NAME = 'Shiv Furniture';
const COMPANY_ADDRESS = '123 Industrial Area, Phase 2';
const COMPANY_CITY = 'Mumbai, Maharashtra 411037';
const COMPANY_PHONE = '+91 98765 43210';
const COMPANY_EMAIL = 'info@shivfurniture.com';
const COMPANY_GST = 'GST: 27XXXXX1234X1Z5';

export const generateInvoicePDF = (invoice: any, customerName: string, lineItems: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 14, 27);
  doc.text(COMPANY_CITY, 14, 32);
  doc.text(COMPANY_PHONE, 14, 37);
  doc.text(COMPANY_EMAIL, 14, 42);
  doc.text(COMPANY_GST, 14, 47);
  
  // Invoice title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, 60);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoiceNumber || 'N/A'}`, 140, 27);
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 140, 32);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 37);
  if (invoice.reference) {
    doc.text(`Reference: ${invoice.reference}`, 140, 42);
  }
  
  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 14, 75);
  
  // Line items table
  const tableData = lineItems.map((item, index) => [
    index + 1,
    item.productName || 'Product',
    item.quantity,
    `₹${item.unitPrice.toLocaleString()}`,
    `₹${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['Sr.', 'Product', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`₹${subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });
  
  doc.text('Tax (18%):', 140, finalY + 6);
  doc.text(`₹${taxAmount.toLocaleString()}`, 170, finalY + 6, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('Total:', 140, finalY + 14);
  doc.text(`₹${total.toLocaleString()}`, 170, finalY + 14, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 14, 280);
  doc.text('Terms & Conditions: Payment due within 30 days', 14, 285);
  
  // Save PDF
  doc.save(`Invoice-${invoice.invoiceNumber || 'draft'}.pdf`);
};

export const generateVendorBillPDF = (bill: any, vendorName: string, lineItems: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 14, 27);
  doc.text(COMPANY_CITY, 14, 32);
  doc.text(COMPANY_PHONE, 14, 37);
  doc.text(COMPANY_EMAIL, 14, 42);
  doc.text(COMPANY_GST, 14, 47);
  
  // Bill title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDOR BILL', 14, 60);
  
  // Bill details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bill No: ${bill.billNumber || 'N/A'}`, 140, 27);
  doc.text(`Date: ${new Date(bill.billDate).toLocaleDateString()}`, 140, 32);
  doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 140, 37);
  if (bill.billReference) {
    doc.text(`Reference: ${bill.billReference}`, 140, 42);
  }
  
  // Vendor details
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, 14, 75);
  
  // Line items table
  const tableData = lineItems.map((item, index) => [
    index + 1,
    item.productName || 'Product',
    item.quantity,
    `₹${item.unitPrice.toLocaleString()}`,
    `₹${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['Sr.', 'Product', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`₹${subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });
  
  doc.text('Tax (18%):', 140, finalY + 6);
  doc.text(`₹${taxAmount.toLocaleString()}`, 170, finalY + 6, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('Total:', 140, finalY + 14);
  doc.text(`₹${total.toLocaleString()}`, 170, finalY + 14, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Payment Terms: Net 30 days', 14, 280);
  
  // Save PDF
  doc.save(`VendorBill-${bill.billNumber || 'draft'}.pdf`);
};

export const generateSalesOrderPDF = (order: any, customerName: string, lineItems: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 14, 27);
  doc.text(COMPANY_CITY, 14, 32);
  doc.text(COMPANY_PHONE, 14, 37);
  doc.text(COMPANY_EMAIL, 14, 42);
  
  // Order title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES ORDER', 14, 60);
  
  // Order details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order No: ${order.orderNumber || order.soNumber || 'N/A'}`, 140, 27);
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 140, 32);
  if (order.expectedDate) {
    doc.text(`Expected: ${new Date(order.expectedDate).toLocaleDateString()}`, 140, 37);
  }
  doc.text(`Status: ${order.status.toUpperCase()}`, 140, 42);
  
  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 14, 75);
  
  // Line items table
  const tableData = lineItems.map((item, index) => [
    index + 1,
    item.productName || 'Product',
    item.quantity,
    `₹${item.unitPrice.toLocaleString()}`,
    `₹${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['Sr.', 'Product', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`₹${subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });
  
  doc.text('Tax (18%):', 140, finalY + 6);
  doc.text(`₹${taxAmount.toLocaleString()}`, 170, finalY + 6, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('Total:', 140, finalY + 14);
  doc.text(`₹${total.toLocaleString()}`, 170, finalY + 14, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your order!', 14, 280);
  
  // Save PDF
  doc.save(`SalesOrder-${order.orderNumber || order.soNumber || 'draft'}.pdf`);
};

export const generatePurchaseOrderPDF = (order: any, vendorName: string, lineItems: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 14, 27);
  doc.text(COMPANY_CITY, 14, 32);
  doc.text(COMPANY_PHONE, 14, 37);
  doc.text(COMPANY_EMAIL, 14, 42);
  
  // Order title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', 14, 60);
  
  // Order details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PO No: ${order.orderNumber || order.poNumber || 'N/A'}`, 140, 27);
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 140, 32);
  if (order.expectedDate) {
    doc.text(`Expected: ${new Date(order.expectedDate).toLocaleDateString()}`, 140, 37);
  }
  doc.text(`Status: ${order.status.toUpperCase()}`, 140, 42);
  
  // Vendor details
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, 14, 75);
  
  // Line items table
  const tableData = lineItems.map((item, index) => [
    index + 1,
    item.productName || 'Product',
    item.quantity,
    `₹${item.unitPrice.toLocaleString()}`,
    `₹${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['Sr.', 'Product', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`₹${subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });
  
  doc.text('Tax (18%):', 140, finalY + 6);
  doc.text(`₹${taxAmount.toLocaleString()}`, 170, finalY + 6, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('Total:', 140, finalY + 14);
  doc.text(`₹${total.toLocaleString()}`, 170, finalY + 14, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Please confirm receipt and deliver as per schedule.', 14, 280);
  
  // Save PDF
  doc.save(`PurchaseOrder-${order.orderNumber || order.poNumber || 'draft'}.pdf`);
};
