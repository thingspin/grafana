import angular from 'angular';
import { angularModules as gfNgModules, coreModule } from 'app/core/core_module';

const baseModuleName = `thingspin`;
const angularModules = gfNgModules.concat([
  angular.module(`${baseModuleName}.controllers`, []),
  angular.module(`${baseModuleName}.directives`, []),
  angular.module(`${baseModuleName}.factories`, []),
  angular.module(`${baseModuleName}.services`, []),
  angular.module(`${baseModuleName}.filters`, []),
  angular.module(`${baseModuleName}.routes`, []),
]);

export { angularModules, coreModule };

export default coreModule;
