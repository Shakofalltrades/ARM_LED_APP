import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
const port = 4000;

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
  host: 'arm.cvcoiqug200c.us-east-1.rds.amazonaws.com',
  user: 'imperial',
  password: 'armled24',
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

app.post('/upload', (req, res) => {
  const animationData = req.body;

  if (!animationData.name || !animationData.images || !animationData.fps) {
    return res.status(400).send('Invalid animation data.');
  }

  const { name, images, fps } = animationData;

  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ?? (id INT AUTO_INCREMENT PRIMARY KEY, frame LONGBLOB, fps INT)`;
  con.query(sqlCreateTable, [name], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error creating table.');
    }

    const sqlInsertFrame = `INSERT INTO ?? (frame, fps) VALUES (?, ?)`;
    images.forEach((image, index) => {
      const imageData = Buffer.from(image, 'base64');
      con.query(sqlInsertFrame, [name, imageData, fps], (err, result) => {
        if (err) {
          console.log(err);
        }
      });
    });

    res.send({ message: 'Animation data uploaded successfully' });
  });
});

app.get('/getFrame', (req, res) => {
  const { animationName, frameId } = req.query;

  if (!animationName || !frameId) {
    return res.status(400).send('Missing animationName or frameId.');
  }

  const sql = 'SELECT frame FROM ?? WHERE id = ?';
  con.query(sql, [animationName, frameId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error retrieving frame from the database.');
    }
    if (result.length === 0) {
      return res.status(404).send('Frame not found.');
    }

    const frame = result[0].frame;
    res.send(frame);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
