const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5009; // Port for the backend server

app.use(cors());
app.use(bodyParser.json());

// Ensure the 'bookings' directory exists
const bookingsDir = path.join(__dirname, 'bookings');
if (!fs.existsSync(bookingsDir)) {
  fs.mkdirSync(bookingsDir);
}

// Endpoint to handle booking requests
app.post('/api/bookings', (req, res) => {
  const { name, mobile, pickupAddress, optionalAddress, dropoffAddress, date, price } = req.body;

  // Log the booking details (In a real application, save this to a database)
  console.log('Booking received:', { name, mobile, pickupAddress, optionalAddress, dropoffAddress, date, price });

  // Generate PDF
  const doc = new PDFDocument();
  const filePath = path.join(bookingsDir, `${Date.now()}.pdf`);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(25).text('Taxi Booking Confirmation', {
    align: 'center'
  });

  doc.fontSize(16).text(`Name: ${name}`);
  doc.text(`Mobile: ${mobile}`);
  doc.text(`Pickup Address: ${pickupAddress}`);

  if (optionalAddress) {
    doc.text(`Optional Stop: ${optionalAddress}`); // Include optional destination if provided
  }

  doc.text(`Dropoff Address: ${dropoffAddress}`);
  doc.text(`Date and Time: ${date}`);
  doc.text(`Price: ${price} SEK`);

  doc.end();

  res.json({ message: 'Booking confirmed', data: req.body, pdfPath: filePath });
});

// Endpoint to serve the PDF file
app.get('/api/bookings/pdf/:filename', (req, res) => {
  const filePath = path.join(bookingsDir, req.params.filename);
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
