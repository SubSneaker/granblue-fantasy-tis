import { log } from './utility';
/**
 * Changes the language setting in Granblue Fantasy.
 * @param language The language to set. Defaults to "EN".
 * @returns A Promise that resolves to the result of the request.
 */
export const GBChangeLanguage = (language: string = 'EN') => {
  return GBRequest(
    `https://game.granbluefantasy.jp/setting/save?_=${Date.now()}&t=${Date.now()}`,
    {
      method: 'POST',
      data: {
        special_token: null,
        language_type: language == 'JA' ? '1' : '2',
      },
      headers: {},
    }
  );
};

/**
 * Sends a request to retrieve scene information from the Granblue Fantasy game server.
 * @param sceneType - The type of scene to request information for.
 * @returns A Promise that resolves to the response from the server.
 */
export const GBRequestSceneInfo = async (sceneType: string) => {
  return await GBRequest(
    `https://game.granbluefantasy.jp/quest/scenario/${sceneType}?_=${Date.now()}&t=${Date.now()}`,
    { method: 'GET', data: {}, headers: {} }
  );
};

/**
 * Sends a request to the Granblue servers with the provided options.
 * @param url - The URL to send the request to.
 * @param options - The options for the request, including method, data, and headers.
 * @returns A Promise that resolves to the response text.
 * @throws If there is a network error.
 */
export const GBRequest = async (
  url: string,
  options: { method?: string; data?: any; headers?: any }
) => {
  const myHeaders = new Headers();
  myHeaders.append('Accept', 'application/json, text/javascript, */*; q=0.01');
  myHeaders.append('Accept-Language', 'en-US,en;q=0.9,he;q=0.8,ja;q=0.7');
  myHeaders.append('Cache-Control', 'no-cache');
  myHeaders.append('Connection', 'keep-alive');
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Origin', 'https://game.granbluefantasy.jp');
  myHeaders.append('Pragma', 'no-cache');
  myHeaders.append('Referer', 'https://game.granbluefantasy.jp/');
  myHeaders.append(
    'User-Agent',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );
  myHeaders.append('X-Requested-With', 'XMLHttpRequest');
  myHeaders.append('X-VERSION', (window as any)?.Game?.version);

  if (options?.headers) {
    for (const header in options.headers) {
      myHeaders.append(header, options.headers[header]);
    }
  }
  const raw = JSON.stringify(options?.data ?? '');

  const requestOptions: RequestInit = {
    method: options?.method || 'GET',
    headers: myHeaders,
    body: options?.method == 'POST' ? raw : undefined,
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.text();
    return result;
  } catch (error) {
    log('Network error: ', error);
    throw error;
  }
};
