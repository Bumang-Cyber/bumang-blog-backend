import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/users/const/roles.const';

export const ROLES_KEY = 'roles';
// 데코레이터
export const Roles = (...roles: RolesEnum[]) => SetMetadata(ROLES_KEY, roles);
