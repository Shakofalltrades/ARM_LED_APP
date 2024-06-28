import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
const port = 5001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET']
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const clearUploadDir = () => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(uploadDir, file), err => {
        if (err) throw err;
      });
    }
  });
};

clearUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const con = mysql.createConnection({
  host: 'arm.cvcoiqug200c.us-east-1.rds.amazonaws.com',
  user: 'imperial',
  password: 'armled24',
  database: 'animations'
});

con.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL animations database');
});

let latestAnimationName = ''; // Variable to store the latest animation name

app.post('/upload', (req, res) => {
  const animationData = req.body;

  if (!animationData.name || !animationData.images || !animationData.fps) {
    return res.status(400).send('Invalid animation data.');
  }

  const filePath = path.join(uploadDir, `${animationData.name}.json`);
  fs.writeFile(filePath, JSON.stringify(animationData, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Error saving animation data.');
    }
    latestAnimationName = animationData.name; // Update the latest animation name
    res.send({ message: 'Animation data uploaded successfully' });
  });
});

// New endpoint to handle GET requests for the latest JSON animation data
app.get('/latest-animation', (req, res) => {
  if (!latestAnimationName) {
    return res.status(404).send('No animation data available.');
  }
  const filePath = path.join(uploadDir, `${latestAnimationName}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Animation not found.');
      }
      return res.status(500).send('Error reading animation data.');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
