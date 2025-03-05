const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname)));

// Testisivu
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.send('<h1>Testisivu</h1><p>Palvelin toimii oikein</p>');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  console.log('File received:', file);

  try {
    // Log file details and environment variables
    console.log('File details:', {
      originalname: file.originalname,
      path: file.path,
      size: file.size
    });
    console.log('Environment Variable BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN);
    console.log('Token (inside try block):', process.env.BLOB_READ_WRITE_TOKEN);

    const filePath = file.path;
    const fileContent = fs.readFileSync(filePath);
    console.log('File content read successfully');

    const response = await put(file.originalname, fileContent, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log('Blob upload response:', response);

    // Poista väliaikainen tiedosto
    fs.unlinkSync(filePath);
    console.log('Temporary file deleted');

    res.json({ url: response.url, blobId: response.blobId });
  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(500).json({ error: error.message, details: error });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
