// Genereer en beheer unieke apparaat-ID voor gebruikersidentificatie zonder authenticatie

const STORAGE_KEY = 'boodschappenlijst_device_uid';

export const getDeviceUID = () => {
  let deviceUID = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceUID) {
    deviceUID = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, deviceUID);
  }
  
  return deviceUID;
};

export const resetDeviceUID = () => {
  const newUID = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newUID);
  return newUID;
};