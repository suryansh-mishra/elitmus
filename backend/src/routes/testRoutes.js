const express = require('express')
const router = express.Router();
const verifyToken = require('./../utils/jwt')
const db = require('./../config/db')

router.route('/').
  get(verifyToken, (req, res) => {
    const email = req.user.email;
    const isAdmin = req.user.admin;
    if (isAdmin) {
      const sql = `
      SELECT *
      FROM tests
    `;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        res.status(200).json({ status: 'success', data: results });
      });
    }
    else {
      const sql = `
      SELECT *
      FROM tests
      WHERE email = ?
    `;
      db.query(sql, email, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        } else if (results.length === 0) {
          res.status(404).json({ status: 'error', message: 'No tests taken' });
        } else {
          res.status(200).json({ status: 'success', message: results[0] });
        }
      });
    } //// PATCH ----> 
  }).patch(verifyToken, (req, res) => {

    const { test } = req.body;
    const { email } = req.user;

    db.query('SELECT * FROM tests WHERE email = ?', email, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          if (Date.now() < (results[0].start_time.getTime() + 2 * 60 * 60 * 1000)) {
            const { L1, L2, L3, L4, L5, L6 } = { ...results[0], ...test };
            const end_time = new Date();
            const previous_scores = results[0].previous_scores;
            db.query('UPDATE tests SET L1 = ?, L2 = ?, L3 = ?, L4 = ?, L5 = ?, L6 = ?, end_time = ? WHERE email = ?', [L1, L2, L3, L4, L5, L6, end_time, email], (error, results) => {
              if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal Server Error' });
              } else {
                res.status(200).json({ status: 'success', message: 'Test data updated successfully.' });
              }
            });
          }
          else {
            res.status(200).json({ status: 'error', message: 'This test already ended, kindly start a new test' });
          }
        } else {
          const { L1, L2, L3, L4, L5, L6 } = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0, ...test };
          const previous_scores = []
          const previous_times = []
          const start_time = new Date();
          db.query('INSERT tests (email, L1, L2, L3, L4, L5, L6, previous_scores, start_time, end_time, previous_times) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)', [email, L1, L2, L3, L4, L5, L6, JSON.stringify(previous_scores), start_time, start_time, JSON.stringify(previous_times)], (error, results) => {
            if (error) {
              console.error(error);
              res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            } else
              res.status(200).json({ status: 'success', message: 'Test data inserted successfully' });

          });
        }
      }
    });
  });


router.route('/reset').post(verifyToken, (req, res) => {
  const email = req.user.email;

  db.query('SELECT * FROM tests WHERE email = ?', email, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    } else if (results.length === 0) {
      res.status(404).json({ status: 'error', message: 'Test data not found' });
    } else {
      const test = results[0];
      const previous_scores = JSON.parse(test.previous_scores || '[]');
      const previous_times = JSON.parse(test.previous_times || '[]');
      const current_score = test.current_score;
      const start_time = new Date();
      previous_scores.push(current_score);
      previous_times.push(((results[0].end_time ? results[0].end_time.getTime() : new Date(results[0].start_time.getTime() + 2 * 60 * 60 * 1000)) - results[0].start_time.getTime()) / 1000);

      db.query('UPDATE tests SET L1 = ?, L2 = ?, L3 = ?, L4 = ?, L5 = ?, L6 = ?, previous_scores = ?, start_time = ?, end_time = ?, previous_times = ? WHERE email = ?', [0, 0, 0, 0, 0, 0, JSON.stringify(previous_scores), start_time, null, JSON.stringify(previous_times), email], (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        } else
          res.status(200).json({ status: 'success', message: 'Test data reset successfully' });
      });
    }
  });
});


module.exports = router;