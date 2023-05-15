const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/testRoutes.js')
const userRoutes = require('./routes/userRoutes.js');
const testRoutes = require('./routes/testRoutes.js')
// CONSTANTS
const PORT = 3000;

// APP INIT
const app = express();
app.use(express.json());
app.use(helmet())
app.use(cors({
  origin: '*'
}));
app.use('/api', routes);
app.use('/users', userRoutes)
app.use('/tests', testRoutes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;