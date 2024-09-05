import express from 'express';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import util from 'util';
import { fileURLToPath } from 'url';
import fs from 'fs';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

const dbQuery = util.promisify(db.query).bind(db);

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/contact', (req, res) => {
    res.render('contact');
});
app.get('/services', (req, res) => {
    res.render('services');
});
app.get('/our_packages', (req, res) => {
    res.render('our_packages');
});
app.get('/purchase', (req, res) => {
    res.render('purchase');
});
app.get('/teaminfo', (req, res) => {
    res.render('teaminfo');
});
app.get('/testimonials', (req, res) => {
    res.render('testimonials');
});
app.get('/thankyou', (req, res) => {
    res.render('thankyou');
});
app.get('/venu_page', (req, res) => {
    res.render('venu_page');
});
app.get('/filter', (req, res) => {
    res.render('filter');
});

app.post('/filter', async (req, res) => {
    const { type, budget, decoration } = req.body;
    try {
        const result = await dbQuery(
            'SELECT folder_path FROM eventfolders WHERE type = $1 AND budget = $2 AND decoration = $3',
            [type, budget, decoration]
        );
        const folderPath = result.rows[0]?.folder_path;
        if (!folderPath) {
            return res.render('result', { imagePaths: [] });
        }
        const absoluteFolderPath = path.join(__dirname, 'public', folderPath);
        fs.readdir(absoluteFolderPath, (err, files) => {
            if (err) {
                console.error(err);
                res.send('Error retrieving images');
            } else {
                const imagePaths = files.map(file => path.join(folderPath, file));
                res.render('result', { imagePaths });
            }
        });
    } catch (err) {
        console.error(err);
        res.send('Error retrieving images');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

