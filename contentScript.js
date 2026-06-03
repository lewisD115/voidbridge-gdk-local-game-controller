(() => {


	chrome.runtime.onMessage.addListener((obj, sender, response) => {
		const { type, urlParameters } = obj;

		if (type === "configInteraction") {
			window.location.search  = decodeURIComponent(urlParameters);
		}
	});


	window.addEventListener("message", (event) => {

	    if (event.source !== window) {
	        return;
	    }

	    if (event.data.type === "VB_SIM_DATA") {
	    	// Local storage of data used for game simulation from enter file
	        chrome.storage.local.set({
	            vbUserId: event.data.userId,
	            vbPortalSessionId: event.data.portalSessionId
	        });
	    } else if (event.data.type === "VB_SYMBOLS") {
			// Local storage of symbols in init file
			chrome.storage.local.set({
				symbols: event.data.symbols
			});
		} else if (event.data.type === "VB_LINE_NUMBERS") {
			chrome.storage.local.set({
				lineNumbers: event.data.lineNumbers
			});
		}
	});


	const script = document.createElement("script");

	script.src = chrome.runtime.getURL("inject.js");

	(document.head || document.documentElement).appendChild(script);

	script.onload = () => script.remove();

})();

