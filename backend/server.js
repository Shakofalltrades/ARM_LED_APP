const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

//file upload using multer
const storage = multer.memoryStorage();
const upload = multer({storage: storage });

//MYsql connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'armled',
    database: 'animations'
})

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL animations database');
})

app.post('/upload', upload.single('file'), (req,res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const sql = 'INSERT INTO images (name,data) VALUES (?, ?)';
    const values = [file.originalname, file.buffer];

    connection.query(sql, values, (err, result) => {
        if (err) throw err;
        res.send({message: 'File uploaded and saved to database', id: result.insertId});
    });
});

app.listen(port, () => {
    console.log('Server running on http://localhost:${port}');
});

