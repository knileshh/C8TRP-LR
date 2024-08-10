require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

  const inspectionSchema = new mongoose.Schema({
    header: {
      truckSerialNumber: String,
      truckModel: String,
    //   inspectorName: String,
    //   inspectionEmployeeID: String,
    //   dateTimeOfInspection: String,
    //   locationOfInspection: String,
    //   serviceMeterHours: String,
    //   customerName: String,
    //   catCustomerID: String,
    },
    tires: {
      leftFrontPressure: String,
      rightFrontPressure: String,
    //   leftRearPressure: String,
    //   rightRearPressure: String,
    //   leftFrontTreadDepth: String,
    //   rightFrontTreadDepth: String,
    //   leftRearTreadDepth: String,
    //   rightRearTreadDepth: String,
    }
  }, { strict: false }); //imp line for save
  
  const Inspection = mongoose.model('Inspection', inspectionSchema);


//Just the test schema don't worry
const testSchema = new mongoose.Schema({
  name: String,
  age: Number,
  // Add more fields as needed
}, { collection: 'test' });

const Test = mongoose.model('Test', testSchema);


//Just the db test point(dev)
app.post('/add-test', async (req, res) => {
    try {
      const newTest = new Test({
        name: 'Example Name',
        age: 25,
        // Add more fields as needed
      });
  
      await newTest.save();
      res.status(201).json({ message: 'Document added successfully', document: newTest });
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(500).json({ message: 'Error adding document', error: error.message });
    }
  });
  
  app.post('/api/submit-inspection', async (req, res) => {
    try {
      const inspectionData = req.body;
      const newInspection = new Inspection(inspectionData);
      await newInspection.save();
      res.status(201).json({ message: 'Inspection data added successfully', document: newInspection });
    } catch (error) {
      console.error('Error adding inspection data:', error);
      res.status(500).json({ message: 'Error adding inspection data', error: error.message });
    }
  });

  //actual end points
app.get('/', (req, res) => {
  res.send('Welcome to the dark side');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});