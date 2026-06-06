import { UserRoleCode } from '@prisma/client';

export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRoleCode;
};
