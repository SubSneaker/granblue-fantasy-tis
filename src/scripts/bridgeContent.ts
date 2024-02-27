import { log, resetConsoleLog } from '../modules/utility';
resetConsoleLog();
// Fetch the Game variable from the global scope
const game = (window as any).Game;

log('Game variable:', game);
// Check if the Game variable exists
if (game) {
  // Pass the Game variable to the isolated content script
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source === window && event.data?.type === 'TO_PAGE_CONTEXT') {
      log('Game data requested');
      window.postMessage(
        {
          type: 'TO_ISOLATED_WORLD',
          action: 'gameData',
          gameVersion: game.version,
          gameLanguage: game.lang,
          gameSceneId: game.view.scene_id,
        },
        '*'
      );
      log('Game data sent');
    }
  });
} else {
  log('Game variable not found, throwing error');
  throw new Error('Game variable not found');
}
