export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: 'user' | 'admin';
}

export interface RefreshTokenPayload extends TokenPayload {
  refreshToken: string;
}
