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

var tabs = {};

/**
 * TabData constructor.
 * 
 * @param tabId
 */
function TabData(tabId) {
	this.accounts = [];
	this.hosts = [];
	this.ports = {};
	this.currentIndex = 0;
	this.autoSubmit = false;
	this.displayPopup = false;
	this.noFeedback = false;
	this.noSiteFeedback = false;
	this.timerHide = {};
	this.timerLastActivity = {};
	this.notBlocked = false;
	this.forceSetAccount = false;
	this.tabIndex = 0;
	this.index = 0;
	this.submit = false;
	this.id = tabId;
}

TabData.prototype = new Object();

/**
 * Clear the auto hide timer.
 */
TabData.prototype._clearAutoHideTimer = function() {
	if (this.timerHide) {
		clearTimeout(this.timerHide);
		this.timerHide = null;
	}
};

/**
 * Set the auto hide timer.
 */
TabData.prototype._setAutoHideTimer = function() {
	var that = this;
	if (config.autoHideDelay() != -1) {
		this._clearAutoHideTimer();
		this.timerHide = setTimeout(function() {
			if (!that.displayPopup)
				that._hideIcon();
			that.timerHide = null;
		}, config.autoHideDelay() * 1000);
	}
};

/**
 * Set the auto feedback timer.
 */
TabData.prototype._setAutoFeedbackTimer = function() {
	var that = this;
	if (config.autoFeedbackDelay() > -1 && !config.dynPopupUnvailable && !this.noFeedback && !this.noSiteFeedback) {
		if (this.timerLastActivity) {
			clearTimeout(this.timerLastActivity);
			this.timerLastActivity = null;
		}
		this.timerLastActivity = setTimeout(function() {
			that.displayPopup = true;
			that._showFeedbackIcon();
			that.timerLastActivity = null;
		}, config.autoFeedbackDelay() * 1000);
	}
};

/**
 * Show BugMeNot icon.
 */
TabData.prototype._showIcon = function() {
	if (!this.displayPopup) {
		this._hideIcon();
		if (!config.dynPopupUnvailable)
			chrome.pageAction.setPopup( {
				tabId : this.id,
				popup : ""
			});
		chrome.pageAction.show(this.id);
		this._setAutoHideTimer();
		if (this.notBlocked) {
			if (this.accounts.length)
				chrome.pageAction.setIcon( {
					tabId : this.id,
					path : chrome.extension.getURL("icon_48.png")
				});
			else
				chrome.pageAction.setIcon( {
					tabId : this.id,
					path : chrome.extension.getURL("iconPlus.png")
				});
			chrome.pageAction.setTitle( {
				tabId : this.id,
				title : this.accounts.length + " "
						+ (this.accounts.length > 1 ? chrome.i18n.getMessage("accounts") : chrome.i18n.getMessage("account"))
			});
		} else {
			chrome.pageAction.setIcon( {
				tabId : this.id,
				path : chrome.extension.getURL("iconBlocked.png")
			});
			chrome.pageAction.setTitle( {
				tabId : this.id,
				title : chrome.i18n.getMessage("blockedSite")
			});
		}
		if (this.accounts.length == 0 && this.notBlocked && !config.dynPopupUnvailable) {
			chrome.pageAction.setPopup( {
				tabId : this.id,
				popup : "popupDef.html?tabId=" + this.id
			});
		}
		if (this.forceSetAccount)
			this._setAccount(this.id);
	}
};

/**
 * Show BugMeNot feedback icon.
 */
TabData.prototype._showFeedbackIcon = function() {
	var that = this;
	if (this.displayPopup) {
		accountStorage.get( [ this.accounts[this.currentIndex] ], function(accounts) {
			if ((!accounts.length && config.neverVoteTwice()) || !config.neverVoteTwice()) {
				that._hideIcon();
				chrome.pageAction.setIcon( {
					tabId : that.id,
					path : chrome.extension.getURL("iconFeedback.png")
				});
				chrome.pageAction.show(that.id);
				that._setAutoHideTimer();
				chrome.pageAction.setPopup( {
					tabId : that.id,
					popup : "popup.html?tabId=" + that.id + "&login=" + encodeURI(that.accounts[that.currentIndex].login) + "&password="
							+ encodeURI(that.accounts[that.currentIndex].password) + "&autoSubmit="
							+ (that.autoSubmit || config.alwaysAutoSubmit() ? "yes" : "no")
				});
			} else
				that.displayPopup = false;
		});
	}
};

/**
 * Hide BugMeNot icon.
 */
TabData.prototype._hideIcon = function() {
	chrome.pageAction.hide(this.id);
	this._clearAutoHideTimer();
};

/**
 * Parse accounts data from HTML.
 * 
 * @param {String} htmlText
 */
