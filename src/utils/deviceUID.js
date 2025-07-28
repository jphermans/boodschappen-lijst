// Genereer en beheer unieke apparaat-ID voor gebruikersidentificatie zonder authenticatie
// Opmerking: Dit is browser-specifiek en werkt niet over browsers heen op hetzelfde apparaat

const STORAGE_KEY = 'boodschappenlijst_device_uid';

export const getDeviceUID = () => {
  let deviceUID = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceUID) {
    // Genereer een consistente ID binnen deze browser
    
    deviceUID = crypto.randomUUID(); // Eenvoudige UUID voor nu
    localStorage.setItem(STORAGE_KEY, deviceUID);
  }
  
  return deviceUID;
};

export const resetDeviceUID = () => {
  const newUID = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newUID);
  return newUID;
};

export const getDeviceInfo = () => {
  return {
    deviceId: getDeviceUID(),
    browser: navigator.userAgent.split(' ')[0],
    platform: navigator.platform,
    language: navigator.language
  };
};