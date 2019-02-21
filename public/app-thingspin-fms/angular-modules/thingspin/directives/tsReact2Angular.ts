// import angular from 'angular';
import { provideTheme } from 'app/core/utils/ConfigProvider';
import { coreModule } from 'app/core/core';

export function tsReact2AngularDirective(name: string, component: any, options: any) {
  coreModule.directive(name, [
    'reactDirective',
    reactDirective => {
      return reactDirective(provideTheme(component), options);
    },
  ]);
}
