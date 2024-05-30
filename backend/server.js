import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
const port = 5000;

app.use(cors());

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//file upload using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });

//MYsql connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'armled',
    database: 'animations'
})

con.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL animations database');

})

app.post('/upload', upload.single('file'), (req,res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const sql = 'INSERT INTO test (id,frames) VALUES (?, ?)';
    const values = [file.originalname, file.buffer];

    con.query(sql, values, (err, result) => {
        if (err) throw err;
        res.send({message: 'File uploaded and saved to database', id: result.insertId});
    });
});

app.listen(port, () => {
    console.log('Server running on http://localhost:${port}');
});

