declare module 'jsonwebtoken' {
  interface SignOptions {
    expiresIn?: string | number;
    audience?: string | string[];
    issuer?: string;
    subject?: string;
  }

  interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[];
    issuer?: string;
    subject?: string;
  }

  interface JwtPayload {
    [key: string]: any;
    iat?: number;
    exp?: number;
    aud?: string | string[];
    iss?: string;
    sub?: string;
  }

  function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): JwtPayload;

  function decode(
    token: string,
    options?: { complete?: boolean; json?: boolean }
  ): null | JwtPayload;

  export default {
    sign,
    verify,
    decode
  };
}