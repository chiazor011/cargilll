import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  tier: number;
  kyc_status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
