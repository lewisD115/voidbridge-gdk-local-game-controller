(() => {
	chrome.runtime.onMessage.addListener((obj, sender, response) => {
		const { type, urlParameters } = obj;

		if(type === "configInteraction") {
			window.location.search  = decodeURIComponent(urlParameters);
		}
	});

})();

