import { formatCurrency } from "./currency";

export const htmlPdfInvoice = (data: any): string => {
  const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #<span class="math-inline">${data.invoice.invoice}</title\>
<style\>
body \{
font\-family\: sans\-serif;
margin\: 20px;
\}
h1 \{
text\-align\: center;
font\-size\: 24px;
margin\-bottom\: 20px;
\}
table \{
width\: 100%;
border\-collapse\: collapse;
\}
th, td \{
padding\: 10px;
border\: 1px solid \#ddd;
\}
</style\>
</head\>
<body\>
<h1\>Invoice \#</span>${data.invoice.invoice}</h1>
          <div>
            <p><b>Customer:</b> ${data.customerName}</p>
            <p><b>Address:</b> ${data.customerAddress}</p>
            <p><b>Status:</b> ${data.invoice.status}</p>
          </div>
          <table cellspacing="0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(
                (item: { name: string, quantity: string, price: string}) => `<tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(parseInt(item.price))}</td>
                </tr>`
              )}
            </tbody>
          </table>
          <div>
            <p><b>Total:</b> ${formatCurrency(data.totalAmount)}</p>
          </div>
        </body>
      </html>
    `;
    
  return htmlString;
}