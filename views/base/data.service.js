'use strict';
angular.module('base')
	.factory('$dataService', ['$constants', '$log', '$http', '$cache', '$notifier' , function($constants, $log, $http, $cache, $notifier){
		var APIBasePath = (location.protocol == 'https:' || location.protocol == 'https') && $constants.HTTPSAPIBasePath != null && $constants.HTTPSAPIBasePath != '' ? $constants.HTTPSAPIBasePath : $constants.APIBasePath;
		var Status_Messages = {
			'0': 'Data server not reachable. Please check with administrator.',
			'400': 'Bad request.',
			'401': 'Unauthorized',
			'402': 'Payment Required',
			'403': 'Forbidden',
			'404': 'Not Found',
			'405': 'Method not allowed',
			'406': 'Not Acceptable',
			'407': 'Proxy authentication required.',
			'408': 'Request timeout',
			'409': 'Conflict',
			'410': 'Gone',
			'411': 'Length required.',
			'412': 'Precondition failed.',
			'413': 'Request entity too large',
			'414': 'Request URI too long',
			'415': 'Unsupported media type',
			'416': 'Requested range not satisfiable.',
			'417': 'Expectation failed',
			'500': 'Internal Server Error',
			'501': 'Not implemented',
			'502': 'Bad gateway',
			'503': 'Service unavailable',
			'504': 'Gateway timeout',
			'505': 'Http version not supported.'
		};
		
		return {
			get: get,
			post: post,
			insert: post,
			put: put,
			update: put,
			remove: remove,
			getFromCache: getFromCache,
	        synchronize: synchronize,
	        groupBy: groupBy,
	        isFilterMatched: isFilterMatched,
	        filterData: filterData,
	        sortData: sortData,
			setAPIOption: setAPIOption,
			getAPIOption: getAPIOption,
			getAPIOptions: getAPIOptions,
			removeFromCache: removeFromCache,
			getAPIBasePath: getAPIBasePath,
			getAPIURL: getAPIURL
		};
		
		function getAPIBasePath() {
			return APIBasePath;
		}

		function prepareCallOptions(options) {
			options = options || {};
			var headers = options.headers || {};
			var callOptions = {};
			if (options.responseType != undefined) {
				callOptions.responseType = options.responseType;
			}
			callOptions.headers = headers;
			if (callOptions.headers.Authorization == null || callOptions.headers.Authorization === '') {
				callOptions.headers.Authorization = $cache.session.get('security', 'token');
			}
			callOptions.headers.options = callOptions.headers.options || JSON.stringify(getAPIOptions());
			return callOptions;
		}
		
		function getAPIOptions(){
			return $cache.session.get('__data_service', 'options') || {};
		}

		function getAPIOption(key){
			return getAPIOptions()[key];
		}

		function setAPIOption(key, value){
			var options = getAPIOptions();
			if (value == null) {
				delete options[key];
			} else {
				options[key] = value;
			}
			$cache.session.put('__data_service', 'options', options);
		}
		
		function getAPIURL(apiURL){
			var tenantId = getAPIOption('tenantId');
			var profileId = getAPIOption('profileId');
			
			if (apiURL != null){
				apiURL = apiURL.replace(/\{TenantId\}/g, (tenantId || ''));
				apiURL = apiURL.replace(/\{profileId\}/g, (profileId || ''));
			}
			
			if (apiURL.indexOf('http') >= 0) {
				return apiURL;
			} 
			
			return APIBasePath + apiURL;
		}

		function get(apiURL, successCallback, errorCallback, options) {
			var api = getAPIURL(apiURL);
			
			var separator = api.indexOf('?') === -1 ? '?' : '&';
			// api = api + separator +'noCache=' + new Date().getTime();
			api = api;
			$http.get(api, prepareCallOptions(options))
				.success(function(data, status, headers, config){
					if (successCallback != null) {
						var rHeaders = {};
						var moreRowsAvailable = headers("More-Rows-Available");
						if (moreRowsAvailable != null && moreRowsAvailable != '') {
							rHeaders["More-Rows-Available"] = moreRowsAvailable;
						}
						var totalRowsAvailable = headers("Total-Rows-Available");
						if (totalRowsAvailable != null && totalRowsAvailable != '') {
							rHeaders["Total-Rows-Available"] = totalRowsAvailable;
						}
						successCallback(data, status, rHeaders, config);
					}
				})
				.error(function(response, status){
					var statusMessage = Status_Messages["" + status];
					if (statusMessage != null && statusMessage != '') {
						if (status >= 400 && status <= 499) {
							$notifier.error("Error occured [" + statusMessage + "] while invoking API - " + apiURL);
						} else {
							$notifier.error(statusMessage);						
						}
					}
					if (errorCallback != null) {
						errorCallback(response);
					}
				});
		}
		
		function post(url, data, successCallback, errorCallback, options) {
			var apiURL = getAPIURL(url);
			$http.post(apiURL, data, prepareCallOptions(options))
				.success(function(response) {
					if (successCallback != null) {
						successCallback(response);
					}
				})
				.error(function(response, status){
					var statusMessage = Status_Messages["" + status];
					if (statusMessage != null && statusMessage != '') {
						if (status >= 400 && status <= 499) {
							$notifier.error("Error occured [" + statusMessage + "] while invoking API - " + apiURL);
						} else {
							$notifier.error(statusMessage);						
						}
					}
					if (errorCallback != null) {
						errorCallback(response);
					}
				});
		}
		
		function put(url, data, successCallback, errorCallback, options) {
			var apiURL = getAPIURL(url);
			$http.put(apiURL, data, prepareCallOptions(options))
				.success(function(response) {
					if (successCallback != null) {
						successCallback(response);
					}
				})
				.error(function(response, status){
					var statusMessage = Status_Messages["" + status];
					if (statusMessage != null && statusMessage != '') {
						if (status >= 400 && status <= 499) {
							$notifier.error("Error occured [" + statusMessage + "] while invoking API - " + apiURL);
						} else {
							$notifier.error(statusMessage);						
						}
					}
					if (errorCallback != null) {
						errorCallback(response);
					}
				});
		}
		
		function remove(url, data, successCallback, errorCallback, options) {
			var apiURL = getAPIURL(url);
			$http.delete(apiURL, prepareCallOptions(options), data)
				.success(function(response) {
					if (successCallback != null) {
						successCallback(response);
					}
				})
				.error(function(response, status){
					var statusMessage = Status_Messages["" + status];
					if (statusMessage != null && statusMessage != '') {
						if (status >= 400 && status <= 499) {
							$notifier.error("Error occured [" + statusMessage + "] while invoking API - " + apiURL);
						} else {
							$notifier.error(statusMessage);						
						}
					}
					if (errorCallback != null) {
						errorCallback(response);
					}
				});
		}
		
		function removeFromCache(cacheKey) {
			$cache.session.put('__data_service', cacheKey, null);
		}
		
		function getFromCache(apiURL, successCallback, errorCallback, options) {
			apiURL = getAPIURL(apiURL);
			var cacheKey = options != null && options.cacheKey != null && options.cacheKey != '' ? options.cacheKey : apiURL;
			var cacheTimeout = options != null ? options.cacheTimeout : null;
			
			var data = $cache.session.get('__data_service', cacheKey);
			if (data == null) {
				get(apiURL, function(data){
					$cache.session.put('__data_service', cacheKey, data, cacheTimeout);
					if (successCallback != null) {
						successCallback(data);
					}
				}, errorCallback, options);
			} else {
				if (successCallback != null) {
					successCallback(data);
				}
			}
		}
		
		function synchronize(options, callback, index) {
			options = options || {};
			var data = options.data || [];
			options.result = options.result || [];
			index = index || 0;
			
			if (index >= data.length) {
				if (callback) {
					callback(options.result);
				}
				return;
			}
			
			var record = data[index];
			
			var operation = null;
			var apiURL = options.apiURL;
			if (apiURL.substr(apiURL.length - 1) !== '/') {
				apiURL += '/';
			}
			var pkField = record[options.primaryKeyField];
			var type = '';
			if (record.__row_mode === 'D') {
				type = 'Delete';
				if (pkField == null || pkField === '') {
					options.result.push({'status': 'K', 'message': 'Primary Key Field Null For Delete. Skipped'});
					synchronize(options, callback, index + 1);
					return;
				}
				operation = remove;
				apiURL += pkField;
			} else if (record.__row_mode === 'N' || pkField == null || pkField === '') {
				type = 'Insert';
				operation = post;
			} else {
				type = 'Update';
				operation = put;
				apiURL += pkField;
			}
			
			operation(apiURL, record, function(data) {
				data = data == null ? {success : true} : data;
				if (data.success === false) {
					options.result.push({'status': 'E', 'type': type, 'pkField': pkField, 'url': apiURL, 'response': data.err});
				} else {
					options.result.push({'status': 'S', 'type': type, 'pkField': pkField, 'url': apiURL, 'response': data});
				}
				synchronize(options, callback, index + 1);
			}, function(err) {
				options.result.push({'status': 'E', 'type': type, 'pkField': pkField, 'url': apiURL, 'response': err});
				synchronize(options, callback, index + 1);
			}, options.options);
		}
	    function isFilterMatched(filter, row) {
	        if (row == null) {
	            return false;
	        }
	        if (filter == null) {
	            return true;
	        }
	        for (var key in filter) {
	            var lhs = filter[key];
	            var rhs = row[key];
	            if ((lhs == null || lhs == '') && (rhs != null && rhs != '')) {
	                return false;
	            } else if (lhs != null && lhs != '' && Array.isArray(lhs) && lhs.indexOf(rhs) == -1) {
	                return false;
	            } else if (lhs != null && lhs != '' && !Array.isArray(lhs) && lhs != rhs) {
	                return false;
	            }
	        }
	        return true;
	    }

	    function filterData(filter, data) {
	        var filteredData = [];
	        for (var i = 0; data != null && i < data.length; i++) {
	            var row = data[i];
	            if (isFilterMatched(filter, row)) {
	                filteredData.push(row);
	            }
	        }
	        return filteredData;
	    }

	    function findDistinctValues(key, data, returnRowWithValue) {
	        var values = [];
	        var valueWithRow = [];
	        for (var i = 0; data != null && i < data.length; i++) {
	            var row = data[i];
	            var value = row[key];
	            if (values.indexOf(value) == -1) {
	                values.push(value);
	                valueWithRow.push({ 'key': value, 'row': row });
	            }
	        }
	        return returnRowWithValue === true ? valueWithRow : values;
	    }

	    function clone(obj) {
	        if (obj == null) {
	            return obj;
	        }
	        if (Array.isArray(obj)) {
	            var c = [];
	            for (var i = 0; i < obj.length; i++) {
	                c.push(obj[i]);
	            }
	            return c;
	        } else {
	            var c = {};
	            for (var key in obj) {
	                c[key] = obj[key];
	            }
	            return c;
	        }

	    }

	    function generateGroupId() {
	        return groupId++;
	    }

	    function groupByData(data, columns, index, parentFilter, parentGroupIds) {
	        parentFilter = parentFilter || {};
	        parentGroupIds = parentGroupIds || [];

	        if (columns == null || columns.length == 0 || index >= columns.length) {
	            if (columns != null && index > columns.length) {
	                index = columns.length;
	            }
	            for (var i = 0; data != null && i < data.length; i++) {
	                data[i].__rowType = 'D';
	                data[i].__groupInfo = {};
	                data[i].__groupInfo.level = index;
	                data[i].__groupInfo.filter = parentFilter;
	                data[i].__groupInfo.parentGroupIds = parentGroupIds;
	                data[i].__groupInfo.keys = columns;
	            }
	            return data || [];
	        }
	        index = index || 0;
	        if (index < 0) {
	            index = 0;
	        }

	        var groupByKey = columns[index];
	        var rData = [];

	        var groups = findDistinctValues(groupByKey, data, true);
	        for (var i = 0; i < groups.length; i++) {
	            var groupByValue = groups[i].key;
	            var groupByRow = clone(groups[i].row);
	            var filter = clone(parentFilter);
	            filter[groupByKey] = groupByValue;
	            groupByRow.__rowType = 'G';
	            groupByRow.__groupInfo = {};
	            groupByRow.__groupInfo.groupId = generateGroupId();
	            groupByRow.__groupInfo.key = groupByKey;
	            groupByRow.__groupInfo.value = groupByValue;
	            groupByRow.__groupInfo.level = index;
	            groupByRow.__groupInfo.filter = parentFilter;
	            groupByRow.__groupInfo.parentGroupIds = parentGroupIds || [];
	            groupByRow.__groupInfo.keys = columns;
	            var childGroupIds = clone(parentGroupIds);
	            childGroupIds.push(groupByRow.__groupInfo.groupId);
	            var childData = filterData(filter, data);
	            rData.push(groupByRow);
	            var groupByChildData = groupByData(childData, columns, index + 1, filter, childGroupIds);
	            //groupByRow.__groupInfo.childData = groupByChildData;
	            for (var j = 0; j < groupByChildData.length; j++) {
	                rData.push(groupByChildData[j]);
	            }
	        }

	        return rData;
	    }

	    function groupBy(data, columns) {
	        return groupByData(data, columns, 0, {}, []);
	    }

	    function compareRow(rowL, rowR, sortExpression, column) {
	        var bEqual = true;
	        for (var i = sortExpression.length - 1; i >= 0 ; i--) {
	            var key = sortExpression[i];
	            var reverse = false;
	            if (key.substr(0, 1) == '-') {
	                key = key.substr(1);
	                reverse = true;
	            }

	            var lKey = rowL[key];
	            var rKey = rowR[key];

	            if (lKey == '' || lKey == null) {
	                lKey = '__Null_Object__';
	            }
	            if (rKey == '' || rKey == null) {
	                rKey = '__Null_Object__';
	            }

	            if (lKey === rKey) {
	                continue;
	            }
	            bEqual = false;
	            if (column.dataType != "dt") {
	                if (reverse && lKey == '__Null_Object__')
	                    return 1;
	                if (!reverse && rKey == '__Null_Object__')
	                    return 1;
	                if (reverse && lKey < rKey) {
	                    return 1;
	                } else if (!reverse && lKey > rKey) {
	                    return 1;
	                }
	            }
	            else {
	                if (reverse && lKey == '__Null_Object__')
	                    return 1;
	                if (!reverse && rKey == '__Null_Object__')
	                    return 1;
	                if (reverse && new Date(lKey) < new Date(rKey)) {
	                    return 1;
	                } else if (!reverse && new Date(lKey) > new Date(rKey)) {
	                    return 1;
	                }
	            }
	        }
	        return bEqual ? 0 : -1;
	    }

	    function sortData(data, sortExpression, column) {
	        if (data == null || data.length == 0 || sortExpression == null || sortExpression.length == 0) {
	            return data;
	        }
	        var groupByEnable = data[0].__groupInfo != null;
	        for (var i = 0; i < data.length; i++) {
	            if (data[i].__rowType == 'G') {
	                continue;
	            }

	            for (var j = i + 1; j < data.length; j++) {
	                if (data[j].__rowType == 'G') {
	                    continue;
	                }

	                var groupEqual = true;
	                if (groupByEnable) {
	                    groupEqual = JSON.stringify(data[i].__groupInfo.parentGroupIds) == JSON.stringify(data[j].__groupInfo.parentGroupIds);
	                }

	                if (!groupEqual) {
	                    continue;
	                }

	                if (compareRow(data[i], data[j], sortExpression, column) == 1) {
	                    var tempRow = data[i];
	                    data[i] = data[j];
	                    data[j] = tempRow;
	                }
	            }
	        }

	        return data;
	    }
	}]);