chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        const getLogic = () => { return document.body.innerText.substring(0, 3000); };
        try {
            sendResponse({ text: getLogic() });
        } catch(e) {
            sendResponse({ text: document.body.innerText.substring(0, 2000) });
        }
    }
    return true;
});