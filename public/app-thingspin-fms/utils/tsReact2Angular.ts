import angular from 'angular';
import { provideTheme } from 'app/core/utils/ConfigProvider';

export function tsReact2AngularDirective(name: string, component: any, options: any) {
  angular.module('thingspin.directives').directive(name, [
    'reactDirective',
    reactDirective => {
      return reactDirective(provideTheme(component), options);
    },
  ]);
}
