require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function createPDFFromMongoDB() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('catDB'); // Assuming your database name is catDB
    const collection = database.collection('inspections'); // Assuming your collection name is inspections
    
    const objectId = new ObjectId('66b6dd6d03178c1a381d0b0b');
    const document = await collection.findOne({ _id: objectId });
    
    if (document) {
      console.log('Found document:', JSON.stringify(document, null, 2));
      
      // Create PDF
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream('inspection_report.pdf');
      doc.pipe(writeStream);
      
      // Add content to PDF
      doc.fontSize(18).text('Inspection Report', { align: 'center' });
      doc.moveDown();
      
      // Header section
      doc.fontSize(14).text('Header Information');
      doc.fontSize(12);
      for (const [key, value] of Object.entries(document.header)) {
        doc.text(`${key}: ${value}`);
      }
      doc.moveDown();
      
      // Tires section
      doc.fontSize(14).text('Tire Information');
      doc.fontSize(12);
      for (const [key, value] of Object.entries(document.tires)) {
        doc.text(`${key}: ${value}`);
      }
      
      doc.end();
      
      console.log('PDF generated successfully: inspection_report.pdf');
    } else {
      console.log('No document found with the given ObjectId');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createPDFFromMongoDB().catch(console.error);