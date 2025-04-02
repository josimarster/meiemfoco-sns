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

router.post('/', async (req, res) => {
    try {
      // Parse manual se veio como string
      let data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  
      console.log('📥 Recebido do SNS:', data);
  
      if (data.Type === 'SubscriptionConfirmation') {
        const axios = require('axios');
        await axios.get(data.SubscribeURL);
        console.log('✅ Assinatura confirmada.');
        return res.status(200).json({ message: 'Assinatura confirmada' });
      }
  
      if (data.Type === 'Notification') {
        const message = JSON.parse(data.Message);
  
        const newSnsNotification = await prisma.snsNotification.create({
          data: {
            status: message.eventType,
            data: new Date(message.click?.timestamp || new Date()),
            email_destination: message.mail.destination[0],
            email_from: message.mail.source,
            subject: message.mail.commonHeaders.subject,
            messageId: message.messageId
          }
        });
  
        return res.status(201).json(newSnsNotification);
      }
  
      return res.status(200).json({ message: 'Outro tipo de mensagem SNS' });
    } catch (error) {
      console.error('❌ Erro ao processar SNS:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  module.exports = router;