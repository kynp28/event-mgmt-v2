import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.validator';

// Controller Layer: รับผิดชอบแค่แปลง HTTP request -> เรียก service -> ส่ง HTTP response
// ไม่มี business logic หรือ database query อยู่ในชั้นนี้เลย
export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;
    const result = await this.authService.register(input);
    res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ', data: result });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;
    const result = await this.authService.login(input);
    res.status(200).json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', data: result });
  };
}