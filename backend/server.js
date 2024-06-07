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

app.use(express.json());

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Function to clear the upload directory
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

// Clear the upload directory
clearUploadDir();

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

app.post('/createTable', (req, res) => {
  const { animationName } = req.body;
  const sql = `CREATE TABLE ?? (id INT AUTO_INCREMENT PRIMARY KEY, frame LONGBLOB)`;
  con.query(sql, [animationName], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error creating table.');
    }
    res.send({ message: 'Table created successfully' });
  });
});

app.post('/uploadFrame', upload.single('file'), (req, res) => {
  const file = req.file;
  const { animationName } = req.body;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  fs.readFile(file.path, (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    const sql = 'INSERT INTO ?? (frame) VALUES (?)';
    const values = [animationName, data];

    con.query(sql, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error saving to the database.');
      }
      res.send({ message: 'Frame uploaded and saved to database', id: result.insertId });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
