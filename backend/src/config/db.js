const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path')
const PORT = 3000;

dotenv.config({ path: path.join(__dirname, './../../process.env') });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'elitmus_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL DB - \n', err);
    throw err;
  }
  else
    console.log('Connected to MySQL db 🚀');

});

const createUserTable = `
CREATE TABLE users (
  email VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  admin BOOLEAN DEFAULT FALSE)
`;

const createTestsTable = `
  CREATE TABLE tests(
  email VARCHAR(255) PRIMARY KEY,
  L1 INT NOT NULL CHECK(L1 >= 0) DEFAULT 0,
  L2 INT NOT NULL CHECK(L2 >= 0) DEFAULT 0,
  L3 INT NOT NULL CHECK(L3 >= 0) DEFAULT 0,
  L4 INT NOT NULL CHECK(L4 >= 0) DEFAULT 0,
  L5 INT NOT NULL CHECK(L5 >= 0) DEFAULT 0,
  L6 INT NOT NULL CHECK(L6 >= 0) DEFAULT 0,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  current_score INT GENERATED ALWAYS AS(L1 + L2 + L3 + L4 + L5 + L6) VIRTUAL,
  previous_scores JSON,
  previous_times JSON,
  FOREIGN KEY(email) REFERENCES users(email)
)`;

const emailConstraint = `
  ALTER TABLE users ADD CONSTRAINT check_email_format CHECK(email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
`;

db.query(`SHOW TABLES LIKE 'users'`, (err, results, fields) => {
  if (results.length == 0) {
    db.query(createUserTable, (error, results, fields) => {
      if (error) throw error;
      console.log('Created users table successfully');
    });
    db.query(emailConstraint, (error, results, fields) => {
      if (error) throw error;
      console.log('Check constraint added successfully');
    });
  }
})

db.query(`SHOW TABLES LIKE 'tests'`, (error, results, fields) => {
  if (results.length == 0) {
    console.log('here though');
    db.query(createTestsTable, (error, results, fields) => {
      if (error) throw error;
      console.log('Created tests table successfully');
    })
  }
})

module.exports = db;