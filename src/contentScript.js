'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
// const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
// console.log(
//   `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
// );

// Communicate with background file by sending a message
// chrome.runtime.sendMessage(
//   {
//     type: 'GREETINGS',
//     payload: {
//       message: 'Hello, my name is Con. I am from ContentScript.',
//     },
//   },
//   (response) => {
//     console.log(response.message);
//   }
// );

// Listen for message

function parseURL() {
  let url = new URL(window.location.href);
  let host = url.host;
  let path = url.pathname;
  let hostPath = host + path;

  return hostPath;
}

async function ParsePage () {
  let url = new URL(window.location.href);
  let isPDF = url.pathname.endsWith(".pdf");
  let host = url.host;
  let path = url.pathname;
  let hostPath = host + path;
  let prompt;

  if (isPDF) {
    let pdf = await pdfjsLib.getDocument(url.href).promise;
    let page = await pdf.getPage(1);
    let text = await page.getTextContent();
    let title = text.items[0].str;
    // console.log(title);
  } else {
    let text = document.body.innerText;
    prompt = 'Summarise the following paper: ' + text;
  }

  return {hostPath, prompt};
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ParsePage') {
    // console.log(`Current count is ${request.payload.count}`);
    ParsePage().then(({hostPath, prompt}) => {
      chrome.runtime.sendMessage({type: 'paraObtained', hostPath: hostPath, prompt: prompt});
    });
  }

  if (request.type === 'QUERY') {
    let hostPath = parseURL();
    chrome.runtime.sendMessage({type: 'paraObtained', hostPath: hostPath, prompt: request.query});
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
