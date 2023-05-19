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

// pdfjsLib.GlobalWorkerOptions.workerSrc = `http://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
// pdfjsLib.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;
let PDF;
import * as pdfjsLib from 'pdfjs-dist';
const workerSrc = chrome.runtime.getURL('pdf.worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

let readFile = (_path) => {
  return new Promise((resolve, reject) => {
      fetch(_path, {mode:'same-origin'})
          .then(function(_res) {
              return _res.blob();
          })
          .then(function(_blob) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
              var typedarray = new Uint8Array(this.result);
              resolve(typedarray);
            });
            reader.readAsArrayBuffer(_blob);
          })
          .catch(error => {
              reject(error);
          });
  });
};

let readFile1 = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function() {
      var typedarray = new Uint8Array(this.result);
      resolve(pdfjsLib.getDocument(typedarray));
    };
    reader.readAsArrayBuffer(file);
  });
};

async function ParsePage () {
  let url = new URL(window.location.href);
  let isPDF = url.pathname.endsWith(".pdf");
  // let host = url.host;
  // let path = url.pathname;
  // let hostPath = host + path;
  let prompt = '';
  if (isPDF) {
    if (url.protocol === 'file:') {
      PDF = await readFile(url);
      PDF = await pdfjsLib.getDocument(PDF).promise;
    } else {
      PDF = await pdfjsLib.getDocument(url).promise;
    }
    console.log(PDF);
    chrome.runtime.sendMessage({
      type: 'SelectPage',
      payload: {
        numPages: PDF.numPages,
      },
    });
  } else {
    let text = document.body.innerText;
    let result = await new Promise((resolve) => {
      chrome.storage.sync.get('prompt', (result) => {
        resolve(result);
      });
    });
    if (result.prompt) {
      prompt += 'Summarise the following content: ';
    }
    prompt += text;
    chrome.runtime.sendMessage({
      type: 'WebPage_Content',
      payload: {
        prompt: prompt,
      },
    });
  }
  return prompt;
}


// Listen for message
chrome.runtime.onMessage.addListener( async (request, sender, sendResponse) => {
  if (request.type === 'PARSE') {
    ParsePage();
  }
  if (request.type === 'SELECTED_PAGES') {
    let selectedPages = request.payload.selectedPages;
    let prompt = '';
    let result = await new Promise((resolve) => {
      chrome.storage.sync.get('prompt', (result) => {
        resolve(result);
      });
    });
    if (result.prompt) {
      prompt += 'Here ' + (selectedPages.length>1? 'are' : 'is')  + ' the ' + selectedPages.join(',') + 'th page of the paper, summarise the content: ';
    }
    for (let i = 0; i < selectedPages.length; i++) {
      let page = await PDF.getPage(Number(selectedPages[i]));
      let textContent = await page.getTextContent();
      console.log('TextContent: ', textContent);
      for(let j = 0; j < textContent.items.length; j++) {
        prompt += textContent.items[j].str;
      }
    }
    console.log(prompt);
    chrome.runtime.sendMessage({
      type: 'WebPage_Content',
      payload: {
        prompt: prompt,
      },
    });
  }
  // if (request.type === 'FILE_UPLOAD') {
  //   let file = request.payload.file;
  //   alert(file);
  //   if (!file || !(file instanceof Blob)) {
  //     alert('Invalid file selected.');
  //     return;
  //   }
    
  //   PDF = readFile1(file);
  //   alert(PDF.numPages);
  // }



  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
