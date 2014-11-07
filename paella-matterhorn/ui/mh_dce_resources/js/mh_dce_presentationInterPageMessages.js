/**
* mh_dce_presentationInterPageMessages.js adapted from presentationInterPageMessages.js
*
* Originally used by DVD Index page to accept and process child and sibling iframe requests. Prevents
* cross-site scripting errors in Chrome where iframes are forbidden to access
* the parent DOM. Created 2-2-2012, KDolan
* 
* Adopted for MH Paella iframe communication 10-29-2014 KDolan
*/

// Maps Message requests to functions
// Example:
// SynchVideo: {"request": "syncVideo", "args": {"part":"2","seconds": "2"}}
// Change Slide: {"request":"changeIframe", "args": {"iframeId": "materials",
// "url": "file:///D:/presentations/L02/materials/slideFrame005.html"}}
// SeriesId: {"data":"series", "args": {"id": "20140119999", "title": "Spring Test Course", "url"}}
function messageHandler(argJSON) {
    // A collection of available functions for inbound messages
    var msgFunctionMap = new Object();
    msgFunctionMap.removeMatBorder = removeBeard;
    msgFunctionMap.restoreMatBorder = restoreBeard;
    msgFunctionMap.syncVideo = synchroVideo;
    msgFunctionMap.changeIframe = changeIframe;
    
    try {
        var jsonObj = JSON.parse(argJSON.data);
        msgFunctionMap[jsonObj.request](argJSON, jsonObj.args);
    }
    catch (err) {
        console.log("IGNORING MESSAGE, Request not supported: " + argJSON.data + ", from " + argJSON.source);
    }
};

// To hold original border width
var matBorderWidth;

// remove materials iframe border if it exists
var removeBeard = function (jsonMsg, argObj) {
    var matFrame = document.getElementById("materials");
    if (matFrame != null) {
        matBorderWidth = matFrame.style.borderWidth;
        matFrame.style.borderWidth = '0px';
    }
    // Otherwise, pass message up
    else if (window.parent && window.parent.postMessage) {
            window.parent.postMessage(jsonMsg.data, "*");
    }
};

// give back original materials iframe border-width
var restoreBeard = function (jsonMsg, argJSON) {
    var matFrame = document.getElementById("materials");
    if ((matFrame != null) && (matBorderWidth != null)) {
        matFrame.style.borderWidth = matBorderWidth;
    }
    // Otherwise, pass message up
    else if (window.parent && window.parent.postMessage) {
            window.parent.postMessage(jsonMsg.data, "*");
    }
};

//Call to local player to syncronize video
//Pass request down into left iFrame
var synchroVideo = function (jsonMsg, argObj) {
    if ((argObj) && ! isNaN(argObj.seconds) && ! isNaN(argObj.part)) {
        // Test if player is embedded in local div or object tag
        var jumpViewer = document.getElementById("flashContent1");
        if (jumpViewer != null) {
            jumpViewer.synchronizeVideo(argObj.part, argObj.seconds);
        }
        // otherwise, try pass as HTML5 message into left iframe doc 
        else if ($("#left").length > 0) {
            $("#left")[0].contentWindow.postMessage(jsonMsg.data, "*");
        }
    }
};

// Call to change an iframes URL
var changeIframe = function (jsonMsg, argObj) {
    console.log("LOG: iframe: " + argObj.iframeId + ", new url: " + argObj.url);
    if ((argObj) && (argObj.iframeId) && (argObj.url)) {
        // if Materials is an iframe
        var materials = document.getElementById(argObj.iframeId);
        // if Materials is in separate Window
        if (materials != null) {
            try {
                if (materials.location.href) {
                    materials.location.href = argObj.url;
                } else {
                    materials.src = argObj.url;
                }
            }
            catch (e) {
                materials.src = argObj.url;
            }
        }
    }
};

// Listener for child messages
if (window.addEventListener) {
    window.addEventListener("message", messageHandler, true);
}
