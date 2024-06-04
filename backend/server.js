import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST']
}));

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// MySQL connection
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'armled',
  database: 'animations'
});

con.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL animations database');
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }


  // Read the file from the filesystem
  fs.readFile(file.path, (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    const sql = 'INSERT INTO test (frame) VALUES (?)';
    const values = [data];

    con.query(sql, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error saving to the database.');
      }
      res.send({ message: 'File uploaded and saved to database', id: result.insertId });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});