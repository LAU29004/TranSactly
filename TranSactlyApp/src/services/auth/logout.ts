import GoogleSignin from './googleAuth';

import { clearToken } from './authStorage';
import { clearUser } from './userStorage';

export const logout = async () => {

  try {
    await GoogleSignin.signOut();
  } catch {}

  await clearToken();
  await clearUser();
};