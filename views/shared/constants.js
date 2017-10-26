'use strict';
angular.module('shared').constant('$constants', {
    'AppBasePath' : 'http://localhost:3000/',
    'APIBasePath' : 'http://pseaserver.azurewebsites.net/api/v1/',
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
		{'type': 'O365', 'caption': 'O365', 'icon': '/images/office-365-cloud-png-12.png', 'config': {instance: 'https://login.microsoftonline.com/', tenant: 'psea.org', clientId: '6f00369c-a12e-427a-b918-1443d5684d4c', extraQueryParameter: 'nux=1'}}
	],
	'Functions': {
		'ManageTenantSpecificProfile': 6,
		'ManageGlobalProfile': 7,
		'ManageVendors': 8,
		'ManageUsers': 5,
		'Administration': 4
	},
    'StartupTasks': [],
	'SearchConfig': [],
	'MenuConfig': []
});
