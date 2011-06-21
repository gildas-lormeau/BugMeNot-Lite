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

var params = getUrlParams();

function getUrlParams() {
	var i, ret = {}, urlParams = window.location.search.substr(1).split('&'), value;
	for (i = 0; i < urlParams.length; i++) {
		value = urlParams[i].split('=');
		ret[value[0]] = value[1];
	}
	return ret;
}

function answerNo() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		autoSubmit : document.getElementById("autoSubmit").checked,
		vote : "N",
		tabId : parseInt(params.tabId, 10)
	});	
	close();
}
function answerYes() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		vote : "Y",
		tabId : parseInt(params.tabId, 10)
	});
	close();
}
function answerNoFeedback() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		tabId : parseInt(params.tabId, 10),
		noFeedback : true
	});
	close();
}
function answerCancel() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		tabId : parseInt(params.tabId, 10),
		cancel : true
	});
	close();
}
function answerNoSiteFeedback() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		tabId : parseInt(params.tabId, 10),
		noSiteFeedback : true
	});
	close();
}
function addAccount() {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		tabId : parseInt(params.tabId, 10),
		addAccount : true
	});
	close();
}
function openAccount(closePopup) {
	chrome.extension.getBackgroundPage().submitFeeedBack({		
		tabId : parseInt(params.tabId, 10),
		openAccount : true
	});	
	if (closePopup)
		close();
}
function load() {
	document.getElementById("login").innerHTML = decodeURI(params.login);
	document.getElementById("login").title = chrome.i18n.getMessage("password") + ' : "' + decodeURI(params.password) + '"';
	document.getElementById("autoSubmit").checked = params.autoSubmit == "yes";
	
	document.getElementById("questionPart1").innerHTML = chrome.i18n.getMessage("questionPart1");
	document.getElementById("questionPart2").innerHTML = chrome.i18n.getMessage("questionPart2");
	document.getElementById("yes").innerHTML = chrome.i18n.getMessage("yes");
	document.getElementById("no").innerHTML = chrome.i18n.getMessage("no");
	document.getElementById("autoSubmitLabel").innerHTML = chrome.i18n.getMessage("autoSubmit");
	document.getElementById("noFeedbackInput").innerHTML = chrome.i18n.getMessage("noFeedback");
	document.getElementById("tabNoFeedbackInput").innerHTML = chrome.i18n.getMessage("tabNoFeedback");
	document.getElementById("siteNoFeedbackInput").innerHTML = chrome.i18n.getMessage("siteNoFeedback");
	document.getElementById("addAccountLink").innerHTML = chrome.i18n.getMessage("addAccount");
}

function loadDef() {
	document.getElementById("noAvailableAccounts").innerHTML = chrome.i18n.getMessage("noAvailableAccounts");
	document.getElementById("addAccountLink").innerHTML = chrome.i18n.getMessage("addAccount");	
}