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
    const cls = correct ? 'correct-answer' : 'incorrect-answer';
    return `<span class="${cls}">${answer}</span>`;
};
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


app.get('/questions', (req, res) => {
    const answer = (req.query.answer || '').trim().toLowerCase();
    let results = queries;
    console.log("Keyword: ", answer);
    if (answer) {
        results = queries.filter(q =>
            q.question.toLowerCase().includes(answer) ||
            q.genre.toLowerCase().includes(answer) ||
            q.answers.some(a => a.toLowerCase().includes(answer))
        );
    }
    console.log('keyword:', answer, '-> matches:', results.length);
    res.render('questions', { questions: results, answer: req.query.answer });
});

app.post('/questions', (req, res) => {
    console.log(req.body);
    const q = (req.body.newQuestion || '').trim();
    const g = (req.body.newGenre || '').trim();
    const answers = (req.body.newAnswer || '').trim().split(',');
    let quer = new query(randomUUID(), q, g, answers);
    queries.push(quer);
    res.render('questions', {questions: queries})
})

app.get('/quiz', (req, res) => {
    const index = Math.floor(Math.random() * queries.length);
    const randomQuery = queries[index];

    res.render('quiz', {
        question: randomQuery.question,
        id: randomQuery.id
    });
});

app.post('/quiz', (req, res) => {
    const { id, answer } = req.body;
    const current = queries.find(q => q.id === id);

    if (!current) {
        return res.status(404).send('Question not found');
    }

    // split the submitted string and make it not empty
    let given = (answer || '').split(',').map(a => a.trim())
    given = given.filter(a => a !== '');

    //lowercase for comparison
    const actual = current.answers.map(a => a.trim().toLowerCase());
    const givenLower = given.map(a => a.toLowerCase());

    // decorated
    const corrections = [];

    for (const a of given) {
        const isCorrect = actual.includes(a.toLowerCase());
        corrections.push(decorate(a, isCorrect));
    }

    const correctionString = corrections.join(', ');

    // overall status
    const matched = new Set(givenLower.filter(a => actual.includes(a)));
    const noWrongAnswers = givenLower.every(a => actual.includes(a));
    let status;

    if (matched.size === 0) {
        status = 'Incorrect';
    } else if (noWrongAnswers && matched.size === actual.length) {
        status = 'Correct';
    } else {
        status = 'Partially Correct';
    }

    res.render('quiz', {
        question: current.question,
        id: current.id,
        answer: answer,
        corrections: correctionString,
        status: status
    });
});