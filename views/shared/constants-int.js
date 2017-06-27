'use strict';
angular.module('shared').constant('$constants', {
	'AppBasePath' : 'http://int.trial.io/',
	'APIBasePath' : 'http://int.trial.io:3001/api/',
	'HTTPSAPIBasePath' : 'https://int.trial.io:8443/api/',
	'HomePage': '/home',
	'LoginPage': '/security/login',
	'AcceptAgreementPage': '/acceptagreement',
	'ChangePasswordPage': '/changepassword',
	'UnsecuredRoutes': ['/drives/:testDriveName/environments/:testDriveInstanceId/provision', '/drives/:testDriveName/environments/:testDriveInstanceId/connect'],
	'HeaderLessRoutes': [],
	'MenuLessRoutes': ['/updatesubscriptioninfo'],
	'LogLevel': 1,
	'CACHE_ENABLED': true,	
	'BaseEnvironmentConfig': {
		'DefaultSubscriptionId': 1, 
		'DefaultSize': 'A0',
		'DefaultParameters': {'subscriptionId': '{subscriptionId}', 'cloudUserName': '{cloudUserName}', 'cloudPassword': '{cloudPassword}'},
		'CreateCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType PROVISION -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'CaptureCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType CAPTURE -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'StartCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType MODIFY -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'DeleteCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType DELETE -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'StopCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType STOP -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'UpdateCommand': 'C:\\Trialio\\DeployPlatform.ps1 -configType UPDATETEMPLATE -VMSize {VMSize} -commFolder "baseenv" -serviceName "{Prefix}" -password "{Password}"',
		'CommunicationFolder': 'c:\\AppLog\\baseenv\\', 
		'LogFolder': "C:\\AppLog\\GenericVHDBase",
		'DriveCommand': {
			'Delete':        "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType DELETE         -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}'", 
			'Start':         "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType START          -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}' -reservedIP {reservedIP}",
			'Stop':          "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType STOP           -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}'", 
			'Provision':     "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType PROVISION      -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}' -VHDURI '{VHDURI}' -osType '{osType}' -location '{location}' -reservedIP {reservedIP}", 
			'Credentials':   "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType CREDENTIALS    -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}'",
			'Verifyinstance':"C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType VERIFYINSTANCE -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}'",
			'Status':		 "C:\\Trialio\\DeployTestDrive.ps1 -testDriveName GenericVHDBase -serviceName {SiteName} -password {LoginPassword} -VMSize {VMSize} -ConfigType STATUS	       -subscriptionId '{subscriptionId}' -cloudUserName '{cloudUserName}' -cloudPassword '{cloudPassword}'"
		}
	},  
	'GuacamoleConfig': {
		"basePath": "http://webconsole.trial.io/access/#/", 
		"basePathHttps": "https://webconsole.trial.io/access/#/"
	},
	'SupportedTimezones': [
		{'id': 'America/Montreal', 'caption': 'Eastern Time Zone (EST - America/Montreal)'},
		{'id': 'Asia/Calcutta', 'caption': 'Indian Standard Time (IST - Asia/Calcutta)'},
		{'id': 'America/Dawson', 'caption': 'Pacific (PT - America/Dawson)'}
	],
	'DefaultRegistrationFields': [
		{'label': 'Name', 'key': 'userName', 'controlType': 'text'}, 
		{'label': 'Company Name', 'key': 'companyName', 'controlType': 'text'}, 
		{'label': 'Email', 'key': 'email', 'controlType': 'email'}, 
		{'label': 'Contact Number', 'key': 'contactNumber', 'controlType': 'tel'}, 
		{'label': 'Country', 'key': 'location', 'controlType': 'dropdown'}
	],
	'Functions': {
		'ManageTenantSpecificProfile': 6,
		'ManageGlobalProfile': 7,
		'ManageVendors': 8,
		'ManageUsers': 5,
		'Administration': 4,
		'Drives': 2
	},
	'SearchConfig': [
		{'service': '$testDriveSearchService', 'method': 'searchTestDrives'},
		{'service': '$testDriveSearchService', 'method': 'searchTestDriveInstances'},
		{'service': '$testDriveSearchService', 'method': 'searchBaseEnvironments'}
	],
	'MenuConfig': [
		{'service': '$testDriveSearchService', 'method': 'searchAccessibleDrives'}
	]
});
