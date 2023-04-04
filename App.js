const express = require('express');
const app = express();
const adodb = require('node-adodb');
const connection = adodb.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\\Users\\splat\\OneDrive\\Documents\\clocks.mdb;');

app.get('/marks', (req, res) => {
    const type = req.query.type || 'wall';
    connection
        .query(`SELECT mark FROM clocks WHERE type='${type}'`)
        .then((data) => {
            res.render('marks', { marks: data, type });
        })
        .catch((error) => {
            console.log(error);
            res.send('Error');
        });
});

app.get('/mechanical-clocks', (req, res) => {
    const maxPrice = req.query.max_price || 25000;
    connection
        .query(`SELECT * FROM clocks WHERE price <= ${maxPrice}`)
        .then((data) => {
            res.render('mechanical-clocks.ejs', { maxPrice: maxPrice, clock: data });
        })
        .catch((error) => {
            console.log(error);
            res.send('Error');
        });
});


app.get('/clocks', (req, res) => {
    const country = req.query.country || '';
    const query = `SELECT mark FROM clocks WHERE id_developer IN (SELECT id_developer FROM developers WHERE country ='${country}')`;
    connection
        .query(query)
        .then((results) => {
            res.render('clocks', { results: results, country });
        })
        .catch((error) => {
            console.log(error);
            res.send('Error retrieving clocks data');
        });
});

app.get('/manufacturers', (req, res) => {
    const maxSum = req.query.maxSum || 0;
    const query = `
    SELECT d.name
    FROM clocks c
    INNER JOIN developers d ON c.id_developer = d.id_developer
    GROUP BY d.name
    HAVING SUM(c.price * c.count) <= ${maxSum}
  `;

    connection.query(query)
        .then(data => {
            res.render('manufacturers', { manufacturers: data });
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
});


app.set('view engine', 'ejs');
app.set('views', './views');
app.listen(4000, () => {
    console.log('Server started');
});
