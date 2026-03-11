const express = require('express');
const { getTickets, postTicket, patchTicketStatus, getDashboardStats } = require('../controllers/ticketsController');
const { upload } = require('../config/multer');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/tickets', getTickets);
router.post('/tickets', upload.single('photo'), postTicket);
router.patch('/tickets/:id', patchTicketStatus);

module.exports = router;
