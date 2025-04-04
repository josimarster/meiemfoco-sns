// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os usuários
router.get('/list', async (req, res) => {
  try {
    const notifications = await prisma.snsNotification.findMany();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.snsNotification.findUnique({
      where: { id: Number(id) }
    });
    if (!notification) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma nova sns notification
router.post('/', async (req, res) => {
  try {
    let data;

    // Se o corpo vier como string, parse manual
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }

    console.log('Dados recebidos:', data);

    // agora você pode acessar com segurança:
    const { eventType, click, mail } = data;

    console.log(eventType);

    if ('Type' in req.body) {
      // O SNS envia os dados em um formato específico que precisamos extrair
      const newSubscription = await prisma.subscription.create({
        data: {
          message: JSON.stringify(data)
        }
      });

      res.status(201).json(newSubscription);
    } else {
      
      // O SNS envia os dados em um formato específico que precisamos extrair
      const newSnsNotification = await prisma.snsNotification.create({
        data: {
          status: eventType,
          data: new Date(click.timestamp), // Convertendo o timestamp para um objeto Date
          email_destination: mail.destination[0], // Pegando o primeiro destinatário
          email_from: mail.source,
          subject: mail.commonHeaders.subject
        }
      });
      
      res.status(201).json(newSnsNotification);
    }
  } catch (error) {
    console.error("Erro ao criar sns notificação:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;