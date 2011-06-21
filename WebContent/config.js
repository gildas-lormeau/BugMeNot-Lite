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

var config = {
	dynPopupUnvailable : !chrome.pageAction.setPopup,
	autoHideDelay : function() {
		return parseInt(window.localStorage["autoHideDelay"], 10) || -1;
	},
	alwaysAutoSubmit : function() {
		return window.localStorage["alwaysAutoSubmit"] || "";
	},
	autoFeedbackDelay : function() {
		return parseInt(window.localStorage["autoFeedbackDelay"], 10) || (config.dynPopupUnvailable ? -2 : -1);
	},
	maxSize : function() {
		return parseInt(window.localStorage["maxSize"], 10) || -1;
	},
	minRating : function() {
		return parseInt(window.localStorage["minRating"], 10) || 0;
	},
	dontStoreVote : function() {
		return window.localStorage["dontStoreVote"];
	},
	neverVoteTwice : function() {
		return window.localStorage["neverVoteTwice"];
	}
};