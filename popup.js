import {GAME_CONFIG_CONTENT_ROOT, GAME_CLIENT_CONTENT_ROOT, CONFIG_INTERACTION} from './utils/globalStrings.js';


const toggleElement = document.getElementById("gameConfigToggle");

const activeTab = await getActiveTab();


if(activeTab.url.includes("vbgames88.com/play/portals/")) {

}
else {
	document.body.innerHTML = '';
	document.documentElement.innerHTML = '';
}


//check if url is voidbridge

const queryParameters =  getUrlParams();

const urlParameters = new URLSearchParams(queryParameters);


if(urlParameters.get(GAME_CONFIG_CONTENT_ROOT) != null) {
	toggleElement.checked = true;
} else {
	toggleElement.checked = false;
}

toggleElement.addEventListener('change', myFunction);


async function getActiveTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

function getUrlParams() {
	const params = activeTab.url.split("?")[1];
	return params;
}

async function myFunction(event) {
	const activeTab = await getActiveTab();

	if (!event.target.checked) {
		if(urlParameters.get(GAME_CONFIG_CONTENT_ROOT) != null) {
			urlParameters.delete(GAME_CONFIG_CONTENT_ROOT);
		}
	} else {
		const newParamValue = urlParameters.get(GAME_CLIENT_CONTENT_ROOT);
		urlParameters.set(GAME_CONFIG_CONTENT_ROOT, newParamValue);
	}

	chrome.tabs.sendMessage(activeTab.id, {
		type: CONFIG_INTERACTION,
		urlParameters: urlParameters.toString()
	});
}