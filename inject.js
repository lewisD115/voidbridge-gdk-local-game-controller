//
// FETCH
//

const originalFetch = window.fetch;

window.fetch = async function (...args) {


    return originalFetch.apply(this, args);
};


const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {

    this._url = url;

    return originalOpen.call(this, method, url, ...rest);
};

XMLHttpRequest.prototype.send = function(body) {

    this.addEventListener("load", function() {

        try {
            // Find /enter file to get data to be used to open simulation webpage
            if (this._url && this._url.includes("play/api/portals")) {
                if (this._url.includes("enter")) {

                    const doc = this.response;

                    const enterResponse =
                        doc.querySelector("EnterPortalResponse");

                    if (enterResponse) {

                        const userId =
                            enterResponse.getAttribute("userId");

                        const portalSessionId =
                            enterResponse.getAttribute("sessionId");


                        window.postMessage({
                            type: "VB_SIM_DATA",
                            userId,
                            portalSessionId
                        });
                    }
                } else if (this._url.includes("init")) {
                    const doc = this.response;
                    // Get all symbols within init
                    const symbols = getSortedSymbols(doc);


                    window.postMessage({
                        type: "VB_SYMBOLS",
                        symbols
                    });

                    // Get line number data within init
                    const lineNumbers = getLineData(doc);

                    window.postMessage({
                        type: "VB_LINE_NUMBERS",
                        lineNumbers
                    });
                }
            }

        } catch (e) {
            console.error(e);
        }
    });

    return originalSend.call(this, body);
};

//
// Helpers
//

// Special symbols should be listed after normal symbols
function getPriority(symbol) {
    const lower = symbol.toLowerCase();

    if (lower === "scatter") {
        return 2; // always last
    }

    if (lower === "wild") {
        return 1; // before scatter
    }

    return 0; // normal symbols
}

// Get a list of symbols within a game
function getSortedSymbols(doc) {
    const symbolToLowestMultiplier = new Map();

    for (const payout of doc.querySelectorAll("payout")) {
        let symbol = payout.getAttribute("symbol");

        if (!symbol) {
            continue;
        }

        symbol = symbol.replace(/^@/, "");

        const multiplier = Number(
            payout.querySelector("award")?.getAttribute("multiplier")
        );

        const currentLowest =
            symbolToLowestMultiplier.get(symbol);

        if (
            currentLowest === undefined ||
            multiplier < currentLowest
        ) {
            symbolToLowestMultiplier.set(
                symbol,
                multiplier
            );
        }
    }

    return [...symbolToLowestMultiplier.entries()]
        .sort((a, b) => {
            const priorityDiff =
                getPriority(a[0]) - getPriority(b[0]);

            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            return a[1] - b[1];
        })
        .map(([symbol]) => symbol);
}

function getBetMappings(doc) {
    const groups = new Map();

    for (const mapping of doc.querySelectorAll(
        'gridMapping[id="betLines"] betMapping'
    )) {
        const betId = mapping.getAttribute("betId");
        const gridMappingId =
            mapping.getAttribute("gridMappingId");

        if (!betId || !gridMappingId) {
            continue;
        }

        if (!groups.has(gridMappingId)) {
            groups.set(gridMappingId, []);
        }

        groups.get(gridMappingId).push(betId);
    }

    return groups;
}

function getLineData(doc) {
    const groups = getBetMappings(doc);

    const lineNumbers = [];
    const payoutIdGroup = [];

    for (const [gridMappingId, betIds] of groups) {

        const number =
            Number(gridMappingId.match(/(\d+)$/)?.[1]);

        if (betIds.length === 1) {

            lineNumbers.push({
                id: betIds[0],
                number
            });

        } else {

            lineNumbers.push({
                id: gridMappingId,
                number
            });

            for (const betId of betIds) {
                payoutIdGroup.push({
                    betId,
                    groupBetId: gridMappingId
                });
            }
        }
    }

    return {
        lineNumbers,
        payoutIdGroup
    };
}