'use strict';
angular.module('base')
	.factory('$filterService', ['$constants', '$cache', '$entityManager', '$comboService', function ($constants, $cache, $entityManager, $comboService) {
	    return {
	        getSelectedFilterText: getSelectedFilterText,
	        getSelectedFilterJSON: getSelectedFilterJSON,
	        getSelectedFilter: getSelectedFilter,
	        initializeFilterPanel: initializeFilterPanel,
	        clearSelectedFilter: clearSelectedFilter,
	        setSelectedFilter: setSelectedFilter,
	        getGlobalFilter: getGlobalFilter,
	        setGlobalFilter: setGlobalFilter
	    };

	    function getGlobalFilter() {
	        var globalFilter = localStorage.getItem("filterObject");
	        try {
	            globalFilter = JSON.parse(globalFilter);
	        } catch (e) {
	            console.log(e);
	            globalFilter = {};
	        }
	        return globalFilter;
	    }

	    function setGlobalFilter(filter) {
	        localStorage.setItem("filterObject", JSON.stringify(filter));
	    }

	    function clearSelectedFilter(filters) {
	        angular.forEach(filters, function (filter) {
	            if (filter.disabled) {
	                return;
	            }
	            if (filter.controlType == 'dropdown') {
	                filter.selectedOption = filter.options != null && filter.options.length > 0 ? filter.options[0] : null;
	            } else if (filter.controlType == 'multiselect') {
	                filter.selectedOption = [];
	            } else {
	                filter.selectedOption = null;
	            }
	        });
	    }

	    function getSelectedFilterText(filters) {
	        return getSelectedFilter(filters, 'text');
	    }

	    function getSelectedFilterJSON(filters) {
	        return getSelectedFilter(filters, 'json');
	    }

	    function attachDatePicker(filters) {
	        angular.forEach(filters, function (filter) {
	            if (filter.type == 'date') {
	                $("input[name='" + filter.id + "']").datepicker();
	            }
	        })
	    }

	    function setSelectedFilter(filters, options) {
			options = options || {};
	        angular.forEach(filters, function (filter) {
	            var selectedOption = options[filter.id];
	            filter.selectedOptionId = null;
	            if (selectedOption == null || selectedOption == '') {
	                return;
	            }
	            if (filter.controlType == 'dropdown') {
	                filter.selectedOptionId = selectedOption.id == null ? selectedOption : selectedOption.id;
	            } else if (filter.controlType == 'multiselect') {
	                filter.selectedOptionId = Array.isArray(selectedOption) ? selectedOption : selectedOption.split(",");
	            } else if (filter.controlType == 'date') {
	                try {
	                    selectedOption = (typeof selectedOption === "string" || selectedOption instanceof String) ? new Date(selectedOption) : selectedOption;
	                    if (('' + selectedOption) == 'Invalid Date') {
	                        selectedOption = null;
	                    }
	                } catch (e) {
	                }
	                filter.selectedOption = selectedOption;
	            } else {
	                filter.selectedOption = selectedOption;
	            }
	        });
	    }

	    function initializeFilterPanel(filters, defaultFilter) {
	        angular.forEach(filters, function (filter) {
	            filter.controlType = $entityManager.sanitizeControlType(filter.controlType, 'text');
	            filter.showLabel = filter.showLabel == null || filter.showLabel == true ? true : false;

	            if (filter.showLabel === true) {
	                filter.caption = filter.caption == null || filter.caption == '' ? filter.id : filter.caption;
	            }

	            var filteredValues = filter.filteredValues;
	            if (filteredValues != null && filteredValues != '') {
	                if (filter.controlType == 'multiselect') {
	                    filter.selectedOptionId = filteredValues.split(',');
	                } else if (filter.controlType == 'dropdown') {
	                    filter.selectedOptionId = filteredValues.split(',')[0];
	                } else if (filter.controlType == 'date') {
	                    try {
	                        filter.selectedOption = (typeof filteredValues === "string" || filteredValues instanceof String) ? new Date(filteredValues) : filteredValues;
	                        if (('' + filter.selectedOption) == 'Invalid Date') {
	                            filter.selectedOption = null;
	                        }
	                    } catch (e) {
	                        filteredValues = null;
	                    }
	                } else {
	                    filter.selectedOption = filteredValues;
	                }
	                filter.disabled = filteredValues != null && filteredValues != '';
	            }
	        });

	        setSelectedFilter(filters, defaultFilter);

	        $comboService.loadDropDownOptions(filters);

	        attachDatePicker(filters);
	    }

	    function getSelectedFilter(filters, type) {
			filters = filters || [];
	        type = type == null ? null : type.toUpperCase();
	        var filterJSON = {};
	        var filterString = '';
	        var filterText = ''
	        var filterCache = {};
	        for (var j = 0; j < filters.length; j++) {
	            var filter = filters[j];
	            var value = null;
	            var operator = (filter.operator != null && filter.operator !== '' ? '.' + filter.operator : '');
	            var valueText = null;
	            if (filter.controlType === 'multiselect') {
	                var expression = filter.expression || 'id';
	                var selectedOption = filter.selectedOption;
	                if (selectedOption != null && selectedOption != '') {
	                    if (!Array.isArray(selectedOption)) {
	                        selectedOption = [selectedOption];
	                    }
	                    value = [];
	                    valueText = '';
	                    for (var i = 0; i < selectedOption.length; i++) {
	                        if (selectedOption[i] != null && selectedOption[i][expression] != null && selectedOption[i][expression] != null) {
	                            value.push(selectedOption[i][expression]);
	                            if (valueText.length > 0) {
	                                valueText += ',';
	                            }
	                            valueText += selectedOption[i].caption;
	                        }
	                    }
	                    if (value.length == 0) {
	                        value == null;
	                    } else {
	                        if (value.length > 1) {
	                            operator = '.in';
	                        }
	                    }
	                }
	            } else if (filter.controlType === 'dropdown') {
	                var expression = filter.expression || 'id';
	                // filterString = $cache.session.get('__data_service', '_filtersData', filterString);
	                if (filter.selectedOption != null && filter.selectedOption[expression] != null && filter.selectedOption[expression] !== '') {
	                    value = filter.selectedOption[expression];
	                    filterCache[filter.id] = filter.selectedOption;
	                    valueText = filter.selectedOption.caption;
	                }
	            } else if (filter.controlType === 'date') {
	                filterCache[filter.id] = filter.selectedOption;
	                value = filter.selectedOption;
	                if (filter.selectedOption != null && filter.selectedOption.getFullYear != null) {
	                    var year = filter.selectedOption.getFullYear();
	                    var month = filter.selectedOption.getMonth() + 1;
	                    var day = filter.selectedOption.getDate();
	                    if (month < 10) {
	                        month = '0' + month;
	                    }
	                    if (day < 10) {
	                        day = '0' + day;
	                    }
	                    valueText = month + '-' + day + '-' + year;
	                }
	                if (filter.expression == 'string') {
	                    value = valueText;
	                }
	            } else if (filter.selectedOption != null && filter.selectedOption !== '') {
	                filterCache[filter.id] = filter.selectedOption;
	                value = '' + filter.selectedOption;

	                if (value.indexOf('..') > -1) {
	                    try {
	                        value = value.replace('..', '^');
	                        if (value.indexOf('^') === 0) {
	                            operator = '.le'
	                            value = value.split('^')[1]
	                            valueText = '<= ' + value;
	                        } else if (value.indexOf('^') === value.length - 1) {
	                            operator = '.ge'
	                            value = value.split('^')[0]
	                            valueText = '>= ' + value;
	                        } else {
	                            filterJSON[(filter.column || filter.id) + '.ge'] = value.split('^')[0];
	                            filterString += '&' + (filter.column || filter.id) + '.ge' + '=' + value.split('^')[0];
	                            operator = '.le'
	                            valueText = 'Between ' + value.split('^')[0] + ' and ' + value.split('^')[1];
	                            value = value.split('^')[1]
	                        }
	                    } catch (e) {
	                        value = null;
	                    }
	                }
	            }


	            if (value != null) {
	                filterJSON[(filter.column || filter.id) + operator] = value;

	                if (Array.isArray(value)) {
	                    value = value.join(",");
	                }

	                filterString += '&' + (filter.column || filter.id) + operator + '=' + value;

	                valueText = valueText || value;

	                filterText += (filterText.length > 0 ? ', ' : '') + filter.caption + ': ' + valueText;
	            }
	        }

	        return type === 'CACHE' ? filterCache : (type === 'JSON' ? filterJSON : (type === 'TEXT' ? filterText : filterString));
	    }
	}]);
