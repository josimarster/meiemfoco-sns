// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Inicializa o app Express
const app = express();

// Configurações de middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota de teste simples
app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Aqui você adicionará mais rotas posteriormente

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!', error: err.message });
});

module.exports = app;

// Importar rotas
//const bodyParser = require('body-parser');
const snsNotificationRoutes = require('./routes/snsNotificationRoutes');

// Primeiro aplica o parser só nessa rota
app.use('/api/sns-notification', bodyParser.text({ type: 'text/plain' }));

// Depois conecta a rota que processa os dados
app.use('/api/sns-notification', snsNotificationRoutes);

// Depois o resto
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));