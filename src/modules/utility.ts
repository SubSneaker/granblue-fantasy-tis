
/**
 * Logs the provided arguments to the console if the environment is set to development.
 * Prepends the logs with a Unique identifier to make it easier to find in the console.
 * @param args - The contents to be logged.
 */
export const log = (...args: any[])  => {
  if (process.env.NODE_ENV === 'development') {
    console.log("##### GB:TiS Log:: ", ...args);
  }
}

export const logLogo = () => {
  console.log('%cGranblue Fantasy', `
  margin: auto;
  padding: 10px 60px;
  padding-top:30px;
  font-family: Palatino, serif;
  font-size: 50px;
  color: #474747;
  text-align: center;
  text-shadow:
    0px -0px 4px white,
    -15px -3px 15px #49b9ff,
    -35px -3px 16px #1e7fff,
    -40px -2px 15px #64a5b7,
    -20px -12px 45px #6be8ff,
    -24px -3px 10px #46cff4,
    14px -3px 10px #46cff4`);
console.log('%cTranslation in Subs', `
  margin: auto;
  padding: 10px 60px;
  padding-top:30px;
  margin-top: -50px;
  margin-left: 50px;
  font-family: Palatino, serif;
  font-size: 30px;
  color: #474747;
  text-align: center;
  text-shadow:
    0px -0px 4px white,
    -15px -3px 15px #49b9ff,
    -35px -3px 16px #1e7fff,
    -40px -2px 5px #64a5b7,
    20px 4px 5px #6be8ff,
    -24px -3px 10px #46cff4,
    14px -3px 10px #46cff4`);
};

/**
 * Resets the console.log function to override the Granblue game settings hiding the console.
 */
export const resetConsoleLog = () => {
  var iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  document.body.appendChild(iFrame);
  if (iFrame.contentWindow) {
    window.console = (iFrame.contentWindow as Window & typeof globalThis).console;
  }
  log('Console.log reset');
};
