const express = require('express')
const router = express.Router()
const verifyToken = require('./../utils/jwt.js')
const db = require('./../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

router.route('/').get(verifyToken, (req, res) => {
  const isAdmin = req.user.admin;
  if (isAdmin) {
    db.query('SELECT email FROM users', (err, results, fields) => {
      if (err) throw error;
      res.status(200).json({ status: 'success', data: results });
    });
  }
  else res.status(403).json({ status: 'error', message: 'Unauthorized' })
}).post((req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, Number(process.env.SALT_ROUNDS), (err, hash) => {
    if (err) throw err;
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    let values = [email, hash];
    db.query(sql, values, (err, result) => {
      if (err && err.code === 'ER_DUP_ENTRY')
        return res.status(403).json({ status: 'error', message: 'This user already exists!' });
      else if (err) throw err;
      res.status(201).json({
        status: 'success',
        message: 'User registered'
      })
    });
  });
});

router.route('/login').post((req, res) => {
  const { email, password } = req.body;
  let sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, email, (err, result) => {
    if (err) throw err;
    if (result.length === 0)
      res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    else {
      bcrypt.compare(password, result[0].password, (err, result) => {
        if (err)
          throw err;
        if (result) {
          const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
          res.status(200).json({
            status: 'success', token: token
          });
        }
        else
          res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      });
    }
  });
});

module.exports = router;