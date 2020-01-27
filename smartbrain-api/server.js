const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors');
const knex = require('knex');

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

app.get('/', (req, res) => {
  return res.send('');
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db.select('email', 'hash').from('login').where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users').where('email', '=', email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get user'))
      } else {
        return res.status(400).json('Wrong credentials');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx.insert({
      email: email,
      name: name,
      joined: new Date()
    }).into('users')
      .returning('*')
      .then(user => {
        res.json(user[0]);
        return trx('login')
          .returning('*')
          .insert({
            hash: hash,
            email: user[0].email
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register'))
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

// Update user to increment entries count
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('Unable to change entries'))
})

app.listen(4000, () => {
  console.log('Server has started on port 4000!');
});

