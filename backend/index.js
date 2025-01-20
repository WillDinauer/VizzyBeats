const express = require('express');
const vision = require('@google-cloud/vision');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = 4000;

// Configure Multer for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Vision API client
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// GET endpoint to process an uploaded image
app.post('/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Process image using Google's Vision API
        const [result] = await client.labelDetection(req.file.buffer);
        const labels = result.labelAnnotations;

        // Extract the top 3 labels
        const topLabels = labels
            .slice(0, 3)
            .map(label => ({ description: label.description, score: label.score }));

        res.json({ labels: topLabels });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});