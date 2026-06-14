document.addEventListener('DOMContentLoaded', () => {
    const setupCard = document.getElementById('setupCard');
    const mainCard = document.getElementById('mainCard');
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const runBtn = document.getElementById('runBtn');
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');

    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            setupCard.classList.add('hidden');
            mainCard.classList.remove('hidden');
        }
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            chrome.storage.local.set({ geminiApiKey: key }, () => {
                setupCard.classList.add('hidden');
                mainCard.classList.remove('hidden');
            });
        }
    });

    runBtn.addEventListener('click', async () => {
        resultBox.classList.add('hidden');
        loading.classList.remove('hidden');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, { action: "getData" }, (response) => {
            if (response && response.text) {
                callGemini(response.text);
            } else {
                alert("Could not extract data from the page.");
                loading.classList.add('hidden');
            }
        });
    });

    async function callGemini(pageText) {
        chrome.storage.local.get(['geminiApiKey'], async (result) => {
            const prompt = `Summarize this YouTube video transcript into key bullet points for Notion.\n\nDATA:\n${pageText}`;
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${result.geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                loading.classList.add('hidden');
                resultBox.value = data.candidates[0].content.parts[0].text;
                resultBox.classList.remove('hidden');
            } catch (err) {
                alert("API Error.");
                loading.classList.add('hidden');
            }
        });
    }
});