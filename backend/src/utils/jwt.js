const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('./../config/db')

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null)
    return res.status(401).send('Please login again');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).send('Please login again');
    const sql = `SELECT email, admin FROM users WHERE email = ? `;
    db.query(sql, user.email, (error, results, fields) => {
      if (error)
        res.status(500).json({ status: 'error', message: 'Some error occured' });
      if (results.length === 0)
        return res.status(403).json({ status: 'error', message: 'Please login to access the resource' })
      req.user = {
        email: results[0].email,
        admin: results[0].admin
      };
      next();
    });
  });
}

module.exports = verifyToken