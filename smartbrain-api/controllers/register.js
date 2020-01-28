
const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json('Incorrect form submition');
    }

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
  }

  module.exports = {
      handleRegister: handleRegister
  }