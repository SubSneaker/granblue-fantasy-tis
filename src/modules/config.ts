import { log } from './utility';

export const appConfig: { [key: string]: any } = {};

export const getConfig = async () => {
  log('Getting config');
  const config = await chrome.storage.sync.get(['furigana']);
  
  appConfig['furiganaType'] = config.furigana || 'none';
  
  log('Got config:', appConfig);
  

}