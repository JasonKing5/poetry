import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  roles: string[];
  exp: number;
  iat: number;
}

export function decodeJwt(token: string): DecodedToken {
  return jwtDecode<DecodedToken>(token);
}