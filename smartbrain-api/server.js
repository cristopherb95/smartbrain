const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: process.env.USERNAME,
    password: '',
    database: process.env.DATABASE
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// app.get('/', (req, res) => {
//   return res.send('');
// })

app.post('/signin', (req, res) => {
  signin.handleSignIn(req, res, db, bcrypt);
})

app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
})

// Update user to increment entries count
app.put('/image', (req, res) => {
  image.handleImage(req, res, db);
})

app.post('/imageurl', (req, res) => {
  image.handleApiCall(req, res);
})

// Unused; For future development
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({
    id: id
  })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('error getting user');
      }
    });
});

app.listen((process.env.PORT || 4000), () => {
  console.log('Server has started!');
});

