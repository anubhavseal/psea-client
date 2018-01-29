angular.module('cbs')
	 .factory('$navigation', ['$cache',function($cache) {
         debugger
        console.log('swr')
		 var call;
		return {
			get: get,
			set: set
		}

		function get() {
            console.log('get',call);
			call();
		}

		function set(fn) {
			//$cache.session.put('psea', 'navStatus', tab);
            call = fn;
            console.log('set',call);
		}
	 }])