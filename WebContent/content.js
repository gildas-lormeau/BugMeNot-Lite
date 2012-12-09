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

var port = chrome.extension.connect(), formsData = new FormsData();

/**
 * Hack to fire a fake submit event when HTMLFormElement.submit method is used.
 */
function _injectSubmitScript() {
	var functionScript = document.getElementById("__bmn_injectSubmitHookFn__");
	function __bmn_injectSubmitHook__() {
		Array.prototype.forEach.call(arguments, function(i) {
			var form = document.forms[i], submitFunction = form.submit;
			if (!submitFunction || (typeof (submitFunction) == "function" && submitFunction.name != "__bmn_submitHook__")) {
				form.submit = function __bmn_submitHook__() {					
					var submitEvent = document.createEvent('Event');
					submitEvent.initEvent('submit', true, true);
					form.dispatchEvent(submitEvent);
					return submitFunction ? submitFunction.call(form) : true;
				};
			}
		});
	}
	if (formsData.getFormsIndex().length) {
		if (!functionScript) {
			functionScript = document.createElement("script");
			functionScript.setAttribute("type", "text/javascript");
			functionScript.id = "__bmn_injectSubmitHookFn__";
			functionScript.innerHTML = __bmn_injectSubmitHook__.toString();
			document.head.appendChild(functionScript);
		}
	}
}

/**
 * FormData constructor.
 * 
 * @param {HTMLFormElement} form
 * @param {HTMLInputElement} loginInput
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} submitInput
 */
function FormData(form, index, loginInput, passwordInput, submitInput) {
	this.form = form;
	this.index = index;
	this.loginInput = loginInput;
	this.passwordInput = passwordInput;
	this.submitInput = submitInput;
}

/**
 * Notify form submit to background page
 * 
 * @param {HTMLSelectElement} loginSelect
 */
FormData.prototype._notifySubmitForm = function() {
	port.postMessage( {
		submitForm : true,
		index : this.loginSelect.selectedIndex,
		login : this.loginSelect.value
	});
	formsData.submit = true;
};

/**
 * Initialize the login HTMLSelectElement element.
 * 
 * @param {Array} accounts
 */
FormData.prototype._initLoginSelect = function(accounts) {
	var option, that = this, style, property, value;
	function selectOnchange() {
		if (that.loginSelect.value) {
			that.loginInput.value = that.loginSelect.value;
			that.passwordInput.value = that.loginSelect.options[that.loginSelect.selectedIndex].password;
			port.postMessage( {
				selectIndex : true,
				index : that.loginSelect.selectedIndex
			});
		} else {
			that.loginSelect.parentElement.removeChild(this);
			that.loginInput.style.display = "inline-block";
			that.loginInput.value = "";
			that.passwordInput.value = "";
			that.loginInput.focus();
		}
	}
	Array.prototype.forEach.call(this.loginInput.attributes, function(attribute) {
		if (attribute.name != "name" && attribute.name != "id")
			that.loginSelect.setAttribute(attribute.name, attribute.value);
	});
	style = getComputedStyle(that.loginInput);
	for (property in style) {
		if (style[property] != "-webkit-appearance" && style[property] != "white-space") {
			value = style.getPropertyCSSValue(style[property]);
			if (value)
				that.loginSelect.style[style[property]] = value.cssText;
		}
	}
	accounts.forEach(function(account) {
		option = new Option("(" + account.rating + "%) - " + account.login, account.login, true);
		that.loginSelect.options[that.loginSelect.options.length] = option;
		option = that.loginSelect.options[that.loginSelect.options.length - 1];
		option.password = account.password;
		if (account.trustedYes)
			option.style.backgroundColor = "#a9dea2";
		else if (account.trustedNo)
			option.style.backgroundColor = "#dea2ad";
	});
	option = new Option("", "");
	option.disabled = true;
	this.loginSelect.options[this.loginSelect.options.length] = option;
	option = new Option(">> " + chrome.i18n.getMessage("manualLogin"), "");
	option.style.backgroundColor = "#dddddd";
	this.loginSelect.options[this.loginSelect.options.length] = option;
	this.loginSelect.onchange = selectOnchange;
	this.loginSelect.onfocus = null;
	this.loginSelect.size = 1;	
};

/**
 * Put select element and hide login element in all login forms.
 * 
 * @param {Object} account
 * @param {Array} accounts
 */
FormData.prototype.init = function(account, accounts) {
	var that = this;
	location.href= "javascript:__bmn_injectSubmitHook__(" + formsData.getFormsIndex().join(",") + ");";
	if (!this.loginSelect) {
		this.loginSelect = document.createElement("select");
		this._initLoginSelect(accounts);
		this.form.addEventListener("submit", function() {
			if (that.loginSelect.offsetWidth)
				that._notifySubmitForm();
		});
		if (this.submitInput)
			this.submitInput.addEventListener("click", function() {
				if (that.loginSelect.offsetWidth)
					that._notifySubmitForm();
			}, false);
	}
	if (!this.loginSelect.offsetWidth) {
		this.loginInput.parentNode.insertBefore(this.loginSelect, this.loginInput);
		this.loginInput.style.display = "none";
	}
	this.loginSelect.value = account.login;
	this.loginInput.value = account.login;
	this.passwordInput.value = account.password;
	this.loginSelect.focus();
};

/**
 * Submit login form.
 */
