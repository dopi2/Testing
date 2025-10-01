declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.VerifyOptions
  ): JwtPayload;

  export function decode(
    token: string,
    options?: jwt.DecodeOptions
  ): JwtPayload | string | null;
}

// Named export to avoid anonymous default export
export { };