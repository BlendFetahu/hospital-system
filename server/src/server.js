const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'), // look in src/
});


require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`API http://localhost:${PORT}`));
