export interface TokenPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  userId?: string;
  iat?: number;
  exp?: number;
}