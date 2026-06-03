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


if (urlParameters.get(GAME_CONFIG_CONTENT_ROOT) != null) {
	toggleConfigElement.checked = true;
} else {
	toggleConfigElement.checked = false;
}


const currentClientMode = urlParameters.get(CLIENT_MODE);

if (currentClientMode != null) {

	if (currentClientMode == DESKTOP_HTML) {
		toggleClientElement.checked = false;
	} else if (currentClientMode == MOBILE_HTML) {
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
		if (urlParameters.get(GAME_CONFIG_CONTENT_ROOT) != null) {
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

document.getElementById("openSimulation").addEventListener("click", async () => {

    	// Open simulation button had been clicked on popup	
		// const allData = await chrome.storage.local.get(null);

        const data = await chrome.storage.local.get([
            "vbUserId",
            "vbPortalSessionId"
        ]);

        const userId = data.vbUserId;
        const portalSessionId = data.vbPortalSessionId;

        if (!userId || !portalSessionId) {
            alert("Could not find session data.");
            return;
        }

		// Open tab so that developer can set simulations for the exact portal session that's open
        const url =
            `https://vb-nightly.vbgames88.com/admin/#/users/${userId}/portal-sessions/${portalSessionId}/set-simulation`;

        chrome.tabs.create({ url });
    });	

async function refreshValues() {

    const data = await chrome.storage.local.get([
        "vbUserId",
        "vbPortalSessionId"
    ]);

    document.getElementById("userId").textContent =
        data.vbUserId ?? "-";

    document.getElementById("sessionId").textContent =
        data.vbPortalSessionId ?? "-";
}

refreshValues();

function showStatus(message) {
	const status = document.getElementById("status");

	status.textContent = message;

	clearTimeout(showStatus.timeout);
	showStatus.timeout = setTimeout(() => {
		status.textContent = "";
	}, 2000);
}

document.getElementById("copySymbols").addEventListener("click", async () => {
		const { symbols = [] } =
			await chrome.storage.local.get("symbols");

		await navigator.clipboard.writeText(
			symbols.join(" ")
		);
		showStatus("Copied symbols");

	});

document.getElementById("copyLineData").addEventListener("click", async () => {
	const { lineNumbers } =
		await chrome.storage.local.get("lineNumbers");

	// if (!lineNumbers) {
	// 	return;
	// }
	const hasLineNumbers = lineNumbers.lineNumbers?.length > 0;
	const hasPayoutGroups = lineNumbers.payoutIdGroup?.length > 0;

	const settings = [];

	if (hasLineNumbers) {
		const formattedLineNumbers = lineNumbers.lineNumbers
			.map(item => `{"betId":"${item.id}","number":${item.number}}`)
			.join(",\n\t\t\t");

		settings.push(
			`<Setting name="lineNumbers">
	<Config>\n\t{\n\t\t"value":[
\t\t\t${formattedLineNumbers}
\t\t]\n\t}\n\t</Config>
</Setting>`
		);
	}

	if (hasPayoutGroups) {
		const formattedPayoutGroups = lineNumbers.payoutIdGroup
			.map(item => `{"betId":"${item.betId}","groupBetId":"${item.groupBetId}"}`)
			.join(",\n\t\t\t");

		settings.push(
			`<Setting name="payoutIdGroup">
	<Config>\n\t{\n\t\t"value":[
\t\t\t${formattedPayoutGroups}
\t\t]\n\t}\n\t</Config>
</Setting>`
		);
	}

	// We already assume that there won't be payoutIdGroup if no lineNumbers
	if (!hasLineNumbers) {
		settings.push(
			`<Setting name="slotGameDecisionID">
	<Config>
		{
		"value": "bets"
		}
	</Config>
</Setting>

<Setting name="winType">
	<Config>
		{
		"value": "243Ways"
		}
	</Config>
</Setting>`
		);
	}

	await navigator.clipboard.writeText(
		`${settings.join("\n")}`
	);
	if (hasLineNumbers) {
		showStatus("Copied line data");
	} else {
		showStatus("Copied alternative 243 ways data");
	}
});