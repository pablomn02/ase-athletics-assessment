const path = require('path');

// Cargar variables de entorno antes de que los módulos usen la BD
require('dotenv').config({ path: path.join(__dirname, '.env') });
