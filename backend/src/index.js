const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`API escuchando en ${HOST}:${PORT}`);
});
