const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const pg = require('pg');
const bodyParser = require('body-parser');
const connectionString = 'postgres://postgres:Abkmrby1@localhost/node_hero';
const pool = new pg.Pool({
    connectionString,
});

const app = express();
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
// app.use(app.router);

app.get('/', (request, response) => {
    response.render('home', {
        name: 'John'
    })
});

app.post('/users', function (req, res, next) {
    const user = req.body;
    pool.connect(function (err, client, done) {
        if (err) {
            // Передача ошибки в обработчик express
            return next(err)
        }
        client.query('INSERT INTO users (name, age) VALUES ($1, $2);', [user.name, user.age], function (err, result) {
            done(); // Этот коллбек сигнализирует драйверу pg, что соединение может быть закрыто или возвращено в пул соединений
            if (err) {
                // Передача ошибки в обработчик express
                return next(err)
            }
            res.sendStatus(200)
        })
    })
});

app.get('/users', function (req, res, next) {
    pool.connect(function (err, client, done) {
        if (err) {
            // Передача ошибки в обработчик express
            return next(err)
        }
        client.query('SELECT name, age FROM users;', [], function (err, result) {
            done();
            if (err) {
                // Передача ошибки в обработчик express
                return next(err)
            }
            res.json(result.rows)
        })
    })
});


app.listen(3000);
