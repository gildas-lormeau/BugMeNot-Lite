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
var addAccountLink = document.getElementById("addAccountLink");

function getUrlParams() {
	var i, ret = {}, urlParams = window.location.search.substr(1).split('&'), value;
	for (i = 0; i < urlParams.length; i++) {
		value = urlParams[i].split('=');
		ret[value[0]] = value[1];
	}
	return ret;
}

function addAccount() {
	chrome.extension.getBackgroundPage().submitFeeedBack({
		tabId : parseInt(params.tabId, 10),
		addAccount : true
	});
	close();
}

addAccountLink.addEventListener("click", addAccount, false);
addAccountLink.innerHTML = chrome.i18n.getMessage("addAccount");