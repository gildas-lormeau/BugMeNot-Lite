/*
 * Copyright 2011 Gildas Lormeau
 * contact : gildas.lormeau <at> gmail.com
 * 
 * This file is part of BugMeNot Lite.
 *
 *   BugMeNot Lite is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   BugMeNot Lite is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with BugMeNot Lite.  If not, see <http://www.gnu.org/licenses/>.
 */

var autoHideDelayInput, neverAskFeedbackBlock, alwaysAutoSubmitInput, autoFeedbackDelayInput, maxSizeInput, minRatingInput, dontStoreVoteInput, neverVoteTwiceInput, deleteDatabaseInput;

function changeAutoFeedbackDelay(fast) {
	if (autoFeedbackDelayInput.value >= -1) {
		neverAskFeedbackBlock.style.pixelHeight = 140;
		neverAskFeedbackBlock.style.opacity = 1;
		if (!fast)
			neverAskFeedbackBlock.className = "open";
	} else {
		neverAskFeedbackBlock.style.pixelHeight = 0;
		neverAskFeedbackBlock.style.opacity = 0;
		if (!fast)
			neverAskFeedbackBlock.className = "close";
	}
};

neverAskFeedbackBlock = document.getElementById("neverAskFeedbackBlock");
autoHideDelayInput = document.getElementById("autoHideDelayInput");
alwaysAutoSubmitInput = document.getElementById("alwaysAutoSubmitInput");
autoFeedbackDelayInput = document.getElementById("autoFeedbackDelayInput");
maxSizeInput = document.getElementById("maxSizeInput");
minRatingInput = document.getElementById("minRatingInput");
dontStoreVoteInput = document.getElementById("dontStoreVoteInput");
neverVoteTwiceInput = document.getElementById("neverVoteTwiceInput");
deleteDatabaseInput = document.getElementById("deleteDatabaseInput");

document.getElementById("title").innerHTML = chrome.i18n.getMessage("optionsTitle");
document.getElementById("maxSizeLabel").innerHTML = chrome.i18n.getMessage("maxSize");
document.getElementById("minRatingLabel").innerHTML = chrome.i18n.getMessage("minRating");
document.getElementById("autoHideDelayLabel").innerHTML = chrome.i18n.getMessage("autoHideDelay");
document.getElementById("autoFeedbackDelayLabel").innerHTML = chrome.i18n.getMessage("autoFeedbackDelay");
document.getElementById("alwaysAutoSubmitLabel").innerHTML = chrome.i18n.getMessage("alwaysAutoSubmit");
document.getElementById("neverVoteTwiceLabel").innerHTML = chrome.i18n.getMessage("neverVoteTwice");
document.getElementById("dontStoreVoteLabel").innerHTML = chrome.i18n.getMessage("dontStoreVote");
document.getElementById("deleteDatabaseLabel").innerHTML = chrome.i18n.getMessage("deleteDatabase");
document.getElementById("deleteDatabaseInput").innerHTML = chrome.i18n.getMessage("deleteDatabaseInput");
maxSizeInput.options[0] = new Option(chrome.i18n.getMessage("maxSizeShowAll"), -1);
maxSizeInput.options[1] = new Option("50", 50);
maxSizeInput.options[2] = new Option("20", 20);
maxSizeInput.options[3] = new Option("10", 10);
maxSizeInput.options[4] = new Option("5", 5);
autoHideDelayInput.options[0] = new Option(chrome.i18n.getMessage("autoHideDelayNever"), -1);
autoHideDelayInput.options[1] = new Option(chrome.i18n.getMessage("autoHideDelay5s"), 5);
autoHideDelayInput.options[2] = new Option(chrome.i18n.getMessage("autoHideDelay10s"), 10);
autoHideDelayInput.options[3] = new Option(chrome.i18n.getMessage("autoHideDelay20s"), 20);
autoFeedbackDelayInput.options[0] = new Option(chrome.i18n.getMessage("autoFeedbackDelayNever"), -2);
autoFeedbackDelayInput.options[1] = new Option(chrome.i18n.getMessage("autoFeedbackDelayAfterSubmit"), -1);
autoFeedbackDelayInput.options[2] = new Option(chrome.i18n.getMessage("autoFeedbackDelay0s"), 0);
autoFeedbackDelayInput.options[3] = new Option(chrome.i18n.getMessage("autoFeedbackDelay5s"), 5);
autoFeedbackDelayInput.options[4] = new Option(chrome.i18n.getMessage("autoFeedbackDelay10s"), 10);
autoFeedbackDelayInput.options[5] = new Option(chrome.i18n.getMessage("autoFeedbackDelay20s"), 20);

autoHideDelayInput.value = config.autoHideDelay();
alwaysAutoSubmitInput.checked = config.alwaysAutoSubmit() == "alwaysAutoSubmit";
dontStoreVoteInput.checked = config.dontStoreVote() == "dontStoreVote";
neverVoteTwiceInput.checked = config.neverVoteTwice() == "neverVoteTwice";
autoFeedbackDelayInput.value = config.autoFeedbackDelay();
maxSizeInput.value = config.maxSize();
minRatingInput.value = config.minRating();
if (config.dynPopupUnvailable)
	document.getElementById("autoFeedbackDelayBlock").style.display = "none";
autoFeedbackDelayInput.onchange = function() {
	changeAutoFeedbackDelay();
};
changeAutoFeedbackDelay(true);

autoHideDelayInput.addEventListener("change", function() {
	localStorage["autoHideDelay"] = autoHideDelayInput.value;
}, false);
alwaysAutoSubmitInput.addEventListener("change", function() {
	localStorage["alwaysAutoSubmit"] = alwaysAutoSubmitInput.checked ? "alwaysAutoSubmit" : "";
}, false);
autoFeedbackDelayInput.addEventListener("change", function() {
	localStorage["autoFeedbackDelay"] = autoFeedbackDelayInput.value;
}, false);
maxSizeInput.addEventListener("change", function() {
	localStorage["maxSize"] = maxSizeInput.value;
}, false);
minRatingInput.addEventListener("change", function() {
	localStorage["minRating"] = minRatingInput.value;
}, false);
dontStoreVoteInput.addEventListener("change", function() {
	localStorage["dontStoreVote"] = dontStoreVoteInput.checked ? "dontStoreVote" : "";
}, false);
neverVoteTwiceInput.addEventListener("change", function() {
	localStorage["neverVoteTwice"] = neverVoteTwiceInput.checked ? "neverVoteTwice" : "";
}, false);
deleteDatabaseInput.addEventListener("click", function() {
	accountStorage.reset();
}, false);
document.getElementById('main').style.display = 'block';
