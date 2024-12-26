export const generateInvoiceNumber = () => {
  // Get the current date in YYYYMMDD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 0-11, so we add 1
  const day = String(today.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Simulate a random sequence number (use this or a backend API for the actual sequence)
  const sequenceNumber = Math.floor(Math.random() * 1000000); // Random number for demo, replace with backend logic

  // Generate the invoice number as "INV-YYYYMMDD-XXXX"
  const invoiceNumber = `INV-${datePart}-${String(sequenceNumber).padStart(4, '0')}`;

  return invoiceNumber;
};