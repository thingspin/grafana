// import angular from 'angular';
import { provideTheme } from 'app/core/utils/ConfigProvider';
import { coreModule } from 'app/core/core';

export function tsReact2AngularDirective(name: string, component: any, options: any) {
  coreModule.directive(name, (reactDirective, $injector, $route, $rootScope) => {
    return reactDirective(provideTheme(component), options, null, { $injector, $route, $rootScope });
  });
}

// ref : https://gist.github.com/bennadel/647bf5b82b9d4332e8f0
// ref : https://mobicon.tistory.com/329
export function multipleDirectiveSelector($delegate) {
  for (const mod of $delegate) {
    if (mod.$$moduleName === 'thingspin.directives') {
      return [mod];
    }
  }
  return [$delegate[0]];
}