TabData.prototype._parseAccounts = function(htmlText) {
	var range, parsedHTML, loginNodes, passwordNodes, statsNodes, loginIds, hostIds, i;
	range = document.createRange();
	range.selectNode(document.body);
	parsedHTML = range.createContextualFragment(htmlText);
	loginNodes = parsedHTML.querySelectorAll(".account tr:nth-child(1) td");
	if (loginNodes.length) {
		hostIds = parsedHTML.querySelectorAll(".account input:nth-child(2)");
		loginIds = parsedHTML.querySelectorAll(".account input:nth-child(1)");
		passwordNodes = parsedHTML.querySelectorAll(".account tr:nth-child(2) td");
		statsNodes = parsedHTML.querySelectorAll(".account tr:nth-child(4) td");
		for (i = 0; i < loginNodes.length; i++)
			if (loginNodes[i].textContent && passwordNodes[i].textContent && !this.accounts.some(function(element, index, array) {
				return element.login == loginNodes[i].textContent;
			})) {
				this.accounts.push( {
					login : loginNodes[i].textContent,
					password : passwordNodes[i].textContent,
					rating : parseInt(statsNodes[i].textContent.split("%")[0], 10),
					loginId : loginIds[i].value,
					hostId : hostIds[i].value
				});
			}
	}
};

/**
 * Request accounts data on bugmenot.com.
 * 
 * @param {String} host
 * @return
 */
TabData.prototype._requestAccounts = function(host) {
	var request = new XMLHttpRequest(), blocked, that = this;
	request.onreadystatechange = function() {
		var hosts;
		if (request.readyState == 4) {
			if (request.status == 200 || request.status == 404) {
				blocked = request.status == 404 && request.responseText.toLowerCase().indexOf("blocked") != -1;
				if (request.status != 404)
					that._parseAccounts(request.responseText);
				if (request.status == 200 || !blocked)
					that.hosts.push(host);
				that.notBlocked = !blocked;
				hosts = host.split(".");
				if (hosts[0] == "www")
					hosts.shift();
				if (hosts.length > 2)
					that._requestAccounts(host.substr(host.indexOf('.') + 1));
				else
					accountStorage.get(that.accounts, function(trustedAccounts) {
						var trustedYes = [];
						that.accounts = that.accounts
								.filter(function(account) {
									var foundYes = false, i = 0;
									while (i < trustedAccounts.length && !foundYes) {
										if (trustedAccounts.item(i).hostId == account.hostId
												&& trustedAccounts.item(i).loginId == account.loginId) {
											if (trustedAccounts.item(i).vote == "Y") {
												account.trustedYes = true;
												foundYes = true;
											} else
												account.trustedNo = true;
										}
										i++;
									}
									if (foundYes)
										trustedYes.unshift(account);
									return !foundYes;
								});
						that.accounts.sort(function(a, b) {
							return !a.trustedNo && b.trustedNo ? -1 : a.trustedNo && !b.trustedNo ? 1 : a.rating > b.rating ? -1
									: a.rating < b.rating ? 1 : a.login < b.login ? -1 : a.login > b.login ? 1 : 0;
						});
						if (config.maxSize() != -1 && that.accounts.length > config.maxSize())
							that.accounts.length = config.maxSize();
						if (config.minRating())
							that.accounts = that.accounts.filter(function(account) {
								return account.rating >= config.minRating();
							});
						trustedYes.forEach(function(account) {
							that.accounts.unshift(account);
						});
						if (config.maxSize() != -1 && that.accounts.length > config.maxSize())
							that.accounts.length = config.maxSize();
						that._showIcon();
					});
			}
		}
	};
	request.open('GET', 'http://www.bugmenot.com/view/' + host + '?utm_source=extension&utm_medium=firefox', true);
	request.send(null);
};

/**
 * Notify content script to set accounts data.
 */
TabData.prototype._setAccount = function() {
	var portId;
	if (this.accounts.length) {
		for (portId in this.ports)
			this.ports[portId].postMessage( {
				setAccount : true,
				account : this.accounts[this.index],
				accounts : this.accounts,
				autoSubmit : this.autoSubmit
			});
		this.currentIndex = this.index;
		this.index = (this.index + 1) % this.accounts.length;
	}
};

/**
 * Set host and port.
 * 
 * @param {String} host
 * @param {Port} port
 * @param {Boolean} forceSetAccount
 */
TabData.prototype.onSearchAccounts = function(host, port, forceSetAccount) {
	if (this.hosts.indexOf(host) == -1) {
		this.hosts = [];
		this.noSiteFeedback = false;
		this.accounts = [];
		this.index = 0;
		this.currentIndex = 0;
		this.ports = {};
		this.ports[port.portId_] = port;
		this.tabIndex = port.sender.tab.index;
		this.forceSetAccount = false;
		this.notBlocked = false;
		this._requestAccounts(host);
	} else {
		this.forceSetAccount = forceSetAccount;
		if (forceSetAccount && this.currentIndex == this.index)
			this.index = (this.index + 1) % this.accounts.length;
		this.ports[port.portId_] = port;
		this._showIcon();
	}
};

/**
 * Set current account index.
 * 
 * @param {Number} index
 */
TabData.prototype.onSelectIndex = function(index) {
	this.submit = false;
	this.index = index;
	this.currentIndex = index;
	this._setAutoFeedbackTimer();
	this._setAutoHideTimer();
};

