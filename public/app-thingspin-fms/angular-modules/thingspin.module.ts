import angular from 'angular';

const baseModuleName = `thingspin`;

const tsAngularJsModules = [
  angular.module(`${baseModuleName}.controllers`, []),
  angular.module(`${baseModuleName}.directives`, []),
  angular.module(`${baseModuleName}.factories`, []),
  angular.module(`${baseModuleName}.services`, []),
  angular.module(`${baseModuleName}.filters`, []),
  angular.module(`${baseModuleName}.routes`, []),
];

export default tsAngularJsModules;
