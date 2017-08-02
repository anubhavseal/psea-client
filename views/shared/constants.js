'use strict';
angular.module('shared').constant('$constants', {
    'AppBasePath' : 'http://localhost:3000/',
    'APIBasePath' : 'http://pseaserver.eastus.cloudapp.azure.com:8080/api/v1/',
	'HideMenuBar': true, 
	'HomePage': '/profiles',
	'LoginPage': '/security/login',
	'AcceptAgreementPage': '/acceptagreement',
	'ChangePasswordPage': '/changepassword',
	'SelectTenantPage': '/selecttenant',
	'UnsecuredRoutes': [],
	'HeaderLessRoutes': [],
	'MenuLessRoutes': [],
	'LogLevel': 1, 
	'CACHE_ENABLED': true,
	'SupportedAuthentications': [
		{'type': 'DB', 'caption': 'Database', 'icon': null},
		{'type': 'O365', 'caption': 'O365', 'icon': '/images/office-365-cloud-png-12.png', 'config': {instance: 'https://login.microsoftonline.com/', tenant: 'motifworks.com', clientId: 'b28c22a2-e7c9-498a-99be-16c726703418', extraQueryParameter: 'nux=1'}}
	],
	'Functions': {
		'ManageTenantSpecificProfile': 6,
		'ManageGlobalProfile': 7,
		'ManageVendors': 8,
		'ManageUsers': 5,
		'Administration': 4,
		'Drives': 2
	},
    'StartupTasks': [],
	'SearchConfig': [
		{'service': '$testDriveSearchService', 'method': 'searchTestDrives'},
		{'service': '$testDriveSearchService', 'method': 'searchTestDriveInstances'},
		{'service': '$testDriveSearchService', 'method': 'searchBaseEnvironments'}
	],
	'MenuConfig': [
		{'service': '$testDriveSearchService', 'method': 'searchAccessibleDrives'}
	]
});
