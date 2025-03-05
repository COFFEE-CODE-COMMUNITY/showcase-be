import { Router } from 'express';
import { loginAdmin, registerAdmin } from "../../controllers/auth-controller"

const authRouteV1 = Router();

authRouteV1.post('/admin/register', registerAdmin)
authRouteV1.post('/admin/login', loginAdmin)

export default authRouteV1