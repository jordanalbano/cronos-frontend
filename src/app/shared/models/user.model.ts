import { Role } from './roles.enum';

// This interface is now the single source of truth for a user object.
export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}
