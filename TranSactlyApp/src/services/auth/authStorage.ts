import EncryptedStorage from 'react-native-encrypted-storage';

const TOKEN_KEY = 'jwt_token';

export const saveToken = async (
  token: string,
) => {
  await EncryptedStorage.setItem(
    TOKEN_KEY,
    token,
  );
};

export const getToken = async () => {
  return EncryptedStorage.getItem(
    TOKEN_KEY,
  );
};

export const clearToken = async () => {
  await EncryptedStorage.removeItem(
    TOKEN_KEY,
  );
};