FormData.prototype.submit = function() {
	var fakeSubmitInput;
	this._notifySubmitForm();
	this.loginInput.value = this.loginSelect.value;
	this.passwordInput.value = this.loginSelect.options[this.loginSelect.selectedIndex].password;
	if (this.submitInput != null && this.submitInput.name == "submit") {
		fakeSubmitInput = document.createElement("input");
		Array.prototype.forEach.call(this.submitInput.attributes, function(attribute) {
			fakeSubmitInput.setAttribute(attribute.name, attribute.value);
		});
		fakeSubmitInput.type = "hidden";
		this.submitInput.parentNode.appendChild(fakeSubmitInput);
		this.submitInput.setAttribute("name", "");
	}
	HTMLFormElement.prototype.submit.call(this.form);
};

/**
 * FormsData constructor.
 */
function FormsData() {
	this.forms = [];
	this.submit = false;
	this.deferredPrepare = null;
};

/**
 * Find login form elements (i.e. login, password and and optional submit).
 * 
 * @param {NodeList} forms
 */
FormsData.prototype._findFormElements = function(forms) {
	var passwordInput, loginInput, submitInput, elements, element, i, j, passwordIndex, visibleElementIndex;
	for (i = 0; i < forms.length; i++) {
		elements = forms[i].elements;
		passwordInput = null;
		loginInput = null;
		submitInput = null;
		visibleElementIndex = 0;
		passwordIndex = 0;
		for (j = elements.length - 1; j >= 0 && !(passwordInput && loginInput); j--) {
			element = elements[j];
			if (!passwordInput && !loginInput && !submitInput && element.type == "submit")
				submitInput = element;
			if (!passwordInput) {
				if (element.type == "password") {
					passwordIndex = visibleElementIndex;
					passwordInput = element;
				}
			} else if (element.type == "password" && (passwordIndex + 1 == visibleElementIndex))
				passwordInput = null;
			else if (passwordInput && (!element.type || element.type == "text" || element.type == "email"))
				loginInput = element;
			if (element.type != "hidden")
				visibleElementIndex++;
		}
		if (passwordInput && loginInput) {
			if (!submitInput) {
				elements = forms[i].querySelectorAll("input, button");
				for (j = elements.length - 1; j >= 0 && !submitInput; j--) {
					element = elements[j];
					if (element.outerHTML.toLowerCase().indexOf("submit") != -1 && element.type != "hidden")
						submitInput = element;
				}
			}
			if (!submitInput) {
				elements = forms[i].querySelectorAll("input, button, a");
				for (j = elements.length - 1; j >= 0 && !submitInput; j--) {
					element = elements[j];
					if (element.outerHTML.toLowerCase().match(/log|submit|sign/i))
						submitInput = element;
				}
			}			
			j = 0;
			while (j < this.forms.length && this.forms[j].loginInput != loginInput && this.forms[j].passwordInput != passwordInput
					&& this.forms[j].submitInput != submitInput)
				j++;
			if (j == this.forms.length)
				this.forms.push(new FormData(forms[i], i, loginInput, passwordInput, submitInput));
		}
	}
	_injectSubmitScript();
};

/**
 * Set account data into login and password elements.
 * 
 * @param {Object} account
 * @param {Array} accounts
 * @param {Boolean} autoSubmit
 */
FormsData.prototype.init = function(account, accounts, autoSubmit) {
	this.submit = false;
	if (account) {
		this._findFormElements(document.forms);
		this.forms.forEach(function(form) {
			form.init(account, accounts);
		});
		if (this.forms[0] && autoSubmit)
			this.forms[0].submit();
	}
};

/**
 * Initialize content script.
 * 
 * @param {Boolean} forceSetAccount
 */
FormsData.prototype.prepare = function(forceSetAccount) {
	this._findFormElements(document.forms);
	if (this.forms.length)
		port.postMessage( {
			searchAccounts : true,
			host : encodeURIComponent(location.host),
			forceSetAccount : forceSetAccount
		});
};

/**
 * Return submit forms index.
 * 
 * @return {Array} array of index
 */
FormsData.prototype.getFormsIndex = function() {
	return this.forms.map(function(form) {
		return form.index;
	});
};

port.onMessage.addListener(function(msg) {
	if (msg.setAccount)
		formsData.init(msg.account, msg.accounts, msg.autoSubmit);
	else if (msg.init)
		formsData.prepare(msg.forceSetAccount, msg.autoSubmit);
});

document.addEventListener('keypress', function(event) {
	if (event.ctrlKey && event.charCode == 9)
		formsData.prepare(true);
}, true);

document.addEventListener("DOMNodeInsertedIntoDocument", function(event) {
	if (!formsData.deferredPrepare && event.target && event.target.tagName
			&& (event.target.tagName.toLowerCase() == "form" || event.target.tagName.toLowerCase() == "input"))
		formsData.deferredPrepare = setTimeout(function() {
			formsData.prepare(formsData.submit);
			formsData.submit = false;
			formsData.deferredPrepare = null;
		}, 200);
}, true);

// START
if (document.location.href.indexOf("http://www.bugmenot.com/submit.php?") == 0) {
	document.getElementById("host").value = decodeURI(document.location.search.substr(1));
	document.getElementById("f_username").focus();
} else
	port.postMessage( {
		init : true,
		topWindow : window == top,
		host : encodeURIComponent(location.host)
	});