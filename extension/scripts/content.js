

console.log("EXTENSION CONTENT SCRIPT LOADED");
console.log(`Current URL: ${window.location.href}`);

(async () => {
  if (window.location.href.includes("quest/scene")) {
    console.log("This is a scene page");
    const sceneType = window.location.href.match(/#quest\/scene\/([^\/]+)/)?.[1];
    console.log(`scene type: ${sceneType}`);

    // get updated Cookies from page
    const cookies = document.cookie;
    console.log(cookies);
    // use cookies to change user lang to JP temporarily in order to fetch Japanese text
    
    window.addEventListener('load', async function () {
      console.log("$$$$$$$$$$$ PAGE loaded!")
      await waitForElm('.prt-message-area');
      
      await GBChangeLanguage("JA");
      const sceneJPData = JSON.parse(await GBRequestSceneInfo(sceneType));
      let currentSceneSlide = 0;
      GBChangeLanguage("EN");

      console.log('sceneData in Japanese:', sceneJPData);
      console.log('Example japanese:', sceneJPData?.scene_list[currentSceneSlide].detail);

      nextSlideElements = [
        await waitForElm('.prt-next-btn-area'),
        await waitForElm('.prt-scene-comment')
      ];
      
      // async function handleNextSlide() {
      //     console.log('next button clicked');
      //     currentSceneSlide++;
      //     console.log('currentSceneSlide:', currentSceneSlide);
      //     insertDualSub(sceneJPData?.scene_list[currentSceneSlide].detail);
      // }
      // nextSlideElements.forEach(elm => {
      //   elm.addEventListener('click', handleNextSlide);
      // });

      const textBox = await waitForElm('.prt-message-area');
      textBox.style.display = 'flex';
      textBox.style.flexFlow = 'column';

      insertDualSub(sceneJPData?.scene_list[currentSceneSlide].detail);

      observeCurrentProgress((currentSlide) => insertDualSub(sceneJPData?.scene_list[currentSlide].detail));
    })
  }
})();

function observeCurrentProgress(callback) {
  const progressElm = document.querySelector('.prt-log-display');
  const observer = new MutationObserver(mutations => {
    console.log('progress changed:', mutations);
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        console.log('progress added:', mutation.addedNodes);

        for (const node of mutation.addedNodes) {
          if(node.classList && node.classList.contains('prt-log-each')) {
            // get data-scenario-index attribute
            const currentSlide = parseInt(node.getAttribute('data-scenario-index'));
            console.log('new Slide:', node, ', index: ', currentSlide);
            callback(currentSlide);
          }
        }
      }
    }
  });
  observer.observe(progressElm, {
    childList: true,
    subtree: true
  });

}

async function insertDualSub(altText) {
  const textBoxInner = await waitForElm('.txt-message.typist-container');
  console.log('textBoxInner:', textBoxInner.textContent);
  console.log('altText:', altText);
  textBoxInner.style.fontSize = '12px';
  textBoxInner.style.fontFamily = 'initial';
  textBoxInner.insertAdjacentElement('afterend', (()=> {
    const altLangText= textBoxInner.cloneNode()
    altLangText.innerHTML = altText;
    return altLangText;
  })() );
}
function GBChangeLanguage(language = "EN") {

  return GBRequest(`https://game.granbluefantasy.jp/setting/save?_=${Date.now()}&t=${Date.now()}`, { method: "POST", data: {
    "special_token": null,
    "language_type": (language == "JA"? "1": "2")
  }, headers: {} });
};

 async function GBRequestSceneInfo(sceneType) {
  return await GBRequest(`https://game.granbluefantasy.jp/quest/scenario/${sceneType}?_=${Date.now()}&t=${Date.now()}`, { method: "GET", data: {}, headers: {} });
}

async function GBRequest(url, options) {
  
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("Accept-Language", "en-US,en;q=0.9,he;q=0.8,ja;q=0.7");
  myHeaders.append("Cache-Control", "no-cache");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "access_gbtk=d485296b782a17ec071ef34b9267c01ea9ec0c31; access_gbtk=d485296b782a17ec071ef34b9267c01ea9ec0c31; t=dummy; wing=qEBgYlIZz7Mx%2Fqkpi8xZEr%2BqLK3lQfW8uzk7ub0vg9AtHcNrBiSMNA393cvpHlm1; midship=S%3AMP7MszM7lYRnun9Bjq6LLnp2zD-6uFZG87TLlR5qAlHGkZcEcajNTyPkjbJAXLQeNRvAy9CJwK4y4nm_GVHKqmxSqKR2lsQlQzRKjENi0HD4K_1ImXt3-z6hSn5BZxCK1_Nf3gkncEIHBIJOZ6b8kGi453rZwVQisVsA02BPp1B3V7ubTeGAMI1nSYzfZ8QCREWvvU4W_tSgEH8YAGwFwRPfGu9qmwfmZhQhFWmwplhqSQ%3D%3D; access_gbtk=243959c48b0fd288daa2dce3675c46f1b22ea969; midship=S%3Al0WGntP8nAAIOtTqj6gkti7ejYYrLSLUrOnLPNGx5aERu5jTPQCvtalQL9sfwyImqF4e5WsYCV7pAjCo0I0tnHPCDPaRrEATPQy7MLlv-jdEsgIyPS-HWNin4wxrMfQTiFKdc5p1fw5efIpQ0WC-AYUwSU3G4n8lq5AnuFbk2FH36uYpZO-Nf43zOd-vmuctCb_8AnGoIRUiIU1CzioT75VC4CVRXz26ZpMPcKGEG8Feog%3D%3D; t=dummy");
  myHeaders.append("Origin", "https://game.granbluefantasy.jp");
  myHeaders.append("Pragma", "no-cache");
  myHeaders.append("Referer", "https://game.granbluefantasy.jp/");
  myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
  myHeaders.append("X-Requested-With", "XMLHttpRequest");
  myHeaders.append("X-VERSION", "1707794863");

  if(options?.headers) {
    for (const header in options.headers) {
      myHeaders.append(header, options.headers[header]);
    }
  }
  const raw = JSON.stringify(options?.data ?? '');

  const requestOptions = {
    method: options?.method || 'GET',
    headers: myHeaders,
    body: options?.method == 'POST'? raw : undefined,
    redirect: 'follow'
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.text();
    console.log('GB Request URL: ', url, 'results: ', result);
    return result;
  } catch (error) {
    console.log('error', error);  
    throw error;
  }
}


function waitForElm(selector) {
  return new Promise(resolve => {
    console.log('waiting for element:', selector);
      if (document.querySelector(selector)) {
          console.log('element found:', document.querySelector(selector));
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        console.log('mutation observer:', mutations);
        console.log('checking for element:', selector);
          if (document.querySelector(selector)) {
            console.log('element found, disconnect observer:', document.querySelector(selector));
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}




