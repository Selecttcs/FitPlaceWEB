// Importar las dependencias
require('dotenv').config(); // Cargar las variables de entorno
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

// Crear una instancia de Express
const app = express();

// Middleware
app.use(cors()); // Permite peticiones desde otro origen (como HTML/JS)
app.use(express.json()); // Por si luego quieres recibir JSON

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Conexión a Oracle (una sola vez al iniciar)
let oracleConnection;

async function initializeOracle() {
  try {
    oracleConnection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });
    console.log('Conexión exitosa a Oracle!');
  } catch (err) {
    console.error('Error al conectar a Oracle:', err);
    process.exit(1);
  }
}

// Endpoint raíz para probar conexión
app.get('/', (req, res) => {
  if (oracleConnection) {
    res.send('Conexión a la base de datos Oracle establecida.');
  } else {
    res.send('No se pudo conectar a la base de datos.');
  }
});

// Nuevo endpoint para obtener usuarios
app.get('/api/usuarios', async (req, res) => {
    let connection;
    try {
      connection = await initializeOracle(); // Establecemos la conexión
      console.log('Conexión:', connection); // Log de la conexión para depurar
  
      if (!connection) {
        return res.status(500).json({ error: 'No se pudo establecer la conexión a la base de datos' });
      }
  
      // Realizamos la consulta
      const result = await connection.execute(
        `SELECT * FROM Usuario`, // Verifica si 'Usuario' es la tabla correcta
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('Resultado:', result); // Log para verificar si los resultados se obtienen
  
      res.json(result.rows); // Enviamos los resultados si la consulta es exitosa
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios', message: err.message });
    } finally {
      if (connection) {
        try {
          await connection.close(); // Cerramos la conexión
        } catch (err) {
          console.error('Error al cerrar conexión:', err);
        }
      }
    }
  });
// Iniciar el servidor
app.listen(PORT, async () => {
  await initializeOracle();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});