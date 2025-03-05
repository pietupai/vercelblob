const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN);

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  console.log('File received:', file);

  try {
    const filePath = file.path;
    const fileContent = fs.readFileSync(filePath);
    const response = await put(file.originalname, fileContent, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN // Käytä ympäristömuuttujaa
    });

    // Poista väliaikainen tiedosto
    fs.unlinkSync(filePath);

    res.json({ url: response.url, blobId: response.blobId });
  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
