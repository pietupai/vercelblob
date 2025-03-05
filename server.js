const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');  // Lisää tämä

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  console.log('File received:', file);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(file.path), file.originalname);

    const response = await axios.post('https://your-vercel-api-endpoint/upload', form, {
      headers: form.getHeaders()
    });

    res.json({ url: response.data.url, blobId: response.data.blobId });
  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
