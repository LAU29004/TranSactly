import EncryptedStorage from 'react-native-encrypted-storage';

const TOKEN_KEY = 'jwt_token';

export const saveToken = async (
  token: string,
) => {
  try {

    await EncryptedStorage.setItem(
      TOKEN_KEY,
      token,
    );

  } catch (error) {

    console.log(
      'TOKEN SAVE ERROR:',
      error,
    );
  }
};

export const getToken = async () => {
  try {

    return await EncryptedStorage.getItem(
      TOKEN_KEY,
    );

  } catch (error) {

    console.log(
      'TOKEN READ ERROR:',
      error,
    );

    return null;
  }
};

export const clearToken = async () => {
  try {

    await EncryptedStorage.removeItem(
      TOKEN_KEY,
    );

  } catch (error) {

    console.log(
      'TOKEN DELETE ERROR:',
      error,
    );
  }
};