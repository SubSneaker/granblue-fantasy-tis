
export const log = (...args: any[])  => {
  if (process.env.NODE_ENV === 'development') {
    console.log("##### GB:TiS Log:: ", ...args);
  }
}

export const resetConsoleLog = () => {
  var iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  document.body.appendChild(iFrame);
  if (iFrame.contentWindow) {
    window.console = (iFrame.contentWindow as Window & typeof globalThis).console;
  }
  log('Console.log reset');
};
