import { log } from './utility';

export const appConfig: { [key: string]: any } = {};

export const getConfig = async () => {
  log('Getting config');
  const config = await chrome.storage.sync.get(['furigana', 'targetLanguage']);
  
  appConfig['furiganaType'] = config.furigana || 'none';
  appConfig['targetLanguage'] = config.targetLanguage || 'JA';
  
  log('Got config:', appConfig);
  

}