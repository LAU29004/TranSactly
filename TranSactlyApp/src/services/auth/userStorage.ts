import EncryptedStorage from 'react-native-encrypted-storage';

const USER_KEY = 'user_profile';

export const saveUser = async (user: any) => {
  await EncryptedStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
};

export const getUser = async () => {
  const data = await EncryptedStorage.getItem(
    USER_KEY,
  );

  return data
    ? JSON.parse(data)
    : null;
};

export const clearUser = async () => {
  await EncryptedStorage.removeItem(
    USER_KEY,
  );
};