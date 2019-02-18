import { angularModules as gfNgModules, coreModule } from 'app/core/core_module';
import tsModules from '../angular-modules/thingspin.module';

const angularModules = gfNgModules.concat(tsModules);

export { angularModules, coreModule };

export default coreModule;
