

export const GBChangeLanguage = (language: string = "EN") => {

  return GBRequest(`https://game.granbluefantasy.jp/setting/save?_=${Date.now()}&t=${Date.now()}`, { method: "POST", data: {
    "special_token": null,
    "language_type": (language == "JA"? "1": "2")
  }, headers: {} });
};

 export const GBRequestSceneInfo = async (sceneType: string) => {
  return await GBRequest(`https://game.granbluefantasy.jp/quest/scenario/${sceneType}?_=${Date.now()}&t=${Date.now()}`, { method: "GET", data: {}, headers: {} });
}

export const GBRequest = 
  async (url: string, options: { method?: string, data?: any, headers?: any }) => {
  
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("Accept-Language", "en-US,en;q=0.9,he;q=0.8,ja;q=0.7");
  myHeaders.append("Cache-Control", "no-cache");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Origin", "https://game.granbluefantasy.jp");
  myHeaders.append("Pragma", "no-cache");
  myHeaders.append("Referer", "https://game.granbluefantasy.jp/");
  myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
  myHeaders.append("X-Requested-With", "XMLHttpRequest");
  myHeaders.append("X-VERSION", (window as any)?.Game?.version);

  if(options?.headers) {
    for (const header in options.headers) {
      myHeaders.append(header, options.headers[header]);
    }
  }
  const raw = JSON.stringify(options?.data ?? '');

  const requestOptions: RequestInit = {
    method: options?.method || 'GET',
    headers: myHeaders,
    body: options?.method == 'POST'? raw : undefined,
    redirect: 'follow'
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.text();
    return result;
  } catch (error) {
    console.log('error', error);  
    throw error;
  }
}
