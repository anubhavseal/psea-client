'use strict';
angular.module('base')
	.factory('$cache', ['$constants', '$log', '$http', '$window', function ($constants, $log, $http, $window){
		var cacheStore = null;
		var cacheEnabled = $constants.CACHE_ENABLED === true;
		
		return {
			put: put,
			get: get,
			session: {
				put: putIntoSession,
				get: getFromSession
			}
		};
		
		function rationalizeKey(module, key) {
			module = module == null ? '__default_module' : module + '';
			return module + '_' + key;
		}
		
		function getSessionStorage() {
			return sessionStorage;
		}
		
		function putIntoSession(module, key, value, timeout) {
			value = {'value': value};
			if (timeout != null && timeout > 0) {
				value.timeout = timeout;
				value.cachedOn = new Date();
			}
			
			value = JSON.stringify(value);
			getSessionStorage().setItem(rationalizeKey(module, key), value);
		}
		
		function getFromSession(module, key, value) {
			if (!cacheEnabled && module != 'security') {
				return null;
			}
			value = getSessionStorage().getItem(rationalizeKey(module, key));
			if (value == null) {
				return value;
			}
			value = JSON.parse(value);
			
			if (value.timeout != null && value.timeout > 0 && value.cachedOn != null) {
				var cachedOn = value.cachedOn;
				try{
					cachedOn = new Date("" + cachedOn);
				}catch(e){
					cachedOn = null;
				}
				if (cachedOn != null && cachedOn.getTime() + value.timeout < (new Date().getTime())) {
					return null;
				}
			}

			return value.value;
		}
		
		function getPermanentStorage() {
			if (cacheStore == null) {
				try {
					cacheStore = new Store('cacheStore');
				} catch(e) {
					console.log('Error creating store - ' + e);
				}
			}
			if (cacheStore == null) {
				console.log('Store not initialized. Possibly error while initializing it. Creating default store.');
				cacheStore = $window.localStorage;
			}
			return cacheStore;
		}

		function put(module, key, value) {
			value = JSON.stringify({'value': value});
			if (getPermanentStorage().setItem != null) {
				getPermanentStorage().setItem(rationalizeKey(module, key), value);
				return;
			}
			getPermanentStorage().set(rationalizeKey(module, key), value);
		}
		
		function get(module, key) {
			if (!cacheEnabled && module != 'security') {
				return null;
			}
			var value = null;
			if (getPermanentStorage().getItem != null) {
				value = getPermanentStorage().getItem(rationalizeKey(module, key));
			} else {
				value = getPermanentStorage().get(rationalizeKey(module, key));
			}
			
			if (value == null) {
				return value;
			}
			value = JSON.parse(value);
			return value.value;
		}
	}]);