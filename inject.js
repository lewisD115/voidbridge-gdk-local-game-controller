
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
            if (this._url && this._url.includes("play/api/portals") && this._url.includes("enter")) {

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
            }

        } catch (e) {
            console.error(e);
        }
    });

    return originalSend.call(this, body);
};