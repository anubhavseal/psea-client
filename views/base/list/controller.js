angular.module('base')
	.controller('base.list.controller', ['$scope', '$operationService', '$http', '$location', '$window', '$constants', '$routeParams', '$loader', '$entityManager', '$dataService', '$comboService', '$notifier', '$injector', '$accessService', '$cache', '$timeout', 'listConfigId', 'viewId', 
	function ($scope, $operationService, $http, $location, $window, $constants, $routeParams, $loader, $entityManager, $dataService, $comboService, $notifier, $injector, $accessService, $cache, $timeout, listConfigId, viewId) {

		var hiddenGroups = {};
	    var services = [];
	    var $list = {
	        getSelectedItems: getSelectedItems,
	        getItems: getData,
	        refresh: refresh,
	        refreshHeader: refreshHeader,
	        isItemSelected: isItemSelected,
	        selectItem: selectItem,
	        unselectItem: unselectItem,
	        isMatched: isMatched,
	        openPopup: openPopup,
	        openURL: openURL,
	        getHeaderData: getHeaderData,
	        getHeaderRow: getHeaderRow,
	        getHeaderDetailsRow: getHeaderDetailsRow,
	        getHeaderDetailsData: getHeaderDetailsData,
	        getListConfig: getListConfig,
	        getEntity: getEntity,
			getFilter: createFilter,
			getSort: createSort
	    };

	    $accessService.registerFunctions($scope);
	    $scope.getService = getService;
	    $scope.fetchNextPage = fetchNextPage;
	    $scope.checkHeight = checkHeight;
	    $scope.isActionBarEnable = isActionBarEnable;
	    $scope.toggleRC = true;
	    $scope.dataFetch = true;
	    $scope.layout = {};
	    $scope.toggleGroupDisplay = toggleGroupDisplay;
	    $scope.isGroupHidden = isGroupHidden;
	    $scope.isRowVisible = isRowVisible;
	    $scope.getHeaderColumnHTML = getHeaderColumnHTML;
	    $scope.getColumnHTML = getColumnHTML;
	    $scope.getColumnStyle = getColumnStyle;
	    $scope.addSortExpression = addSortExpression;
	    $scope.isSortExpressionEnable = isSortExpressionEnable;
	    $scope.sortExpression = [];
	    $scope.$list = $list;
	    $scope.search = refresh;
	    $scope.sortConfig = {};
	    $scope.handleActionClick = handleActionClick;
	    $scope.handleRowClick = handleRowClick;
	    $scope.clearFilters = clearFilters;
	    $scope.allSelected = allSelected;
	    $scope.isActionVisible = isActionVisible;
	    $scope.onRowSelectionChange = onRowSelectionChange;
	    $scope.filterOptions = filterOptions
	    $scope.getHeight = getHeight;
	    $scope.refreshDropdown = $comboService.refreshDropdown
	    $scope.export = exportData;
	    $scope.getFilterText = getFilterText;
	    $scope.toPercentage = toPercentage;
	    $scope.availableRowsPerPage = [
            { 'value': 0, "caption": "All Rows" },
            { 'value': 25, "caption": "25 Rows Per Page" },
            { 'value': 50, "caption": "50 Rows Per Page" },
            { 'value': 100, "caption": "100 Rows Per Page" },
            { 'value': 200, "caption": "200 Rows Per Page" }
	    ];

	    var listName = null;
		if (listConfigId != null && listConfigId != '') {
			listName = listConfigId;
		} else {
			listName = $routeParams.listName;
		}
		
	    var viewName = null;
		if (viewId != null && viewId != '') {
			viewName = viewId;
		} else {
			viewName = $routeParams.view;
		}
	    if (viewName == null || viewName == '') {
	        viewName = 'default';
	    }

	    function toPercentage(value) {
	        try {
	            if (value != null && value != '') {
	                value = parseFloat('' + value);
	            } else {
	                value = null;
	            }
	        } catch (e) {
	            value = null;
	        }
	        if (value != null && !isNaN(value)) {
	            value = (value * 100).toFixed(2) + ' %';
	        }
	        return value;
	    }

	    function getListConfig() {
	        return $scope.listConfig;
	    }

	    function getFilterText() {
	        var filterText = createFilter('text');
	        return filterText == null || filterText == '' ? '' : ' (' + filterText + ')';
	    }

	    function getEntity() {
	        return $scope.entity;
	    }

	    function isSortExpressionEnable(column, type) {
	        var fieldName = (type ? '-' : '') + (column.column || column.id);
	        return $scope.sortExpression.indexOf(fieldName) != -1;
	    }

	    function parseAPIPArams(apiURL) {
	        apiURL = apiURL || '';
	        var params = {};

	        apiURL.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function ($0, $1, $2, $3) {
                    params[$1] = $3;
                }
            );

	        return params;
	    };

	    function prepareBackcolorConfig(columns, callback, index, colorData) {
	        colorData = colorData || {};
	        index = index || 0;
	        if (index < 0) {
	            index = 0;
	        }
	        if (columns == null || columns.length <= index) {
	            if (callback != null) {
	                callback(colorData);
	            }
	            return;
	        }
	        var column = columns[index];
	        if (column.backColorDataAPI == null || column.backColorDataAPI == '' || column.backColorAttributeId == null || column.backColorAttributeId == '') {
	            prepareBackcolorConfig(columns, callback, index + 1, colorData);
	            return;
	        }

	        if (colorData[column.backColorAttributeId] != null) {
	            column.colorMap = colorData[column.backColorAttributeId];
	            prepareBackcolorConfig(columns, callback, index + 1, colorData);
	            return;
	        }

	        var params = parseAPIPArams(column.backColorDataAPI);

	        var colorAttributeId = params['COLOR_ATTR_ID'];
	        var targetAttributeId = params['COLOR_TARGET_ATTR_ID'] || 'id';

	        $dataService.getFromCache(column.backColorDataAPI,
                function (rows) {
                    rows = rows || [];
                    var colorMap = {};
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var color = row[colorAttributeId] || row['color'];
                        var key = row[targetAttributeId];
                        if (color != null && color != '') {
                            colorMap[key] = color;
                        }
                    }
                    colorData[column.backColorAttributeId] = colorMap;
                    column.colorMap = colorData[column.backColorAttributeId];
                    prepareBackcolorConfig(columns, callback, index + 1, colorData);
                },
                function (err) {
                    console.log('Error occured while fetching color data - ' + column.backColorDataAPI);
                    prepareBackcolorConfig(columns, callback, index + 1, colorData);
                }
           );
	    }

	    function prepareAttributeStyleConfig(columns, callback, index, styleData) {
	        styleData = styleData || {};
	        index = index || 0;
	        if (index < 0) {
	            index = 0;
	        }
	        if (columns == null || columns.length <= index) {
	            if (callback != null) {
	                callback(styleData);
	            }
	            return;
	        }
	        var column = columns[index];
	        if (column.defaultStyleDataAPI == null || column.defaultStyleDataAPI == '' || column.defaultStyleAttributeId == null || column.defaultStyleAttributeId == '') {
	            prepareAttributeStyleConfig(columns, callback, index + 1, styleData);
	            return;
	        }

	        if (styleData[column.defaultStyleAttributeId] != null) {
	            column.styleMap = styleData[column.defaultStyleAttributeId];
	            prepareAttributeStyleConfig(columns, callback, index + 1, styleData);
	            return;
	        }

	        var params = parseAPIPArams(column.defaultStyleDataAPI);

	        var styleAttributeId = params['STYLE_ATTR_ID'];
	        var targetAttributeId = params['STYLE_TARGET_ATTR_ID'] || 'id';

	        $dataService.getFromCache(column.defaultStyleDataAPI,
                function (rows) {
                    rows = rows || [];
                    var styleMap = {};
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var color = row[styleAttributeId] || row['style'];
                        var key = row[targetAttributeId];
                        if (color != null && color != '') {
                            styleMap[key] = color;
                        }
                    }
                    styleData[column.defaultStyleAttributeId] = styleMap;
                    column.styleMap = styleData[column.defaultStyleAttributeId];
                    prepareAttributeStyleConfig(columns, callback, index + 1, styleData);
                },
                function (err) {
                    console.log('Error occured while fetching style data - ' + column.defaultStyleDataAPI);
                    prepareAttributeStyleConfig(columns, callback, index + 1, styleData);
                }
           );
	    }

	    function addSortExpression(column, type) {
	        if ($scope.listConfig.groupByColumnsList != null && $scope.listConfig.groupByColumnsList.indexOf(column.id) > -1) {
	            return;
	        }

	        if (type == null) {
	            type = isSortExpressionEnable(column, false) ? true : false;
	        }

	        $loader.setMessage('Sorting Data...');
	        $scope.sortExpression = [];
	        var sortExpression = $scope.sortExpression;
	        var fieldName = (type ? '-' : '') + (column.column || column.id);
	        var index = sortExpression.indexOf(fieldName);
	        if (index == -1) {
	            var reverse = fieldName.substr(0, 1) == '-';
	            var reverseExpression = reverse ? fieldName.substr(1) : '-' + fieldName;
	            var reverseIndex = sortExpression.indexOf(reverseExpression);
	            if (reverseIndex == -1) {
	                sortExpression.push(fieldName);
	            } else {
	                sortExpression[reverseIndex] = fieldName;
	            }
	        } else {
	            sortExpression.splice(index, 1);
	        }
	        $scope.listConfig.renderedData = $dataService.sortData($scope.listConfig.renderedData, sortExpression, column);
	        $scope.listConfig.data = filterData($scope.listConfig.renderedData, $scope.currentPage);
	    }

	    function exportData() {
	        var colorConfig = {};
	        for (var i = 0; i < $scope.listConfig.columns.length; i++) {
	            var column = $scope.listConfig.columns[i];
	            colorConfig[column.backColorAttributeId] = column.colorMap;
	        }

	        var defaultStyleConfig = {};
	        for (var i = 0; i < $scope.listConfig.columns.length; i++) {
	            var column = $scope.listConfig.columns[i];
	            defaultStyleConfig[column.defaultStyleAttributeId] = column.styleMap;
	        }

	        var exportConfig = {};
	        exportConfig.uidUserList = $scope.layout.selectedLayout.uidUserList;
	        exportConfig.sLayoutName = $scope.layout.selectedLayout.sListName;
	        exportConfig.sExportListName = $scope.layout.selectedLayout.sExportListName;
	        exportConfig.uidUser = "";//CACHE_INSTANCE.getUserId();
	        exportConfig.filter = JSON.stringify(createFilter('JSON'));
	        exportConfig.colorConfig = JSON.stringify(colorConfig);
	        exportConfig.defaultStyleConfig = JSON.stringify(defaultStyleConfig);

	        document.getElementById('exportConfig').value = JSON.stringify(exportConfig);

	        var form = document.forms.namedItem("exportForm");
	        form.action = $constants.APIBasePath + 'userList/exportExcel';
	        form.submit();
	    }

	    function getHeight(status) {
	        $timeout(function () {
	            $scope.fixedElementHeight = angular.element('#listFixed').height() + 5;
	        }, 0);
	    }

	    function checkHeight(obj, height) {
	        if (obj != null && obj != '' && obj.length > 0) {
	            return height;
	        }
	        return 0;
	    }

	    function getService(serviceName) {
	        if (services[serviceName] != null) {
	            return services[serviceName];
	        }
	        services[serviceName] = $injector.get(serviceName);
	        return services[serviceName];
	    }

	    function openURL(url) {
	        $location.path(url);
	    }

	    function isMatched(item, filter) {
	        if (filter == null) {
	            return true;
	        }
	        filter = filter || {};
	        for (var key in filter) {
	            if ('' + item[key] !== '' + filter[key]) {
	                return false;
	            }
	        }
	        return true;
	    }

	    function getSelectedItems(options, fields, filter) {
	        options = options || {};
	        var fields = options.fields;
	        var filter = options.filter;

	        var selectedData = [];
	        var data = getData(options);

	        angular.forEach(data, function (record) {
	            if (!isItemSelected(record)) {
	                return;
	            }
	            if (fields != null && fields.length > 0) {
	                var item = {};
	                for (var i = 0; i < fields.length; i++) {
	                    item[fields[i]] = record[fields[i]];
	                }
	                selectedData.push(item);
	            } else {
	                selectedData.push(record);
	            }
	        });

	        return selectedData;
	    }

	    function clearFilters() {
	        $loader.show();
	        $cache.session.put('__list', listName + "_" + $scope.listConfig.templateType, {});
	        var filters = $scope.listConfig.filter;
	        for (var j = 0; j < filters.length; j++) {
	            if (filters[j].disabled) {
	                continue;
	            }
	            if (filters[j].controlType == 'dropdown') {
	                filters[j].selectedOption = filters[j].options.length > 0 ? filters[j].options[0] : null;
	            } else {
	                filters[j].selectedOption = null;
	            }
	        }
	        refresh();
	    }

	    function init() {
	        $scope.$on('equalizeHeight', function (event) {
	            $timeout(function () {
	                var leftRows = $('#divLM98156LeftBottomGrid tr');
	                var rightRows = $('#divLM98156RightBottomGrid tr');
	                for (var i = 0; i < rightRows.length && i < leftRows.length; i++) {
	                    var rightRow = angular.element(rightRows[i]);
	                    var leftRow = angular.element(leftRows[i]);
	                    var rightHeight = rightRow.height();
	                    var leftHeight = leftRow.height();
	                    if (rightHeight < leftHeight) {
	                        rightRow.animate({ height: leftHeight }, 'fast');
	                    } else if (rightHeight > leftHeight) {
	                        leftRow.animate({ height: rightHeight }, 'fast');
	                    }
	                }
	            }, 0);
	        });
	        $loader.show();
			fetchListConfiguration(listName);
	    }

	    function isActionVisible(actionControl) {
	        var listConfig = $scope.listConfig;
	        var headerRow = getHeaderRow();
	        var selectedItems = getSelectedItems();
	        var data = getData();
	        if (actionControl.showIfAnyItemSelected) {
	            return isAnySelected();
	        } else if (actionControl.showIf) {
	            try {
	                return eval(actionControl.showIf)
	            } catch (e) {
	            }
	            return false;
	        }
	        return true;
	    }

	    function filterOptions(field) {
	        var referenceFields = $scope.listConfig.filter;
	        var options = field.options;
	        if (field.optionsFilter != null && field.optionsFilter != "") {
	            try {
	                eval("options=" + field.optionsFilter);
	            } catch (e) {
	                console.log(e);
	            }
	        }
	        return options;
	    }

	    function handleActionClick(actionControl, data) {
			var record = data;
			var item = data;
	        try {
	            var action = actionControl.action;
	            if (action == undefined || action == null) {
	                action = actionControl.onClick;
	            }
	            if (action == undefined || action == null) {
	                action = actionControl.onclick;
	            }
	            if (action == undefined || action == null) {
	                action = angular.element(actionControl.target).data('action');
	            }
	            if (action) {
	                eval(action);
	            }
	        } catch (e) {
				console.log(e);
	        }
	    }

	    function handleRowClick(data) {
	        try {
	            var action = $scope.listConfig.onRowClick
	            if (action) {
	                eval(action);
	            }
	        } catch (e) {
	        }
	    }

	    function getData(options) {
	        options = options || {};
	        var fields = options.fields;
	        var filter = options.filter;

	        var data = $scope.listConfig == null || $scope.listConfig.data == null ? [] : $scope.listConfig.data;
	        if (filter == null) {
	            return data;
	        }
	        var matchedData = [];
	        angular.forEach(data, function (record) {
	            if (isMatched(record, filter)) {
	                matchedData.push(record);
	            }
	        });
	        return matchedData;
	    }

	    function isItemSelected(item) {
	        return item != null && item.__selected === true;
	    }

	    function setItemSelection(item, value) {
	        if (item == null) {
	            return;
	        }
	        item.__selected = (value === true ? true : false);
	    }

	    function selectItem(item) {
	        setItemSelection(item, true);
	    }

	    function unselectItem(item) {
	        setItemSelection(item, false);
	    }

	    function isAllSelected() {
	        var data = getData();
	        if (data == null || data.length == 0) {
	            return false;
	        }
	        for (var i = 0; i < data.length; i++) {
	            if (!isItemSelected(data[i])) {
	                return false;
	            }
	        }
	        return true;
	    }

	    function isAnySelected() {
	        var data = getData();
	        if (data == null) {
	            return false;
	        }
	        for (var i = 0; i < data.length; i++) {
	            if (isItemSelected(data[i])) {
	                return true;
	            }
	        }
	        return false;
	    }

	    function selectAll(value) {
	        angular.forEach($scope.listConfig.data, function (item) {
	            var curr = isItemSelected(item);
	            setItemSelection(item, value);
	            if (curr != value) {
	                onRowSelectionChange(item)
	            }
	        });
	    }

	    function allSelected(value) {
	        if (value !== undefined) {
	            return selectAll(value);
	        } else {
	            return isAllSelected();
	        }
	    }

	    function fetchRecentActivities() {
			return;
	        var recentActivitiesAPI = replaceParams($scope.listConfig.recentActivitiesAPI);
	        if (recentActivitiesAPI == null || recentActivitiesAPI == '') {
				var dataAPI = getAPIBase();
				var jsPrefix = 'javascript:';
				if (dataAPI.substr(0, jsPrefix.length) == jsPrefix) {
					return;
				}
				
	            recentActivitiesAPI = replaceParams(dataAPI) + "/activities";
	            var paramStartIndex = $scope.listConfig.dataAPI.indexOf('?');
	            if (paramStartIndex >= 0) {
	                recentActivitiesAPI += $scope.listConfig.dataAPI.substring(paramStartIndex);
	            }
	        }
	        var filter = createFilter();
	        if (filter != null && filter != '') {
	            if (recentActivitiesAPI.indexOf('?') == -1) {
	                recentActivitiesAPI += '?';
	            } else {
	                recentActivitiesAPI += '&';
	            }
	            recentActivitiesAPI += filter;
	        }
	        try {
	            $dataService.get(recentActivitiesAPI, function (data) {
	                $scope.activities = data;
	                if (data == null || data.length == 0) {
	                    $scope.toggleRC = true;
	                }
	            });
	        } catch (e) {
	            console.log(e)
	        }
	    }

	    function replaceParams(input) {
	        if (input == null || input == '') {
	            return input;
	        }
	        for (var key in $routeParams) {
	            input = input.replace('{{routeParams.' + key + '}}', $routeParams[key]);
	        }
	        return input;
	    }

	    function copyProperties(source, target, props) {
	        for (var i = 0; i < props.length; i++) {
	            var prop = props[i];
	            target[prop] = target[prop] || source[prop];
	        }
	    }

	    function appendStyle(style, propName, propValue, defValue) {
	        if (propValue != null && propValue !== '' && style.indexOf(propName) == -1) {
	            style += ",'" + propName + "':'" + propValue + "'";
	        } else if (defValue != null && defValue !== '' && style.indexOf(propName) == -1) {
	            style += ",'" + propName + "':'" + defValue + "'";
	        }
	        return style;
	    }

	    function appendIfNotNull(value, suffix) {
	        return value == null || value === '' ? null : value + suffix;
	    }

	    function createStyle(jsonStyle, style, defaults) {
	        jsonStyle = jsonStyle || {};
	        var TextCases = { 'none': null, 'allupper': 'uppercase', 'lower': 'lowercase', 'upper': 'uppercase', 'lowercase': 'lowercase', 'uppercase': 'uppercase', 'alllower': 'lowercase', 'captitalize': 'capitalize' };

	        defaults = defaults || {};

	        style = style || '';

	        style = appendStyle(style, 'color', jsonStyle.color, defaults['color']);
	        style = appendStyle(style, 'background', jsonStyle.background, defaults['background']);
	        style = appendStyle(style, 'font', jsonStyle.font, defaults['font']);
	        style = appendStyle(style, 'font-size', appendIfNotNull(jsonStyle.fontSize, 'px'), defaults['font-size']);
	        style = appendStyle(style, 'font-family', jsonStyle.fontName, defaults['font-family']);
	        style = appendStyle(style, 'font-weight', jsonStyle.fontWeight, defaults['font-weight']);
	        if (jsonStyle.Bold || jsonStyle.bold) {
	            style = appendStyle(style, 'font-weight', 'bold');
	        }
	        if (jsonStyle.Underline || jsonStyle.underline) {
	            style = appendStyle(style, 'text-decoration', 'underline');
	        }
	        if (jsonStyle.StrikeThrough || jsonStyle.strikethrough) {
	            style = appendStyle(style, 'text-decoration', 'line-through');
	        }
	        if (jsonStyle.Italic || jsonStyle.italic) {
	            style = appendStyle(style, 'font-style', 'italic');
	        }
	        style = appendStyle(style, 'text-transform', TextCases[jsonStyle.textCase == null ? null : jsonStyle.textCase.toLowerCase().replace(/ /g, '')], defaults['text-transform']);
	        style = appendStyle(style, 'text-align', jsonStyle.textAlign, defaults['text-align']);
	        style = appendStyle(style, 'vertical-align', jsonStyle.verticalAlign, defaults['vertical-align']);
	        style = appendStyle(style, 'padding', appendIfNotNull(jsonStyle.padding, 'px'), defaults['padding']);
	        return style;
	    }

	    function processGridColumns(listConfig, entity) {
	        try {
	            if (listConfig.freezeColumns != null && listConfig.freezeColumns != '' && listConfig.freezeColumns != 0) {
	                listConfig.freezeColumns = parseInt('' + listConfig.freezeColumns);
	            }
	            if (isNaN(listConfig.freezeColumns) || (listConfig.freezeColumns != null && listConfig.freezeColumns < 0) || (listConfig.freezeColumns != null && listConfig.freezeColumns >= listConfig.columns.length)) {
	                listConfig.freezeColumns = 0;
	            }
	        } catch (e) {
	            listConfig.freezeColumns = null;
	        }

	        listConfig.freezeColumns = listConfig.freezeColumns || 0;

	        var fieldMap = {};
	        angular.forEach(entity.fields, function (field) {
	            fieldMap['' + field.id] = field;
	        });

	        var groupByColumnsList = [];
	        angular.forEach(listConfig.groupByColumns, function (column, index) {
	            var field = fieldMap['' + column.id];
	            if (field == null) {
	                return;
	            }
	            column.field = field;
	            column.index = index;
	            groupByColumnsList.push(column.field.column || column.field.id);
	        });

	        listConfig.groupByColumnsList = groupByColumnsList;

	        var bRowClickSet = false;
	        angular.forEach(listConfig.columns, function (column, index) {
	            var field = fieldMap['' + column.id];
	            if (field == null) {
	                return;
	            }
	            column.field = field;
	            column.dataType = field.dataType;
	            column.index = index;
	            if (column.html == null || column.html == '') {
	                if (column.dataType != null && (column.dataType.toLowerCase() == 'p' || column.dataType.toLowerCase() == 'percentage')) {
	                    column.html = "{{toPercentage(item[column.dataCaptionField || column.column || column.id])}}";
	                } else {
	                    column.html = "{{item[column.dataCaptionField || column.column || column.id]}}";
	                }
	            }
	            var currentMenuType = getMenuType();
	            if (currentMenuType !== 'N') {
	                if (column.id == 'WLWELLNAME' || column.id == 'PDWELLNAME' || column.id == 'UNWELLNAME') {
	                    var strOnClickFunction = null;
	                    if (column.onClick != null && column.onClick != '') {
	                        strOnClickFunction = column.onClick;
	                    } else if (listConfig.onRowClick != null && listConfig.onRowClick != '' && !bRowClickSet && (listConfig.groupByColumnsList == null || listConfig.groupByColumnsList.indexOf(column.id) == -1)) {
	                        column.onClick = listConfig.onRowClick;
	                        bRowClickSet = true;
	                    }
	                    if (column.onClick != null && column.onClick != '') {
	                        column.html = "<span style='cursor:pointer' ng-click='handleActionClick(column, item);'>" + column.html + "</span>";
	                    } else if (column.dataType != null && (column.dataType.toLowerCase() == 'url' || column.dataType.toLowerCase() == 'file' || column.dataType.toLowerCase() == 'link')) {
	                        column.html = "<a style=\"{{item[column.dataCaptionField || column.column || column.id] != null && item[column.dataCaptionField || column.column || column.id] != '' ? '' : 'display:none'}}\" href=\"" + column.html + "\" target=\"_blank\">View</a>";
	                    }
	                }
	            }
	            column.caption = (column.caption == '' ? null : column.caption) || field.caption || '';
	            column.dataRowStyle = column.dataRowStyle || column.defaultStyle || (listConfig.DefaultDataRowStyle || {});
	            column.headerRowStyle = column.headerRowStyle || (listConfig.DefaultHeaderRowStyle || {});

	            if (listConfig.templateType === 'grid' || listConfig.templateType === 'grid_with_freezecolumn') {
	                column.width = column.width == null ? null : parseInt(('' + column.width).replace('px', '').replace('%', ''));
	                if (column.width != null && (isNaN(column.width) || column.width < 0)) {
	                    column.width = null;
	                }

	                if (column.width == null || column.width === '' || column.width < 0) {
	                    var charWidth = null;
	                    if (charWidth == null && column.headerRowStyle != null && column.headerRowStyle.fontSize != null && column.headerRowStyle.fontSize > 6) {
	                        charWidth = column.headerRowStyle.fontSize + 1;
	                    }
	                    if (charWidth == null && column.dataRowStyle != null && column.dataRowStyle.fontSize != null && column.dataRowStyle.fontSize > 6) {
	                        charWidth = column.dataRowStyle.fontSize;
	                    }
	                    if (charWidth == null) {
	                        charWidth = 7;
	                    }
	                    column.width = (column.caption.length * charWidth) + 40;
	                }

	                if (column.width < 100 && column.width != 0) {
	                    column.width = 100;
	                }
	            }
	            var TextCases = { 'none': null, 'allupper': 'uppercase', 'lower': 'lowercase', 'upper': 'uppercase', 'lowercase': 'lowercase', 'uppercase': 'uppercase', 'alllower': 'lowercase', 'captitalize': 'capitalize' }


	            var style = column.style || '';
	            if (column.wrap == null || column.wrap === false) {
	                style += "'overflow':'hidden','white-space':'nowrap','text-overflow':'ellipsis'";
	            }
	            style = appendStyle(style, 'max-width', appendIfNotNull(column.width, 'px'));
	            style = appendStyle(style, 'min-width', appendIfNotNull(column.width, 'px'));
	            if (column.width == 0) {
	                style = createStyle(column.dataRowStyle, style, { 'padding': '2px', 'font-size': '0px'});
	            }
	            else {
	                style = createStyle(column.dataRowStyle, style, { 'padding': '2px' });
	            }

	            column.style = style;

	            style = column.headerStyle || '';
	            style += "'overflow':'hidden','white-space':'nowrap','text-overflow':'ellipsis'";
	            style = appendStyle(style, 'max-width', appendIfNotNull(column.width, 'px'));
	            style = appendStyle(style, 'min-width', appendIfNotNull(column.width, 'px'));
	            var headerStyleDefaults =null;
	            if (column.width == 0) {
	                headerStyleDefaults = { 'color': 'black', 'background': 'darkgray', 'font-weight': 'bold', 'font-size': '0px', 'text-align': 'center', 'padding': '2px' };
	            }
	            else {
	                headerStyleDefaults = { 'color': 'black', 'background': 'darkgray', 'font-weight': 'bold', 'font-size': '15px', 'text-align': 'center', 'padding': '2px' };
	            }
	            style = createStyle(column.headerRowStyle, style, headerStyleDefaults);
	            column.headerStyle = "{" + style + "}";
	        });

	        if (listConfig.freezeColumns != null) {
	            listConfig.fColumns = [];
	            listConfig.sColumns = [];
	            var freezeColumnWidth = 0;
	            for (var i = 0; i < listConfig.columns.length; i++) {
	                var column = listConfig.columns[i];
	                if (i < listConfig.freezeColumns) {
	                    listConfig.fColumns.push(column);
	                    freezeColumnWidth += column.width
	                } else {
	                    listConfig.sColumns.push(column);
	                }
	            }
	            listConfig.freezeColumnWidth = freezeColumnWidth + (listConfig.showCheckBox != false ? 50 : 0);
	            listConfig.headerHeight = 35;
	        }
	    }

	    function isActionBarEnable(listConfig, sortConfig) {
	        if (listConfig == null) {
	            return false;
	        }
	        if (listConfig.showCheckBox === true && listConfig.data != null && listConfig.data.length > 0) {
	            return true;
	        }
	        if (listConfig.actions != null && listConfig.actions.length > 0) {
	            return true;
	        }
	        /*if (listConfig.showPagination === true) {
	            return true;
	        }*/
	        if (sortConfig != null && sortConfig.availableOptions != null && sortConfig.availableOptions.length > 0) {
	            return true;
	        }
	        return false;
	    }

	    $scope.ExportButtonOnly = ExportButtonOnly;
	    function ExportButtonOnly(actionControl) {
	        return actionControl.caption == "Export Well" || actionControl.caption == "Export Pad" || actionControl.caption == "Export Unit";
	    }

	    $scope.addButtonOnly = addButtonOnly;
	    function addButtonOnly(actionControl) {
	        return actionControl.caption == "Add Well" || actionControl.caption == "Add Pad" || actionControl.caption == "Add Unit";
	    }

	    function fetchListConfiguration(configName) {
	        $loader.setMessage("Fetching Configuration...");
	        $dataService.get('listConfigurations/' + encodeURIComponent(configName), function (configuration) {
	            var views = configuration.views || {};

	            $loader.setMessage("Fetching Template...");

	            var listConfig = views[viewName] || {};
	            copyProperties(configuration, listConfig, ['tile', 'templateType', 'freezeColumns', 'recentActivitiesAPI', 'entityId', 'entity', 'filter', 'showCheckBox', 'columns', 'sort', 'actions', 'NoDataMessage', 'header', 'dataAPI', 'headerEntity', 'onRowSelection', 'onRowUnselection', 'rowSelectionExpression', 'helpGroupId', 'showPagination', 'DefaultDataRowStyle', 'DefaultHeaderRowStyle', 'groupByColumns', 'onRowClick']);
	            listConfig.tileConfig = listConfig.tileConfig || {};
	            listConfig.templateType = listConfig.templateType || 'default';
	            listConfig.entity = listConfig.entity || configName;
	            listConfig.entityId = listConfig.entityId || configName;
	            listConfig.helpGroupId = listConfig.helpGroupId || configName;
	            listConfig.showCheckBox = listConfig.showCheckBox === true ? true : false;
	            listConfig.showPagination = listConfig.showPagination === false ? false : true;
	            listConfig.columns = listConfig.columns || [];
				if (listConfig.tileConfig.html == null || listConfig.tileConfig.html == "") {
					listConfig.tileConfig.html = '<div style="min-height: 170px;" class="card"> <div style="background-image: url({{listConfig.tileConfig.backgroundImage == null || listConfig.tileConfig.backgroundImage == \'\' ? \'/images/pattern_1a.png\' : listConfig.tileConfig.backgroundImage}})" class="card-image">{{SELECTOR_CHECK_BOX}}<div class="card-image-content"> <h3>{{CAPTION_HTML}}</h3> </div> </div> <div class="card-content"> <div class="card-details clearfix"></div> </div> </div>';
					listConfig.tileConfig.html = listConfig.tileConfig.html
				} 
				listConfig.tileConfig.html = listConfig.tileConfig.html.replace(/\{\{CAPTION_HTML\}\}/g, listConfig.tileConfig.captionHTML);
				var selectorCheckBoxHTML = "";
				if (listConfig.showCheckBox !== false) {
					selectorCheckBoxHTML = '<div style="margin:0px" class="checkbox"> <label> <div class="checkbox-wrap"> <input type="checkbox" ng-model="item.__selected" ng-change="onRowSelectionChange(item)" class="checkbox-input"/><span class="input-icon"></span> </div> <span>&nbsp;</span> </label> </div>';
				}
				listConfig.tileConfig.html = listConfig.tileConfig.html.replace(/\{\{SELECTOR_CHECK_BOX\}\}/g, selectorCheckBoxHTML);
				

	            if (listConfig.groupByColumns != null && listConfig.groupByColumns.length > 0) {
	                listConfig.showPagination = false;
	                listConfig.showCheckBox = false;

	                var columns = listConfig.columns;

	                var sortedColumns = [];
	                var sortedGroupByColumns = [];

	                var addedColumns = [];
	                var groupByColumns = listConfig.groupByColumns;
	                for (var i = 0; i < groupByColumns.length; i++) {

	                    if (groupByColumns[i] == null || groupByColumns[i] == '') {
	                        continue;
	                    }

	                    if (typeof groupByColumns[i] === 'string' || groupByColumns[i] instanceof String) {
	                        groupByColumns[i] = { 'id': groupByColumns[i] };
	                    }

	                    var bGroupAdded = false;

	                    for (var j = 0; j < columns.length; j++) {
	                        if (columns[j].id == groupByColumns[i].id) {
	                            bGroupAdded = true;
	                            addedColumns.push(j);
	                            sortedColumns.push(columns[j]);
	                            break;
	                        }
	                    }

	                    if (!bGroupAdded) {
	                        sortedColumns.push(groupByColumns[i]);
	                    }

	                    sortedGroupByColumns.push(groupByColumns[i]);
	                }

	                for (var j = 0; j < columns.length; j++) {
	                    if (addedColumns.indexOf(j) == -1) {
	                        sortedColumns.push(columns[j]);
	                    }
	                }

	                listConfig.groupByColumns = sortedGroupByColumns;
	            }

	            $loader.setMessage("Checking Access...");
	            if (listConfig.actions != null) {
	                angular.forEach(listConfig.actions, function (action) {
	                    if (action.access != null && action.access != '') {
	                        action.accessible = $accessService.checkAccess(action.access);
	                    } else {
	                        action.accessible = true;
	                    }
	                });
	            }

	            var sortConfig = { 'availableOptions': listConfig.sort || [] };
	            $scope.sortConfig = sortConfig;
	            listConfig.fcAdditionalHeight = 60;
	            listConfig.fcAdditionalHeight += ((listConfig.showPagination || (listConfig.groupByColumns != null && listConfig.groupByColumns.length > 0)) ? 40 : 0);

	            listConfig.rowsPerPage = $scope.availableRowsPerPage[1];

	            for (var i = 0; i < sortConfig.availableOptions.length; i++) {
	                if (sortConfig.availableOptions[i].default) {
	                    $scope.sortConfig.selectedOption = sortConfig.availableOptions[i];
	                    break;
	                }
	            }

	            $scope.listConfig = listConfig;
	            fetchEntity(listConfig.entity, listConfig);
	        });
	    }

	    function fetchEntity(entityName, listConfig) {
	        $loader.setMessage("Fetching Entity...");
	        $entityManager.get(
				entityName,
				function (entity) {
				    $scope.entity = entity;
				    $scope.entityId = entity.id;

				    if (listConfig.templateType == 'grid' || listConfig.templateType === 'grid_with_freezecolumn') {
				        processGridColumns(listConfig, entity)
				    }

				    prepareBackcolorConfig($scope.listConfig.columns);
				    prepareAttributeStyleConfig($scope.listConfig.columns);

				    listConfig.header = listConfig.header || '<h2>' + $scope.entity.caption + '</h2>';
				    listConfig.dataAPI = listConfig.dataAPI || $scope.entity.api;
				    $entityManager.copyFieldProps(listConfig.filter, $scope.entity);

				    var filterCache = $cache.session.get('__list', listName + "_" + $scope.listConfig.templateType) || {};
				    var globalFilter = localStorage.getItem("filterObject");
				    try {
				        globalFilter = JSON.parse(globalFilter);
				    } catch (e) {
				        globalFilter = null;
				    }
					if (globalFilter == null || globalFilter == undefined) {
						globalFilter = {};
					}

				    var filters = $scope.listConfig.filter;

				    for (var j = 0; j < filters.length; j++) {
				        var filter = filters[j];
				        filter.controlType = $entityManager.sanitizeControlType(filter.controlType, 'text');
				        if (filter.showLabel === true) {
				            filter.caption = filter.caption == null || filter.caption == '' ? filter.id : filter.caption;

				        }
				        var selectedOption = globalFilter[filter.id];// || filterCache[filter.id];
				        filter.selectedOptionId = null;
				        if (selectedOption != null && selectedOption != '') {
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
				        }

				        var filteredValues = null;//filter.filteredValues
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
				    }

				    $comboService.loadDropDownOptions(listConfig.filter);

				    angular.element('#listFilter').show();

				    fetchHeaderEntity(listConfig);
				    fetchHeaderDetails(listConfig);
				    fetchEntityData(0);
				}
			);
	    }

	    function fetchHeaderEntity(listConfig) {
	        if (listConfig.headerEntity != null && listConfig.headerEntity != '') {
	            $entityManager.get(
					listConfig.headerEntity,
					function (entity) {
					    $scope.headerEntity = entity;
					    fetchHeaderData(listConfig);
					    angular.element("#listViewHeader").show();
					    getHeight();
					}
				);
	        } else {
	            $scope.headerEntity = { 'fields': [] };
	            fetchHeaderData(listConfig);
	            angular.element("#listViewHeader").show();
	            getHeight();
	        }
	    }

	    function fetchHeaderDetails(listConfig) {
	        if (listConfig.headerDetailsEntity != null && listConfig.headerDetailsEntity != '') {
	            $entityManager.get(
					listConfig.headerDetailsEntity,
					function (entity) {
					    $scope.headerDetailsEntity = entity;
					    fetchHeaderDetailsData(listConfig);
					}
				);
	        } else {
	            $scope.headerDetailsEntity = { 'fields': [] };
	            //fetchHeaderDetailsData(listConfig);
	            //angular.element("#listViewHeaderDetails").show();
	        }
	    }

	    function refreshHeader() {
	        fetchHeaderData($scope.listConfig);
	        fetchHeaderDetailsData($scope.listConfig);
	    }

	    function fetchHeaderData(listConfig) {
	        if (listConfig.headerDataAPI != null && listConfig.headerDataAPI) {
	            $entityManager
					.getData(
						{
						    entity: $scope.headerEntity,
						    apiUrl: replaceParams(listConfig.headerDataAPI),
						    fetchReferences: false
						},
						function (data) {
						    listConfig.headerData = data || [{}];
						});
	        } else {
	            listConfig.headerData = [{}];
	        }
	    }

	    function fetchHeaderDetailsData(listConfig) {
	        if (listConfig.headerDetailsDataAPI != null && listConfig.headerDetailsDataAPI) {
	            $entityManager
					.getData(
						{
						    entity: $scope.headerDetailsEntity,
						    apiUrl: replaceParams(listConfig.headerDetailsDataAPI),
						    fetchReferences: true
						},
						function (data) {
						    listConfig.headerDetailsData = data || [{}];
						    if (data != null && data.length > 0) {
						        angular.element("#listViewHeaderDetails").show();
						        getHeight();
						    }
						});
	        } else {
	            listConfig.headerDetailsData = [{}];
	        }
	    }

	    function getHeaderData() {
	        return $scope.listConfig.headerData;
	    }

	    function getHeaderDetailsData() {
	        return $scope.listConfig.headerDetailsData;
	    }

	    function getHeaderRow(index) {
	        index = index == null || index < 0 ? 0 : index;
	        var headerData = getHeaderData();
	        return headerData == null || headerData.length == 0 || headerData.length <= index ? {} : headerData[index];
	    }

	    function getHeaderDetailsRow(index) {
	        index = index == null || index < 0 ? 0 : index;
	        var headerDetailsData = getHeaderDetailsData();
	        return headerDetailsData == null || headerDetailsData.length == 0 || headerDetailsData.length <= index ? {} : headerDetailsData[index];
	    }

	    function createFilter(type) {
	        var filterJSON = {};
	        var filterString = '';
	        var filterText = ''
	        var filters = $scope.listConfig.filter;
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

	        $cache.session.put('__list', listName + "_" + $scope.listConfig.templateType, filterCache);
	        return type === 'JSON' ? filterJSON : (type === 'text' ? filterText : filterString);
	    }

	    function createSort() {
	        return $scope.sortConfig.selectedOption == null ? '&x=1' : '&' + $scope.sortConfig.selectedOption.expression;
	    }

	    function fetchNextPage() {
	        fetchEntityData($scope.currentPage + 1);
	    }

	    function getHeaderColumnHTML(column) {
	        var html = '';
	        if (column.width !== 0) {
	            if (column.index != $scope.listConfig.columns.length - 1 && ($scope.listConfig.freezeColumns == null || $scope.listConfig.freezeColumns == 0 || column.index != $scope.listConfig.freezeColumns - 1)) {
	                html += '<div class="grid-header-column-divider pull-right"/>';
	            }
	        }
	        if (column.width !== 0) {
	            if (($scope.listConfig.groupByColumnsList == null || $scope.listConfig.groupByColumnsList.indexOf(column.id) == -1) && ($scope.listConfig.showPagination == false || $scope.paginationAt == 'C' || rowsPerPage == 0)) {
	                html += '<span><span class="fa fa-chevron-up clickable-icon small-icon sort-up-icon pull-right" ng-click="addSortExpression(column, true)" ng-class="{\'active-clickable-icon\' : isSortExpressionEnable(column, true)}"/><span class="fa fa-chevron-down clickable-icon small-icon sort-down-icon pull-right" ng-click="addSortExpression(column, false)" ng-class="{\'active-clickable-icon\' : isSortExpressionEnable(column, false)}"/></span>';
	            }
	        }
	        html += column.caption;
	        return html;
	    }

	    function getColumnHTML(row, column) {
	        var rowType = row == null || row.__rowType == null ? null : row.__rowType;
	        var level = row.__groupInfo == null ? null : row.__groupInfo.level;
	        if (rowType == null || rowType == '') {
	            return column.html;
	        }
	        rowType = rowType === 'G' ? 'G' : 'D';

	        if (rowType == 'D') {
	            if (row.__groupInfo != null && row.__groupInfo.keys != null && row.__groupInfo.keys.indexOf(column.id) >= 0) {
	                return '';
	            }
	            return column.html;
	        } else {
	            if (column.id != row.__groupInfo.key) {
	                return '';
	            }
	            var groupIcons = '<i class="fa fa-chevron-right clickable-icon pull-left" ng-show="isGroupHidden(item.__groupInfo.groupId)" ng-click="toggleGroupDisplay(item.__groupInfo.groupId)"/><i class="fa fa-chevron-up clickable-icon pull-left" ng-show="!isGroupHidden(item.__groupInfo.groupId)" ng-click="toggleGroupDisplay(item.__groupInfo.groupId)"/>&nbsp;&nbsp;&nbsp;';
	            return groupIcons + column.html;
	        }
	    }

	    function getColumnStyle(item, column, additionalStyleJSON) {
	        var GROUP_BACKGROUND_COLOR = ['#777777', '#777766', '#776666', '#666666', '#666655', '#665555', '#555555'];
	        var GROUP_CHILD_ROW_COLOR = ['#ffffff', '#eeeeee', '#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa', '#999999'];

	        var rowType = item == null || item.__rowType == null ? null : item.__rowType;
	        if (column != null && rowType == 'G' && item.__groupInfo != null && item.__groupInfo.keys != null && item.__groupInfo.keys.indexOf(column.id) == -1) {
	            var groupByColumn = null;
	            for (var i = 0; i < $scope.listConfig.columns.length; i++) {
	                if (item.__groupInfo.key == $scope.listConfig.columns[i].id) {
	                    groupByColumn = $scope.listConfig.columns[i];
	                    break;
	                }
	            }

	            if (groupByColumn != null) {
	                return getColumnStyle(item, groupByColumn);
	            }
	        }
	        var backColorStyle = '';
	        if (column != null && column.backColorAttributeId != null && column.backColorAttributeId != '' && column.colorMap != null) {
	            var backColor = column.colorMap[item[column.backColorAttributeId]];
	            if (backColor != null && backColor != '') {
	                backColorStyle = "'background':'" + backColor + "'";
	                if (backColor.indexOf('#') >= 0 && parseInt(backColor.replace(/#/g, ''), 16) < parseInt('555555', 16)) {
	                    backColorStyle += ",'color':'white'";
	                }
	            }
	        }

	        var hrefStyle = '';
	        if (column != null && column.onClick != null && column.onClick != '') {
	            if (column.style == null || column.style.indexOf('color') == -1) {
	                hrefStyle += "'color':'blue',";
	            }
	            if (column.style == null || column.style.indexOf('text-decoration') == -1) {
	                hrefStyle += "'text-decoration':'underline'";
	            }
	        }

	        var hiddenStyle = '';
	        if (column != null && rowType == 'D' && item.__groupInfo != null && item.__groupInfo.keys != null && item.__groupInfo.keys.indexOf(column.id) >= 0) {
	            var color = (GROUP_CHILD_ROW_COLOR[item.__groupInfo.keys.indexOf(column.id)] || white);
	            hiddenStyle += "'background':'" + color + "','color':'" + color + "'";
	        }
	        var columnStyle = (column == null ? '' : column.style);
	        if (column != null && column.defaultStyleAttributeId != null && column.defaultStyleAttributeId != '' && column.styleMap != null) {
	            var jsonStyle = column.styleMap[item[column.defaultStyleAttributeId]];
	            if (jsonStyle != null && jsonStyle != '') {
	                try {
	                    jsonStyle = JSON.parse(jsonStyle);
	                } catch (e) {
	                    jsonStyle = null;
	                }

	                if (jsonStyle != null) {
	                    var style = createStyle(jsonStyle, columnStyle, { 'padding': '2px' });
	                    if (style != null && style != '') {
	                        columnStyle = style;
	                    }
	                }
	            }
	        }
	        //var style = backColorStyle + ',' + hrefStyle + ',' + columnStyle + ',' + hiddenStyle;
	        var styleSet = '';
	        if (backColorStyle != '') {
	            styleSet += backColorStyle;
	            if (hrefStyle != '' || columnStyle != '' || hiddenStyle != '') {
	                styleSet += ',';
	            }
	        }
	        if (hrefStyle != '') {
	            styleSet += hrefStyle;
	            if (columnStyle != '' || hiddenStyle != '') {
	                styleSet += ',';
	            }
	        }
	        if (columnStyle != '') {
	            styleSet += columnStyle;
	            if (hiddenStyle != '') {
	                styleSet += ',';
	            }
	        }
	        if (hiddenStyle != '') {
	            styleSet += hiddenStyle + ',';
	        }
	        var style = styleSet;

	        if (rowType == 'G') {
	            //if (style.indexOf('background') == -1) {
	            //   style += ';background:' + (GROUP_BACKGROUND_COLOR[item.__groupInfo.level] || 'gray');
	            //}
	            if (style.indexOf('color') == -1) {
	                style += ",'color':'black'";//white
	            }
	            if (style.indexOf('font-weight') == -1) {
	                style += ",'font-weight':'bold'";
	            }
	        }

	        var jsonStyle = null;
	        try {
	            jsonStyle = JSON.parse("{" + style.replace(/'/g, '"') + "}");
	        } catch (e) {
	        }

	        jsonStyle = jsonStyle || {};

	        if (additionalStyleJSON !== null) {
	            var styleJSON = {};
	            var key = null;
	            for (key in additionalStyleJSON) {
	                styleJSON[key] = styleJSON[key] || additionalStyleJSON[key];
	            }
	            for (key in jsonStyle) {
	                styleJSON[key] = styleJSON[key] || jsonStyle[key];
	            }
	            jsonStyle = styleJSON;
	        }


	        return jsonStyle;
	    }

	    function toggleGroupDisplay(groupId) {
	        if (hiddenGroups[groupId] == null) {
	            hiddenGroups[groupId] = groupId;
	        } else {
	            hiddenGroups[groupId] = null;
	        }
	    }

	    function isGroupHidden(groupId) {
	        return hiddenGroups[groupId] != null;
	    }

	    function isRowVisible(item) {
	        if (item.__groupInfo == null || item.__groupInfo.parentGroupIds == null || item.__groupInfo.parentGroupIds.length == 0) {
	            return true;
	        }

	        for (var i = 0; i < item.__groupInfo.parentGroupIds.length; i++) {
	            if (isGroupHidden(item.__groupInfo.parentGroupIds[i])) {
	                return false;
	            }
	        }

	        return true;
	    }

	    var rowsPerPage = 0;
	    var totalRows = 0;
	    var pageCache = {};

	    function fetchEntityData(page, bUseCache) {
	        $scope.dataFetch = true;
	        page = page || 0;
	        if (page == '') {
	            page = 0;
	        }
	        if (page <= 0) {
	            page = 1;
	        }
	        if (page == 1) {
	            try {
	                rowsPerPage = $scope.listConfig.rowsPerPage.value;
	                sessionStorage.setItem("ROWS_PER_PAGE", JSON.stringify($scope.listConfig.rowsPerPage));
	            } catch (e) {
	                rowsPerPage = 0;
	            }
	        }

	        if (page == 1) {
	            //TODO - Set Filter
	            var globalFilter = localStorage.getItem("filterObject");
	            try {
	                globalFilter = JSON.parse(globalFilter);
	            } catch (e) {
	                globalFilter = {};
	            }
				if (globalFilter == null || globalFilter == undefined) {
					globalFilter = {};
				}

	            var currFilter = createFilter('JSON');
	            for (var i = 0; i < $scope.listConfig.filter.length; i++) {
	                var filter = $scope.listConfig.filter[i];
	                var filterValue = currFilter[filter.id] || currFilter[filter.id + '.in'];
	                globalFilter[filter.id] = filterValue == null ? null : (Array.isArray(filterValue) ? filterValue.join(',') : filterValue);
	            }
	            localStorage.setItem("filterObject", JSON.stringify(globalFilter));
	        }
	        if (bUseCache == null || !bUseCache) {
	            pageCache = {};
	        }
	        $scope.pushDataIntoOld = page > 1;
	        $scope.currentPage = page;
	        $scope.moreRowsFetching = false;
	        $loader.show();
	        $loader.setMessage("Fetching Data...");
	        var listConfig = $scope.listConfig;
	        var apiUrl = replaceParams(listConfig.dataAPI);
	        apiUrl += (apiUrl.indexOf('?') > -1 ? '&' : '?') + createFilter() + createSort();
	        if (listConfig.showPagination) {
	            apiUrl += '&MR=' + rowsPerPage + '&PN=' + page;
	            if (page == 1) {
	                apiUrl += '&RTR=Y';
	            }
	        }

	        var pageMap = pageCache["" + page];

	        if (pageMap == null) {
	            var jsPrefix = 'javascript:';
	            var fetchOptions = {
	                entity: $scope.entity,
	                apiUrl: apiUrl,
	                fetchReferences: true
	            };
	            var errorCallback = function (err) {
	                $scope.listConfig.data = [];
	                angular.element('#listData').show();
	                getHeight();
	                $notifier.error('Error occured while fetching data.')
	                $loader.hide();
	            };

	            if (listConfig.dataAPI.substr(0, jsPrefix.length) == jsPrefix) {
	                var options = {
	                    'filter': createFilter('JSON'),
	                    'sort': createSort()
	                };

	                if (listConfig.showPagination) {
	                    options.pagination = {
	                        'rowsPerPage': rowsPerPage,
	                        'page': page,
	                        'requiredTotalRows': (page == 1)
	                    };
	                }

	                var successCallback = function (data, options, status, headers, config) {
	                    $entityManager.populateAdditionalFields(fetchOptions, data, $scope.entity, function (data) {
	                        postFetchEntityData(data, options, status, headers, config, false);
	                    }, errorCallback);
	                };

	                try {
	                    eval(listConfig.dataAPI.substr(jsPrefix.length));
	                } catch (e) {
	                    errorCallback(e);
	                }
	            } else {
	                $entityManager
					.getData(
						fetchOptions,
						postFetchEntityData,
						errorCallback);
	            }

	        } else {
	            postFetchEntityData(pageMap.data, pageMap.options, pageMap.status, pageMap.headers, pageMap.config, true);
	        }
	    }

	    function onRowSelectionChange(item) {
	        var listConfig = $scope.listConfig;
	        evaluateExpression(item, isItemSelected(item) ? listConfig.onRowSelection : listConfig.onRowUnselection, isItemSelected(item));
	    }

	    function evaluateExpression(item, expression, type) {
	        if (expression == null || expression === '' || expression === '-') {
	            return;
	        }
	        try {
	            eval(expression);
	        } catch (e) {
	            throw e;
	        }
	    }

	    function setPageCaption(pageNo) {
	        pageNo = pageNo - 1;
	        var end = ((pageNo + 1) * rowsPerPage);
	        if (end > totalRows) {
	            end = totalRows;
	        }
	        var pageHelp = '';
	        if (rowsPerPage == 0 || rowsPerPage >= totalRows || $scope.listConfig.showPagination == false || totalRows == 0) {
	            pageHelp = totalRows == 0 ? 'No Record Found.' : 'Showing all ' + totalRows + ' records.';
	        } else {
	            pageHelp = '<span style="color:gray">Showing Page</span>&nbsp;#' + (pageNo + 1) + '<span style="color:gray">&nbsp;, </span>&nbsp;&nbsp;' + ((pageNo * rowsPerPage) + 1) + ' <span style="color:gray">..</span> ' + end + ' <span style="color:gray">out of</span> ' + totalRows + ' <span style="color:gray">records</span>';
	        }
	        angular.element('#pagerMessageBottom').html(pageHelp);
	    }

	    function filterData(data, page) {
	        if ($scope.listConfig.showPagination == false || $scope.paginationAt == null || $scope.paginationAt == 'S' || data == null || data.length == 0 || page == null || rowsPerPage == 0) {
	            data = data;//Nothing to do;
	        } else {
	            var start = (page - 1) * rowsPerPage;
	            var end = page * rowsPerPage;
	            if (end > data.length) {
	                end = data.length;
	            }
	            var pageData = [];
	            for (var i = start; i < end; i++) {
	                pageData.push(data[i]);
	            }
	            data = pageData;
	        }
	        $scope.$emit('equalizeHeight');
	        return data;
	    }

	    function postFetchEntityData(data, options, status, headers, config, bFromCache) {
	        data = data || [];
	        var pageMap = {};
	        pageMap["data"] = data;
	        pageMap["options"] = options;
	        pageMap["status"] = status;
	        pageMap["headers"] = headers;
	        pageMap["config"] = config;
	        pageCache["" + $scope.currentPage] = pageMap;

	        $scope.moreRowsAvailable = headers != null && headers["More-Rows-Available"] === 'Y';
	        var listConfig = $scope.listConfig;

	        var rowSelectionExpression = listConfig.rowSelectionExpression;
	        if (data != null && data.length > 0 && rowSelectionExpression != null && rowSelectionExpression !== '' && rowSelectionExpression !== '-') {
	            $loader.setMessage('Evaluating Row Selection...');
	            for (var i = 0; i < data.length; i++) {
	                var item = data[i];
	                try {
	                    eval("setItemSelection(item, (" + rowSelectionExpression + "));");
	                } catch (e) {
	                }
	            }
	        }

	        var totalRowCount = headers != null && headers["Total-Rows-Available"] != null ? parseInt(headers["Total-Rows-Available"]) : -1;

	        if (totalRowCount != -1) {
	            totalRows = totalRowCount;
	            $scope.paginationAt = 'S';
	        } else if ($scope.currentPage == 1 && (($scope.listConfig.showPagination && rowsPerPage > 0) || ($scope.listConfig.groupByColumns != null && $scope.listConfig.groupByColumns.length > 0)) && !bFromCache) {
	            totalRowCount = data.length;
	            totalRows = data.length;
	            $scope.paginationAt = 'C';
	        }

	        $scope.listConfig.actualData = data;

	        if ($scope.listConfig.groupByColumnsList != null && $scope.listConfig.groupByColumnsList.length > 0) {
	            $loader.setMessage("Updating Group Information...");
	            data = $dataService.groupBy(data, $scope.listConfig.groupByColumnsList);
	        }

	        $scope.listConfig.renderedData = data;

	        hiddenGroups = {};
	        $scope.sortExpression = [];
	        $scope.listConfig.data = filterData($scope.listConfig.renderedData, $scope.currentPage);

	        if (bFromCache) {
	            try {
	                $scope.$apply();
	            } catch (e) {
	            }
	        }
	        $scope.dataFetch = false;

	        if ($scope.listConfig.showPagination && rowsPerPage > 0) {
	            setPageCaption($scope.currentPage);

	            if (totalRows > 0) {
	                angular.element("#pagerContainerBottom").show();
	                if (totalRowCount > 0) {
	                    var paginationOptions = {
	                        items: totalRows,
	                        itemsOnPage: rowsPerPage,
	                        cssStyle: 'compact-theme',
	                        onPageClick: function (pageNumber, event) {
	                            if (pageNumber != $scope.currentPage && $scope.paginationAt == 'S') {
	                                fetchEntityData(pageNumber, true);
	                            } else if (pageNumber != $scope.currentPage && $scope.paginationAt == 'C') {
	                                $scope.currentPage = pageNumber;
	                                $scope.listConfig.data = filterData($scope.listConfig.renderedData, $scope.currentPage);
	                                setPageCaption($scope.currentPage);
	                                try {
	                                    $scope.$apply();
	                                } catch (e) {
	                                }
	                            }
	                        }
	                    };

	                    $('#pagerBottom').pagination(paginationOptions);

	                    if (rowsPerPage >= totalRows) {
	                        angular.element("#pagerBottom").hide();
	                        angular.element("#pagerContainerBottom").show();
	                    } else {
	                        angular.element("#pagerBottom").show();
	                        angular.element("#pagerContainerBottom").show();
	                    }
	                }
	            } else {
	                angular.element("#pagerBottom").hide();
	                angular.element("#pagerContainerBottom").show();
	            }
	        } else if (rowsPerPage == 0 || ($scope.listConfig.groupByColumns != null && $scope.listConfig.groupByColumns.length > 0)) {
	            angular.element("#pagerContainerBottom").show();
	            angular.element("#pagerBottom").hide();
	            setPageCaption($scope.currentPage);
	        } else {
	            angular.element("#pagerContainerBottom").hide();
	        }


	        $scope.pushDataIntoOld = null;
	        $scope.moreRowsFetching = false;
	        angular.element('#listViewHeader').show();
	        angular.element('#listFilter').show();
	        angular.element('#listData').show();
	        $loader.hide();
	        fetchRecentActivities();
	    }

	    function getAPIBase() {
	        var syncAPI = $scope.listConfig.dataAPI || '';
	        var index = syncAPI.indexOf('?');
	        if (index > -1) {
	            syncAPI = syncAPI.substr(0, index);
	        }
	        return syncAPI;
	    }

	    function getMessageText(recResponse) {
	        var messageText = '';
	        if (recResponse == null) {
	            return messageText;
	        }
	        if (recResponse.response != null && recResponse.response.length > 0 && recResponse.response[0].messageText != null && recResponse.response[0].messageText != '') {
	            messageText = recResponse.response[0].messageText;
	        } else if (recResponse.response != null && recResponse.response.length > 0) {
	            messageText = recResponse.response;
	        } else if (recResponse.messageText != null && recResponse.messageText != '') {
	            messageText = recResponse.messageText;
	        }
	        return messageText;
	    }

	    function deleteSelectedItems() {
	        $loader.show();
	        var primaryKeyField = $scope.entity.primaryKeyField;

	        var syncAPI = getAPIBase();

	        var data = getSelectedItems(primaryKeyField);

	        angular.forEach(data, function (record) {
	            record.__row_mode = 'D';
	        });

	        if (data.length === 0) {
	            $notifier.error('Unable to find record(s) to delete. Please check the list/entity configuration and data.');
	            $loader.hide();
	            return;
	        }

	        $dataService
				.synchronize(
					{
					    'apiURL': syncAPI,
					    'data': data,
					    'primaryKeyField': primaryKeyField
					},
					function (response) {
					    var errorCount = 0;
					    var warnCount = 0;
					    var errorMessage = '';
					    var warnMessage = '';
					    for (var i = 0; i < response.length; i++) {
					        var recResponse = response[i];
					        var messageText = getMessageText(recResponse);
					        if (recResponse.status === 'E') {
					            if (messageText != null && messageText != '') {
					                errorMessage += '\n' + messageText;
					            }
					            errorCount++;
					        } else if (recResponse.status === 'W') {
					            if (messageText != null && messageText != '') {
					                warnMessage += '\n' + messageText;
					            }
					            warnCount++;
					        }
					    }

					    if (errorCount > 0) {
					        $notifier.error(errorMessage || 'Error occured...');
					    } else if (warnCount > 0) {
					        $notifier.warn(warnMessage || 'Warning occured...');
					        refresh();
					    } else {
					        $notifier.success('Deleted successfully...');
					        refresh();
					    }

					    $loader.hide();
					}
				);
	    }

	    function ifNull(value, defaultValue) {
	        return value == null ? defaultValue : value;
	    }

	    function max(value1, value2) {
	        return value1 > value2 ? value1 : value2;
	    }

	    function min(value1, value2) {
	        return value1 < value2 ? value1 : value2;
	    }

	    function refresh(bHeader) {
	        if (bHeader) {
	            refreshHeader();
	        }
	        fetchEntityData(0);
	        fetchRecentActivities();
	    }

	    function openPopup(templateURL, templateController, inputParams, functionId, size) {
	        inputParams = inputParams || {};
	        try {
	            for (var routeParamKey in $routeParams) {
	                inputParams[routeParamKey] = inputParams[routeParamKey] || $routeParams[routeParamKey];
	            }
	        } catch (e) {
	        }
	        inputParams.entity = inputParams.entity || $scope.entity;
	        inputParams.refreshParent = refresh;
	        inputParams.refreshHeader = refreshHeader;
	        inputParams.$list = $list;

	        if (functionId == null || functionId == '') {
	            inputParams.__popupFunctionAccess = 'A'; 
				$operationService.openPopup(templateURL, templateController, {'params': inputParams}, size);
	        } else {
	            options = {};
	            options.templateURL = templateURL;
	            options.templateController = templateController;
	            options.size = size;
	            $accessService.openFunctionInPopup(functionId, inputParams, options);
	        }
	    };

	    init();
	}]);