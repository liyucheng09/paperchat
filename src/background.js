'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { ChatGPTUnofficialProxyAPI } from 'chatgpt'

async function obtainAccessKey() {
  let acessKey;
  console.log("obtaining access key");

  let response = await fetch("https://chat.openai.com/api/auth/session");
  let authJson = await response.json();

  if (authJson.accessToken == null) {
      chrome.runtime.sendMessage({type: 'notLoggedIn'});
      // alert("Please got to ChatGPT and log in first, then try again! ");
      return;
  } else {
      acessKey = authJson.accessToken;
      console.log("access key obtained", acessKey);
      return acessKey;
  }
}

let chatAPI;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'DOM_LOADED') {
    let accessKey = await obtainAccessKey();
    if (accessKey == null) {
      return;
    }
    chatAPI = new ChatGPTUnofficialProxyAPI({
        accessToken: accessKey,
    });
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions)
    let url = new URL(tab.url);
    let hostPath = url.host + url.pathname;

    chrome.storage.sync.get([hostPath]).then(async (results) => {
      let conversationId;
      if (!Object.keys(results).length) {
        console.log("no results");
        let res = await chatAPI.sendMessage('Hi!');
        conversationId = res.conversationId;
        chrome.storage.sync.set({[hostPath]: conversationId});
      } else {
        console.log("results", results);
        conversationId = results[hostPath];
        try {
          let res = await chatAPI.sendMessage('Hi!', 
            { conversationId: conversationId });
        }
        catch (err) {
          console.log("error", err);
          if (err.message === 'badConversationId') {
            let res = await chatAPI.sendMessage('Hi!');
            conversationId = res.conversationId;
            chrome.storage.sync.set({[hostPath]: conversationId});
          }
        }
      }
      console.log("conversationId", conversationId);
      chrome.runtime.sendMessage({type: 'initChatlog', conversationId: conversationId});
    });
  }

  if (request.type === 'paraObtained') {
    console.log("REQ", request);
    console.log("Tab URL", request.hostPath);
    console.log("paragraphToSummarize", request.prompt);
    let res;

    chrome.storage.sync.get([request.hostPath]).then(async (results) => {
      console.log("RRResults", results);
      if (!Object.keys(results).length) {
        console.log("No conversation found, starting new one", chatAPI);
        // console.log("paragraphToSummarize", paragraphToSummarize);
        // console.log("Tab URL", hostPath);
        res = await chatAPI.sendMessage(request.prompt);
        console.log("response", res);
        let conversationId = res.conversationId;
        let parentMessageId = res.parentMessageId;
        let historyLog = [];
        historyLog.push({message: request.prompt, sender: 'User'});
        historyLog.push({message: res.text, sender: 'ChatGPT'});

        let updates = {
          conversationId: conversationId,
          parentMessageId: parentMessageId,
          historyLog: historyLog,
        };

        chrome.storage.sync.set({[request.hostPath] : updates}).then(() => {
          console.log("Conversation started, continuing", results);
        });

      } else {
        console.log("Conversation found, continuing", results);
        results = results[request.hostPath];
        let conversationId = results.conversationId;
        let parentMessageId = results.parentMessageId;
        let historyLog = results.historyLog;
        res = await chatAPI.sendMessage(request.prompt, 
          {
            conversationId: conversationId,
            parentMessageId: parentMessageId,
          }
        );
        historyLog.push({message: request.prompt, sender: 'User'});
        historyLog.push({message: res.text, sender: 'ChatGPT'});

        let updates = {
          conversationId: conversationId,
          parentMessageId: parentMessageId,
          historyLog: historyLog,
        };
        console.log("response", res);
        chrome.storage.sync.set({[request.hostPath] : updates}).then(() => {
          console.log("Conversation continued", results);
        });
      }
      chrome.runtime.sendMessage(
        {'type': 'ChatResponse', 'message': res.text, 'sender_': 'ChatGPT'}
      )
    });
    
    return true;
  }
});