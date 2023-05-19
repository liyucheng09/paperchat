'use strict';

import './popup.css';


  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

// document.addEventListener('DOMContentLoaded', () => {
// });

document.getElementById('loginclose').addEventListener('click', () => {
  chrome.tabs.create({ url: "https://chat.openai.com/auth/login" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'initChatlog') {
    // request.response.forEach((message) => {
    //   updateChatlog(message.message, message.sender); 
    // });
    document.getElementById('chatgpt').src = 'https://chat.openai.com/chat/' + request.conversationId;
  }

  if (request.type === 'notLoggedIn') {
    // alert("Please got to ChatGPT and log in first, then try again! ");
    document.getElementById('popup-container').style.display = 'block';
  }
});

document.getElementById('parse').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'PARSE',
      }
    );
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({'type': 'DOM_LOADED'});
  chrome.storage.sync.get(['prompt'], (result) => {
    let checkbox = document.getElementById('vehicle1');
    if (!Object.keys(result).length) {
      chrome.storage.sync.set({prompt: true});
      checkbox.checked = true;
    } else if (result.prompt === true) {
      checkbox.checked = true;
    } else  if (result.prompt === false) {
      checkbox.checked = false;
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SelectPage') {
    // console.log(request);
    let numPages = request.payload.numPages;
    let prompt_window = document.getElementById('selectPage');
    let selector = document.getElementById('selector');
    for (let i = 1; i <= numPages; i++) {
      let option = document.createElement('option');
      option.text = 'Page - ' + i;
      selector.add(option);
    }
    prompt_window.style.display = 'flex';
    let parse_button = document.getElementById('parse');
    parse_button.style.display = 'none';
  }
  if (request.type === 'WebPage_Content') {
    let content = request.payload.prompt;
    console.log(content);
    let content_title = document.getElementById('ContentTitle');
    let textarea = document.getElementById('text');
    content_title.innerHTML = 'Copied to clipboard!';
    textarea.value = content;
    content_title.style.display = 'block';
    textarea.style.display = 'block';
    navigator.clipboard.writeText(content);
    document.getElementById('checkbox').style.display = 'none';
    // let divider = document.getElementById('divider');
    // divider.style.margin = '15px auto 15px';
  }
});

// document.getElementById('file-upload').addEventListener('change', (e) => {
//   const file = e.target.files[0];
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tab = tabs[0];
//     chrome.tabs.sendMessage(
//       tab.id,
//       {
//         type: 'FILE_UPLOAD',
//         payload: {
//           file: file,
//         },
//       }
//     );
//   });
// });

document.getElementById('vehicle1').addEventListener("change", function() {
  if (this.checked) {
    chrome.storage.sync.set({prompt: true});
  } else {
    chrome.storage.sync.set({prompt: false});
  }
});

document.getElementById('PageSelected').addEventListener('click', () => {

  let selector = document.getElementById('selector');
  const selectedOptions = selector.selectedOptions;
  console.log(selectedOptions);
  const selectedPages = Array.from(selectedOptions, option => option.value.split(' - ')[1]);
  console.log(selectedPages);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'SELECTED_PAGES',
        payload: {
          selectedPages: selectedPages,
        },
      }
    );
  });

  // let prompt_window = document.getElementById('selectPage');
  // prompt_window.style.display = 'none';
});


// function updateChatlog ({message, sender_}) {
//   const chatbox = document.getElementById("chatbox");

//   const newMessage = document.createElement("div");
//   newMessage.classList.add("message");

//   const sender = document.createElement("span");
//   sender.classList.add("sender");
//   sender.textContent = sender_ + ":";

//   const content = document.createElement("span");
//   content.classList.add("content");
//   content.textContent = message;

//   newMessage.appendChild(sender);
//   newMessage.appendChild(content);
//   chatbox.appendChild(newMessage);
// }

// document.getElementById("send").addEventListener("click", function () {
//   let query = document.getElementById('message').value;

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tab = tabs[0];
//     chrome.tabs.sendMessage(
//       tab.id,
//       {'type': 'QUERY', 'query': query}
//     );
//   });
//   updateChatlog({message: query, sender: "You"});
// });



  // const counterStorage = {
  //   get: (cb) => {
  //     chrome.storage.sync.get(['count'], (result) => {
  //       cb(result.count);
  //     });
  //   },
  //   set: (value, cb) => {
  //     chrome.storage.sync.set(
  //       {
  //         count: value,
  //       },
  //       () => {
  //         cb();
  //       }
  //     );
  //   },
  // };

  // function setupCounter(initialValue = 0) {
  //   document.getElementById('counter').innerHTML = initialValue;

  //   document.getElementById('incrementBtn').addEventListener('click', () => {
  //     updateCounter({
  //       type: 'INCREMENT',
  //     });
  //   });

  //   document.getElementById('decrementBtn').addEventListener('click', () => {
  //     updateCounter({
  //       type: 'DECREMENT',
  //     });
  //   });
  // }

  // function updateCounter({ type }) {
  //   counterStorage.get((count) => {
  //     let newCount;

  //     if (type === 'INCREMENT') {
  //       newCount = count + 1;
  //     } else if (type === 'DECREMENT') {
  //       newCount = count - 1;
  //     } else {
  //       newCount = count;
  //     }

  //     counterStorage.set(newCount, () => {
  //       document.getElementById('counter').innerHTML = newCount;

  //       // Communicate with content script of
  //       // active tab by sending a message
  //       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //         const tab = tabs[0];

  //         chrome.tabs.sendMessage(
  //           tab.id,
  //           {
  //             type: 'COUNT',
  //             payload: {
  //               count: newCount,
  //             },
  //           },
  //           (response) => {
  //             console.log('Current count value passed to contentScript file');
  //           }
  //         );
  //       });
  //     });
  //   });
  // }

  // function restoreCounter() {
  //   // Restore count value
  //   counterStorage.get((count) => {
  //     if (typeof count === 'undefined') {
  //       // Set counter value as 0
  //       counterStorage.set(0, () => {
  //         setupCounter(0);
  //       });
  //     } else {
  //       setupCounter(count);
  //     }
  //   });
  // }

  // document.addEventListener('DOMContentLoaded', restoreCounter);

  // // Communicate with background file by sending a message
  // chrome.runtime.sendMessage(
  //   {
  //     type: 'GREETINGS',
  //     payload: {
  //       message: 'Hello, my name is Pop. I am from Popup.',
  //     },
  //   },
  //   (response) => {
  //     console.log(response.message);
  //   }
  // );