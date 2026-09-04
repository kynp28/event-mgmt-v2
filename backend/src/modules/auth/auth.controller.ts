import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.validator';

// Controller Layer: รับผิดชอบแค่แปลง HTTP request -> เรียก service -> ส่ง HTTP response
// ไม่มี business logic หรือ database query อยู่ในชั้นนี้เลย
export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  private setTokenCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;
    const result = await this.authService.register(input);
    this.setTokenCookie(res, result.token);
    res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ', data: result });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;
    const result = await this.authService.login(input);
    this.setTokenCookie(res, result.token);
    res.status(200).json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', data: result });
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await this.authService.getMe(userId);
    res.status(200).json({ success: true, data: result });
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await this.authService.updateProfile(userId, req.body);
    this.setTokenCookie(res, result.token);
    res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', data: result });
  };

  submitAppeal = async (req: Request, res: Response): Promise<void> => {
    const { email, reason } = req.body;
    const evidenceUrl = req.file ? `/uploads/appeals/${req.file.filename}` : undefined;
    await this.authService.submitAppeal(email, reason, evidenceUrl);
    res.status(201).json({ success: true, message: 'If the account is eligible, the appeal has been submitted.' });
  };
}