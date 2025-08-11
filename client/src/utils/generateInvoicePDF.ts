import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderDetails {
  orderId: string;
  paymentMethod: string;
  total: number;
  items: number;
  estimatedDelivery: string;
}

export const generateInvoicePDF = (orderDetails: OrderDetails) => {
  const doc = new jsPDF();

  // Add company logo and header
  doc.setFontSize(20);
  doc.text('Joy Store', 20, 20);
  
  doc.setFontSize(12);
  doc.text('Invoice', 20, 30);
  
  // Add order details
  doc.setFontSize(10);
  doc.text(`Order ID: ${orderDetails.orderId}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
  doc.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, 50);
  
  // Add billing details
  doc.text('Billing Details:', 20, 65);
  doc.text('Joy Store', 20, 75);
  doc.text('123 Main Street', 20, 80);
  doc.text('Kathmandu, Nepal', 20, 85);
  doc.text('Phone: +977 1-4567890', 20, 90);
  
  // Add order summary table
  autoTable(doc, {
    startY: 100,
    head: [['Description', 'Amount']],
    body: [
      ['Subtotal', `$${(orderDetails.total * 0.87).toFixed(2)}`],
      ['Tax (13%)', `$${(orderDetails.total * 0.13).toFixed(2)}`],
      ['Total', `$${orderDetails.total.toFixed(2)}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [69, 79, 191] }
  });
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('Thank you for shopping with Joy Store!', 20, pageHeight - 20);
  doc.text('For any queries, please contact support@joystore.com', 20, pageHeight - 15);
  
  // Save the PDF
  doc.save(`invoice-${orderDetails.orderId}.pdf`);
};