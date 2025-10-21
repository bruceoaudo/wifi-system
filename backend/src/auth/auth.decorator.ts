import { SetMetadata } from '@nestjs/common';

// Key for the authentication metadata.
export const IS_AUTHENTICATED_KEY = 'isAuthenticated';

export const IsAuthenticated = (required: boolean = true) =>
  SetMetadata(IS_AUTHENTICATED_KEY, required);
