import DeviceInfo from 'react-native-device-info';

export const getDeviceId = async () => {
  return await DeviceInfo.getUniqueId();
};
