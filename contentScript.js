(() => {


	chrome.runtime.onMessage.addListener((obj, sender, response) => {
		const { type, urlParameters } = obj;

		if(type === "configInteraction") {
			window.location.search  = decodeURIComponent(urlParameters);
		}
	});


	window.addEventListener("message", (event) => {

	    if (event.source !== window) {
	        return;
	    }

	    if (event.data.type === "VB_SIM_DATA") {
	    	// Local storage of data used for game simulation
	        chrome.storage.local.set({
	            vbUserId: event.data.userId,
	            vbPortalSessionId: event.data.portalSessionId
	        });
	    }
	});

	const script = document.createElement("script");

	script.src = chrome.runtime.getURL("inject.js");

	(document.head || document.documentElement).appendChild(script);

	script.onload = () => script.remove();

})();

