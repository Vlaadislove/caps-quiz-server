import { login, logout, me, refresh } from '../controllers/auth';
import { validateUser } from './../middlewares/middlewares';
import { Router } from "express";


const router = Router()


// https://localhost:5000/api/auth
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', validateUser, logout)
router.get('/me', validateUser, me)


export default router