// Genereer en beheer unieke apparaat-ID met koppelingsfunctionaliteit
import { secureStorage } from './secureStorage.js';

const STORAGE_KEY = 'boodschappenlijst_device_uid';
const MASTER_DEVICE_KEY = 'boodschappenlijst_master_device';

export const getDeviceUID = () => {
  // Controleer eerst of dit apparaat is gekoppeld aan een master device
  const masterDeviceUID = secureStorage.getItem(MASTER_DEVICE_KEY);
  if (masterDeviceUID) {
    return masterDeviceUID;
  }

  // Anders gebruik het eigen device ID
  let deviceUID = secureStorage.getItem(STORAGE_KEY);
  
  if (!deviceUID) {
    deviceUID = crypto.randomUUID();
    secureStorage.setItem(STORAGE_KEY, deviceUID);
  }
  
  return deviceUID;
};

export const linkToMasterDevice = (masterDeviceUID) => {
  secureStorage.setItem(MASTER_DEVICE_KEY, masterDeviceUID);
  return masterDeviceUID;
};

export const unlinkFromMasterDevice = () => {
  secureStorage.removeItem(MASTER_DEVICE_KEY);
};

export const isLinkedToMaster = () => {
  return !!secureStorage.getItem(MASTER_DEVICE_KEY);
};

export const getDeviceInfo = () => {
  const deviceUID = getDeviceUID();
  return {
    deviceId: deviceUID,
    browser: navigator.userAgent.split(' ')[0],
    platform: 'unknown',
    language: navigator.language,
    isMaster: !isLinkedToMaster(),
    masterDevice: isLinkedToMaster() ? secureStorage.getItem(MASTER_DEVICE_KEY) : null
  };
};

// Genereer een koppelingscode
export const generateLinkCode = () => {
  const deviceUID = getDeviceUID();
  return `${deviceUID}-${Date.now()}`;
};

// Parse een koppelingscode
export const parseLinkCode = (code) => {
  try {
    return code.split('-')[0];
  } catch {
    return null;
  }
};