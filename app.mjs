// app.mjs
import express from 'express';
export let server = null;
export const app = express();
import fs from 'fs';
import { query } from './query.mjs';
import { randomUUID } from 'crypto';

let queries = [];

fs.readFile('code-samples/question-bank.json', 'utf8', (err, data) => {
    if (err) {
        console.log('READ FAILED:', err.message);
        return;
    }
    let ques = JSON.parse(data);
    for (const question of ques) {
        let id = randomUUID()
        let q = new query(id, question.question, question.genre, question.answers)
        queries.push(q);
    }
    console.log(queries);
    server = app.listen(3000, '127.0.0.1');
    console.log("Server started, type ctrl+C to shut down!");
});



// Implement the decorate function
export const decorate = (answer, correct) => {
    return ""
}
// <a href="https://www.flaticon.com/free-icons/trivia" title="trivia icons">Trivia icons created by jenz1 - Flaticon</a>
// Continue with the rest of the code

function custom_middleware(req, res, next) {
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Query String", req.url);
    return next();
}

app.use(express.static('public')); // serve static files
app.set('view engine', 'hbs');  // use handlebars for templating
app.use(custom_middleware);
app.use(express.urlencoded());




app.get('/', (req, res) => {
    res.redirect('/quiz');
});

app.get('/quiz', (req, res) => {
    res.render('quiz', { question: 'What is 2 + 2?' });
});
app.get('/questions', (req, res) => {
    const keyword = (req.query.keyword || '').trim().toLowerCase();
    let results = questions;
    if (keyword) {
        results = questions.filter(q =>
            q.question.toLowerCase().includes(keyword) ||
            q.genre.toLowerCase().includes(keyword) ||
            q.answers.some(a => a.toLowerCase().includes(keyword))
        );
    }
    console.log('keyword:', keyword, '-> matches:', results.length);
    res.render('questions', { questions: results, keyword: req.query.keyword });
});

