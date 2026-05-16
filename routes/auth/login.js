import express from 'express';
import { login } from '../../contollers/login.js';
import { rateLimiter } from '../../middlewares/redis/rateLimiter.js';

const router = express.Router();

router.post("/login", rateLimiter , login ) 

export default router;