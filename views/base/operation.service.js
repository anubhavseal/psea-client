'use strict';angular.module('base')
	.factory('$operationService', ['$constants', '$log', '$http', '$modal', '$notifier', '$location', 
		function ($constants, $log, $http, $modal, $notifier, $location){
			return {
				toDate: toDate,
				isNull: isNull,
				openPopup: openPopup, 
				'filter': {
					'set': setFilter,
					'isKey': isKeySatisfied,
					'isSatisfied': isFilterSatisfied
				},
				'order': {
					'set': setOrder
				},
				getFormattedDateDifference: getFormattedDateDifference,
				getDateDifference: getDateDifference,
				formatDateDifference: formatDateDifference,
				setBreadcrumbs: setBreadcrumbs,
				copyToClipboard: copyToClipboard,
				parseURLParams: parseURLParams,
				getURLParam: getURLParam,
				editTemplate: editTemplate
			};
			
			function getURLParam(key) {
				return decodeURIComponent(parseURLParams($location.url())[key]);
			}
			
			function parseURLParams(apiURL) {
				apiURL = apiURL || '';
				var params = {};

				apiURL.replace(
					new RegExp("([^?=&]+)(=([^&]*))?", "g"),
					function ($0, $1, $2, $3) {
						params[$1] = $3;
					}
				);

				return params;
			}
			
			function copyToClipboard(text) {
				var textArea = document.createElement("textarea");

				// Place in top-left corner of screen regardless of scroll position.
				textArea.style.position = 'fixed';
				textArea.style.top = 0;
				textArea.style.left = 0;

				// Ensure it has a small width and height. Setting to 1px / 1em
				// doesn't work as this gives a negative w/h on some browsers.
				textArea.style.width = '2em';
				textArea.style.height = '2em';

				// We don't need padding, reducing the size if it does flash render.
				textArea.style.padding = 0;

				// Clean up any borders.
				textArea.style.border = 'none';
				textArea.style.outline = 'none';
				textArea.style.boxShadow = 'none';

				// Avoid flash of white box if rendered for any reason.
				textArea.style.background = 'transparent';


				textArea.value = text;

				document.body.appendChild(textArea);

				textArea.select();

				try {
					var successful = document.execCommand('copy');
					var msg = successful ? 'successful' : 'unsuccessful';
					$notifier.success('Copied to clipboard successfully.');
				} catch (err) {
					$notifier.success('Unable to copy to clipboard.');
				}

				document.body.removeChild(textArea);
			}
			
			function openPopup(templateUrl1, controller1, inputParams, size) {
				var params = {};
				inputParams = inputParams || {};
				angular.forEach(inputParams, function(value, key){
					params[key] = function(){
						return inputParams[key];
					}
				});
				
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: templateUrl1,
					controller: controller1,
					size: size || 'md',
					resolve: params
				});
			}
			
			function setFilter(filter, fieldName, value) {
				filter = filter || {};
				filter[fieldName] = value;
			}
			
			function isKeySatisfied(filter, fieldName, value) {
				if (fieldName == null || filter == null) {
					return false;
				}
				if (value == null || value == '') {
					return filter[fieldName] == null || filter[fieldName] == '';
				} else {
					return filter[fieldName] == value;
				}
			}
			
			function isFilterSatisfied(filter, object) {
				if (object == null || filter == null) {
					return false;
				}
				var filterSatisfied = true;
				for(var key in filter) {
					var filterValue = filter[key];
					var compareValue = object[key];
					if (filterValue != null && filterValue != '' && angular.isArray(filterValue)){
						var anySatisfied = false;
						for(var i=0; i<filterValue.length; i++) {
							if (filterValue[i] != null && filterValue[i] != '' && filterValue[i] == compareValue) {
								anySatisfied = true;
								break;
							} else if ((filterValue[i] == null || filterValue[i] == '') && (compareValue == null || compareValue == '')) {
								anySatisfied = true;
								break;
							}
						}
						if (!anySatisfied) {
							filterSatisfied = false;
						}
					} else if (filterValue != null && filterValue != '' && filterValue != compareValue) {
						filterSatisfied = false;
					}
				}
				return filterSatisfied
			}
			
			function setOrder(order, fieldName, pattern) {
				order = order || [''];
				if (order.length == 0) {
					order.push('');
				}
				if (pattern == 'multiple') {
					var ascIndex = order.indexOf(fieldName);
					var descIndex = order.indexOf('-' + fieldName);
					if (ascIndex !== -1) {//Ascending found, change it to descending
						order[ascIndex] = '-' + fieldName;
					} else if (descIndex != -1) {//Descending found, remove it
						order.splice(descIndex, 1);
					} else {
						order.push(fieldName);
					}
				} else if (pattern == 'one_toggle') {
					var currentField = order[0]
					if (currentField == fieldName) {
						order[0] = '-' + fieldName;
					} else if (currentField == '-' + fieldName) {
						order.splice(0, 1);
					} else {
						order[0] = fieldName;
					}
				} else {
					var currentField = order[0];
					if (currentField == fieldName) {
						order[0] = '-' + fieldName;
					} else {
						order[0] = fieldName;
					}
				}
				return order;
			}
			
			function toDate(date) {
				if (date == null || date == "") {
					return null;
				}
				if (date instanceof Date) {
					return new Date(date);
				}
				if (date instanceof String || typeof date === 'string') {
					return new Date(date);
				}
				return null;
			}
			
			function isNull(value, defValue) {
				if (value == null || value == '') {
					return defValue;
				}
				return value;
			}
			
			function getFormattedDateDifference(date1, date2, compact, html) {
				return formatDateDifference(getDateDifference(date1, date2), compact, html)
			}
			
			function getDateDifference(date1, date2) {
				try{
					if(date1 === '' || date1 == null){
						date1 = new Date();
					} else {
						date1 = new Date(date1);
					}
				}catch(e){
				}
				try{
					if(date2 === '' || date2 == null){
						date2 = new Date();
					} else {
						date2 = new Date(date2);
					}
				}catch(e){
				}
				var diff = (date1.getTime() - date2.getTime());
				if (diff < 0) {
					diff *= -1;
				}
				return diff;
			}
			
			function formatDateDifference(diff, compact, html) {
				var ONE_SECOND = 1000;
				var ONE_MINUTE = 60 * ONE_SECOND;
				var ONE_HOUR = 60 * ONE_MINUTE;
				var ONE_DAY = 24 * ONE_HOUR;
				
				var days = diff / ONE_DAY;
				if (days > 0) {
					days = parseInt('' + days);
					diff -= (days * ONE_DAY)
				}
				
				var hours = diff / ONE_HOUR;
				if (hours > 0) {
					hours = parseInt('' + hours);
					diff -= (hours * ONE_HOUR)
				}
				
				var minutes = diff / ONE_MINUTE;
				if (minutes > 0) {
					minutes = parseInt('' + minutes);
					diff -= (minutes * ONE_MINUTE)
				}
				
				var seconds = diff / ONE_SECOND;
				if (seconds > 0) {
					seconds = parseInt('' + seconds);
					diff -= (seconds * ONE_SECOND)
				}
				
				var dateDiff = ''
				
				if (days > 0) {
					dateDiff += days + (html ? '<span class=\'text-muted\'>' : '') + (compact ? "d" : " day" + (days > 1 ? "s" : "")) + (html ? '</span>' : '');
				}
				if (hours > 0) {
					dateDiff += (compact ? "" : " ") + hours + (html ? '<span class=\'text-muted\'>' : '') + (compact ? "h" : " hr" + (hours > 1 ? "s" : "")) + (html ? '</span>' : '');
				}
				if (minutes > 0) {
					dateDiff += (compact ? "" : " ") + minutes + (html ? '<span class=\'text-muted\'>' : '') + (compact ? "m" : " min" + (minutes > 1 ? "s" : "")) + (html ? '</span>' : '');
				}
				if (seconds > 0) {
					dateDiff += (compact ? "" : " ") + seconds + (html ? '<span class=\'text-muted\'>' : '') + (compact ? "s" : " sec" + (seconds > 1 ? "s" : "")) + (html ? '</span>' : '');
				}
				
				if (dateDiff == '') {
					dateDiff = '0' + (html ? '<span class=\'text-muted\'>' : '') + (compact ? 's' : ' sec') + (html ? '</span>' : '');
				}
				
				return dateDiff;
			}
			
			function setBreadcrumbs(url, $rootScope, path, pathCaptions) {
				pathCaptions = pathCaptions || {};
				path = path || '';
				
				var urlParams = '';
				if (url.indexOf('?') > -1) {
					urlParams = url.substr(url.indexOf('?') + 1);
					url = url.substr(0, url.indexOf('?'))
				}
				var urlParts = url.split('/');
				var pathParts = path.split('/');
				var breadcrumbs = [];
				var prefix = '';
				for(var i=0; i<urlParts.length; i++) {
					var urlPart = decodeURIComponent(urlParts[i]);
					var pathPart = pathParts.length > i ? pathParts[i] : null;
					var caption = urlPart;
					
					if (pathPart != null && pathPart.substr(0, 1) == ':') {
						caption = pathCaptions[pathPart.substr(1)] || pathCaptions[pathPart] || caption;
					} else {
						caption = pathCaptions[pathPart] || caption;
					}
					
					breadcrumbs.push({'caption' : caption, 'url': prefix + urlPart, 'params': (i == urlParts.length - 1 ? '?' + urlParams : '')});
					prefix += urlPart + '/';
				}
				$rootScope.breadcrumbs = breadcrumbs;
			}

			function editTemplate(input, options, callback){
				var params = {};
				options = options || {};
				params.formattedHTML = options.formattedHTML == null ? true : options.formattedHTML;
				params.sourceHTML = input;
				params.callback = callback;
				params.caption = options.caption;
				openPopup('/views/base/template/view', 'base.template.controller', {'params': params}, options.size || 'lg');
			}
		}
	]);