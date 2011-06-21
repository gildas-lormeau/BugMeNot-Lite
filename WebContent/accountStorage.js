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

var accountStorage = {};
(function() {
	var db;
	
	function init() {
		db = openDatabase("BugMeNot", "1.0", "Accounts", 200000);
		db.transaction(function(tx) {
			tx.executeSql(
				"create table if not exists accounts (loginId integer primary key, hostId integer, vote varchar(1))"
			);	
		});
	}
	
	accountStorage.get = function(accounts, callback) {
		db.transaction(function(tx) {			
			var i, query, params = [];
			if (accounts.length) {
				query = "select loginId, hostId, vote from accounts where";
				for (i = 0;i < accounts.length;i++) {
					query += " (loginId=? and hostId=?)";
					params.push(accounts[i].loginId);
					params.push(accounts[i].hostId);
					if (i < accounts.length - 1)
						query += " or";
				}			
				ret = tx.executeSql(query, params, function(cbTx, result) {
					callback(result.rows);			
				});
			} else
				callback([]);
		});	
	};
	
	accountStorage.add = function(loginId, hostId, vote) {
		db.transaction(function(tx) {
			tx.executeSql("insert or replace into accounts (loginId, hostId, vote) values (?, ?, ?)", [loginId, hostId, vote]);
		});
	};
	
	accountStorage.reset = function() {
		db.transaction(function(tx) {
			tx.executeSql("delete from accounts");
		});
	};
	
	init();
})();