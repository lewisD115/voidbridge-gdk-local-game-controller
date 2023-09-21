import {GAME_CONFIG_CONTENT_ROOT, GAME_CLIENT_CONTENT_ROOT, CLIENT_MODE, 
	CONFIG_INTERACTION, DESKTOP_HTML, MOBILE_HTML} from './utils/globalStrings.js';


const toggleConfigElement = document.getElementById("gameConfigToggle");
const toggleClientElement = document.getElementById("mobileClientToggle");

const activeTab = await getActiveTab();


if(activeTab.url.includes("vbgames88.com/play/portals/")) {

}
else {
	window.close();
}


//check if url is voidbridge

const queryParameters =  getUrlParams();

const urlParameters = new URLSearchParams(queryParameters);


if(urlParameters.get(GAME_CONFIG_CONTENT_ROOT) != null) {
	toggleConfigElement.checked = true;
} else {
	toggleConfigElement.checked = false;
}


const currentClientMode = urlParameters.get(CLIENT_MODE);

if(currentClientMode != null) {

	if(currentClientMode == DESKTOP_HTML)
	{
		toggleClientElement.checked = false;
	}
	else if (currentClientMode == MOBILE_HTML)
	{
		toggleClientElement.checked = true;
	}
}

toggleConfigElement.addEventListener('change', toggleConfig);
toggleClientElement.addEventListener('change', toggleClient);


async function getActiveTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

function getUrlParams() {
	const params = activeTab.url.split("?")[1];
	return params;
}

//Toggle to use the local game client
async function toggleConfig(event) {
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

//Toggle the client between desktop and mobile
async function toggleClient(event) {
	const activeTab = await getActiveTab();

	let clientParamValue = DESKTOP_HTML;

	if (event.target.checked) {
		clientParamValue = MOBILE_HTML
	}

	urlParameters.set(CLIENT_MODE, clientParamValue);

	chrome.tabs.sendMessage(activeTab.id, {
		type: CONFIG_INTERACTION,
		urlParameters: urlParameters.toString()
	});
}