import { SetMetadata } from '@nestjs/common';

export const IS_OWNER_KEY = 'isOwner';
export const IsOwner = (type: 'post' | 'comment' | 'user') =>
  SetMetadata(IS_OWNER_KEY, type);
