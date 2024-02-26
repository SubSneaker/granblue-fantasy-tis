import { log, resetConsoleLog } from '../modules/utility';
resetConsoleLog();
// Fetch the Game variable from the global scope
const game = (window as any).Game;

log('Game variable:', game);
// Check if the Game variable exists
if (game) {
  // Pass the Game variable to the isolated content script
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      event.data?.action == 'getGameVersion' &&
      event.source === window &&
      event.data?.type === 'TO_PAGE_CONTEXT'
    ) {
      log('Game version requested');
      window.postMessage(
        { type: 'TO_ISOLATED_WORLD', gameVersion: game.version },
        '*'
      );
    }
  });
} else {
  log('Game variable not found, throwing error');
  throw new Error('Game variable not found');
}