/**
 * Update tab state and show the feedback icon.
 * 
 * @param {Number} index
 */
TabData.prototype.onSubmitForm = function(index) {
	if (!this.submit) {
		this.index = index;
		this.currentIndex = index;
		this.submit = true;
		if (!config.dynPopupUnvailable && !this.noFeedback && !this.noSiteFeedback && config.autoFeedbackDelay() == -1) {
			this.displayPopup = true;
			this._showFeedbackIcon();
		}
	}
};

/**
 * Launch action asked by popup.
 * 
 * @param {Number} tabIndex
 * @param {Message} msg
 */
TabData.prototype.onSubmitFeedback = function(tabIndex, msg) {
	var portId, request;
	this.tabIndex = tabIndex;
	if (msg.vote) {
		this._hideIcon();
		this.displayPopup = false;
		this.autoSubmit = msg.autoSubmit;
		request = new XMLHttpRequest();
		request.open('GET', 'http://www.bugmenot.com/vote_ajax.php?id=' + this.accounts[this.currentIndex].loginId + '&site='
				+ this.accounts[this.currentIndex].hostId + '&vote=' + msg.vote, true);
		request.send(null);
		if (!config.dontStoreVote())
			accountStorage.add(this.accounts[this.currentIndex].loginId, this.accounts[this.currentIndex].hostId, msg.vote);
		this.accounts[this.currentIndex].trustedYes = msg.vote == "Y";
		this.accounts[this.currentIndex].trustedNo = msg.vote == "N";
		if (msg.vote == "N") {
			this._setAutoFeedbackTimer();
			this._setAutoHideTimer();
			this.submit = false;
			for (portId in this.ports)
				this.ports[portId].postMessage( {
					init : true,
					forceSetAccount : true
				});
		}
	} else if (msg.openAccount)
		chrome.tabs.create( {
			index : this.tabIndex + 1,
			url : 'http://www.bugmenot.com/view/' + encodeURI(this.hosts[0]),
			selected : false
		});
	else if (msg.addAccount)
		chrome.tabs.create( {
			index : this.tabIndex + 1,
			url : "http://www.bugmenot.com/submit.php?" + encodeURI(this.hosts[0]),
			selected : false
		});
	else {
		if (msg.noFeedback || msg.noSiteFeedback || msg.cancel) {
			this.displayPopup = false;
			this.submit = false;
			this._showIcon();
		}
		if (msg.noFeedback)
			this.noFeedback = true;
		else if (msg.noSiteFeedback)
			this.noSiteFeedback = true;
	}
};

/**
 * Show feedback icon if needed and send "init" action message to content
 * script.
 * 
 * @param {Port} port
 * @param {Boolean} topWindow
 */
TabData.prototype.onInit = function(port, topWindow) {
	if (topWindow && config.autoFeedbackDelay() == -1)
		this._showFeedbackIcon();
	port.postMessage( {
		init : true,
		forceSetAccount : this.submit
	});
	this.submit = false;
};

/**
 * Show optional contextual popup or fill account.
 */
TabData.prototype.onClick = function() {
	if (this.accounts.length == 0) {
		if (this.notBlocked) {
			if (!config.dynPopupUnvailable) {
				chrome.pageAction.setPopup( {
					tabId : this.id,
					popup : "popupDef.html?tabId=" + this.id
				});
			} else {
				chrome.tabs.create( {
					index : this.tabIndex + 1,
					url : 'http://www.bugmenot.com/view/' + encodeURI(this.hosts[0]),
					selected : false
				});
			}
		}
	} else {
		this.submit = false;
		this._setAccount();
		this._clearAutoHideTimer();
		this._setAutoFeedbackTimer();
		this._setAutoHideTimer();
	}
};

/**
 * Call TabData.onSubmitFeedback for the right tab.
 * 
 * @param {Object} msg
 */
function submitFeeedBack(msg) {
	chrome.tabs.get(msg.tabId, function(tab) {
		tabs[msg.tabId].onSubmitFeedback(tab.index, msg);
	});
}

chrome.pageAction.onClicked.addListener(function(tab) {
	tabs[tab.id].onClick();
});

chrome.extension.onConnect.addListener(function(port) {
	port.onDisconnect.addListener(function(msg) {
		if (port.sender.tab && tabs[port.sender.tab.id])
			delete tabs[port.sender.tab.id].ports[port.portId_];
	});

	port.onMessage.addListener(function(msg) {
		var tabId = port.sender.tab.id, tabData = tabs[tabId];
		if (msg.init) {
			if (tabData)
				tabData.onInit(port, msg.topWindow);
			else
				port.postMessage( {
					init : true
				});
		} else if (msg.searchAccounts) {
			if (!tabData) {
				tabData = new TabData(tabId);
				tabs[tabId] = tabData;
			}
			tabData.onSearchAccounts(msg.host, port, msg.forceSetAccount);
		} else if (msg.selectIndex)
			tabData.onSelectIndex(msg.index);
		else if (msg.submitForm)
			tabData.onSubmitForm(msg.index);
	});
});