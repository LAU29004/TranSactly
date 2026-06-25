import EncryptedStorage from 'react-native-encrypted-storage';

export const secureSet = async (
  key: string,
  value: any,
) => {

  await EncryptedStorage.setItem(
    key,
    JSON.stringify(value),
  );
};

export const secureGet = async (
  key: string,
) => {

  const data =
    await EncryptedStorage.getItem(
      key,
    );

  return data
    ? JSON.parse(data)
    : null;
};

export const secureRemove = async (
  key: string,
) => {

  await EncryptedStorage.removeItem(
    key,
  );
};