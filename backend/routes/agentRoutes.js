import express from 'express';
import { chatWithAgent, getTodos, getMemoryEndpoint } from '../controllers/agentController.js';

const router = express.Router();

router.post('/chat', chatWithAgent);
router.get('/todos', getTodos);
router.get('/memory', getMemoryEndpoint);

export default router;
