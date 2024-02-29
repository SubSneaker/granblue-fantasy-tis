<div align="center"><img src="src/assets/GBFTiSIcon.png" width="512" /></div>

# Granblue Fantasy: Translation in Subs
by [SubSneaker](https://github.com/SubSneaker) <span ><img src="src/assets/GBFTiSIcon_noBubbles_256.png" width="64" /></span>

A chrome extension to help Language learners learn as they play the game, by injecting both the English and Japanese text into the game's subtitles during cutscenes.

The English text is provided by the game's official translation, and the Japanese text is provided by the game's official subtitles, and both are injected into the text box present in the game's cutscenes.

![separator](src/assets/GBFTiSUi_separator01.png)

- [Granblue Fantasy: Translation in Subs](#granblue-fantasy-translation-in-subs)
  - [Usage](#usage)
      - [Pre-extension:](#pre-extension)
      - [Post extension:](#post-extension)
    - [Configuration](#configuration)
  - [For Developers](#for-developers)
    - [Installation](#installation)
    - [Running](#running)
    - [Building](#building)
  - [Currently known issues:](#currently-known-issues)
  - [Specific issues handled:](#specific-issues-handled)
  - [Risks regarding usage and liability](#risks-regarding-usage-and-liability)
  - [Issues and Feature requests](#issues-and-feature-requests)
    - [TODO:](#todo)

![separator](src/assets/GBFTiSUi_separator01.png)

## Usage
Before proceeding further, **I ask that you read the [Risks regarding usage and liability](#risks-regarding-usage-and-liability) section.**

To activate, simply install the extension and navigate to an event cutscene in the game. The extension will automatically detect the cutscene and inject the translations into the text box.

If the extension is not working, try refreshing the page, in some cases the game doesn't actually navigate the URL, this is gonna be fixed in the future.

If the extension is properly running, your event page should present like this:
#### Pre-extension:
<div align="center"><img src="src/assets/PreExtension1.png" width="600" /></div>

#### Post extension:
<div align="center"><img src="src/assets/PostExtension1.png" width="600" /></div>

The first time you use the extension, it will request the dictionaries from the server, and then store them in the browser's local storage for future use. This will take a few seconds, but subsequent uses will be much faster, so if the page seems to hang on loading screen, don't worry, it's just the first time. If you want to clear the dictionaries, you can do so from the extension's configuration menu.

### Configuration
The extension has a configuration menu accessible by pressing on the icon in the top right of the browser, and then clicking on the extension's icon. This will open a popup with the configuration options.

From there feel free to select as you desire:
<div align="center"><img src="src/assets/PopupUISample01.png" width="400" /></div>

**NOTE: This extension currently ONLY works on Chrome (other chromiums not yet verified) on PC. Mobile browser support is planned later on.**

***I hope this helps you learn Japanese, and enjoy the game!*** <span ><img src="src/assets/GBFTiSIcon_noBubbles_256.png" width="64" /></span>


![separator](src/assets/GBFTiSUi_separator01.png)

## For Developers
### Installation
To install the extension, simply clone the repository and run `npm install` to install the dependencies.

### Running
To run the extension, you can run `npm run start` to start the development server, and then load the extension into your browser by navigating to `chrome://extensions/` and clicking `Load unpacked` and selecting the `dist` folder.

### Building
To build the extension, you can run `npm run build` to build the extension into the `dist` folder.
The extension will be built in mode `production` and will be ready to be loaded into your browser.
*Note that logging is mostly disabled in production mode.*

![separator](src/assets/GBFTiSUi_separator01.png)

## Currently known issues:
- Due to a timing issue, the extension sometimes doesn't load the translations into the game's text box. This is due to the extension trying to find game-context flags after the game fully loaded to avoid undefined issues. If this happens going to the next textbox will usually resolve the matter.
- On some occasions the extension stops working and doesn't load the translated subs into the game's text box. Causes are still unknown, need to be worked on. Currently the only solution is to refresh the page. In the future i'll add a logdump feature to help debug this issue.
- While technically Chromium browsers on mobile with extensions enabled like Kiwi Browser CAN work, the extension is not yet optimized for mobile, and there seems to be some buggy behaviors with the app that block the extension from running properly alot of times. This is planned to be addressed in the future, but for the meantime the official way to use this extension is through a Chrome/Chromium desktop browser.

## Specific issues handled:

- Due to using a library called [kuroshiro](https://github.com/hexenq/kuroshiro) for the transliteration of Kanji to furigana, there was an adjustment that had to be made due to the library probably not being made to handle the way extensions access file URIs, and it mistakenly assumes to try and reach for the `node_modules` which doesn't exist within the serverless context of the extension, instead accidentally trying to access GBF's servers. <br>
I had to make a hard adjustment for this specific case so I used `patch-package` library to make a patch for the `kuroshiro` library to fix this issue.

![separator](src/assets/GBFTiSUi_separator01.png)

## Risks regarding usage and liability
Granblue Fantasy's rules technically **prohibit** use of third-party software/tools, and while those rules are more specifically meant to target cheats and hacks, and this extension is **not a cheat nor a hack**, it is still a third-party software and does query the oficial server for data. The app doesn't add specific user data in the request wherever possible, but your IP and device could still potentially be tracked. 

To that extent, I will explicitly **AVOID** endorsing, making compatibility updates or supporting any other 3rd party tools, including and especially ones that clearly are used to cheat or hack the game. This extension is meant to be a **learning and reading assistance tool**, and I hope it is used as such. It is also **NOT** meant in any way to challenge or denigrade the official localization, but mainly to help people learn Japanese and learn while enjoying the game.

In addition, if for some reason Granblue Fantasy's developers decide to change the app in significant ways or specifically may block this extension's standard behavior, I may or may not resign from continuing support or adjusting the extension to work with the new changes. If I believe that the GBF team or Cygames Inc. is taking actions against this extension, it may be removed entirely.

So while this should go without saying, I am not responsible for any consequences that may arise from using this extension, including but not limited to suspension or bans. **Use at your own risk.**

## Issues and Feature requests
If you have any issues or feature requests, feel free to open an issue on the [issues page](https://github.com/SubSneaker/GBFTiS/issues).
I cannot guarantee that I will be able to address every issue or feature request, as this is mostly a pet project, so it mostly depends on the reception to this and my own scheduling.

### TODO:
- [x] Fix the routing issue (eg. When a page enters a scene without being refreshed or a new address (Dynamic URL change), it won't retrigger the code to run again).
- [ ] Refactor the code into modules
- [x] Create an extension page with GUI and a background worker to maintain flags.
- [ ] Look into possibly AI translation/explanation additions
- [ ] If AI is added, consider more languages (low priority)
- [ ] Mobile browser support.
- [x] Move the dictionaries to a web Storage to avoid requesting it every time and slowing the page.
- [x] Find a way to access page context such as `Game` variable to get version for request
- [ ] Code occasionally stops working before starting any requests, need to find out why
- [x] Try adding options for romaji (low priority)