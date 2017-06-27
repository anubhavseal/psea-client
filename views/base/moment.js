'use strict';
angular.module('base')
	.factory('$moment', [function(){
		return {
			fromNow :fromNow,
			toMoment: toMoment
		};
		
		function toMoment(date) {
            if (date != null && (date instanceof String || typeof date == 'string')) {
                date = new Date(date);
            }
            return moment(date);
        }
		
		function fromNow(date) {
			return toMoment(date).fromNow();
        }
	}]);