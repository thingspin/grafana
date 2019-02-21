import { angularModules as gfNg1Modules, coreModule } from 'app/core/core_module';
import tsModules from '../angular-modules/thingspin.module';

const angularModules = gfNg1Modules.concat(tsModules);

export { angularModules, coreModule };

export default coreModule;
