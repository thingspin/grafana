// ref: ../app.ts
import angular from 'angular';
import config from 'app/core/config';
import _ from 'lodash';
import moment from 'moment';

import { GrafanaApp } from 'app/app';
import { coreModule, angularModules } from './grafana_custom/core_module';
import { registerAngularDirectives } from './grafana_custom/core';
import { setupAngularRoutes } from './routes/routes';

class ThingspinFmsApp extends GrafanaApp {
  constructor() {
    super();
  }

  init() {
    const app = angular.module('thingspin', []);

    moment.locale(config.bootData.user.locale);

    app.config(($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $httpProvider, $provide) => {
      // pre assing bindings before constructor calls
      $compileProvider.preAssignBindingsEnabled(true);

      if (config.buildInfo.env !== 'development') {
        $compileProvider.debugInfoEnabled(false);
      }

      $httpProvider.useApplyAsync(true);

      this.registerFunctions.controller = $controllerProvider.register;
      this.registerFunctions.directive = $compileProvider.directive;
      this.registerFunctions.factory = $provide.factory;
      this.registerFunctions.service = $provide.service;
      this.registerFunctions.filter = $filterProvider.register;

      $provide.decorator('$http', [
        '$delegate',
        '$templateCache',
        ($delegate, $templateCache) => {
          const get = $delegate.get;
          $delegate.get = (url, config) => {
            if (url.match(/\.html$/)) {
              // some template's already exist in the cache
              if (!$templateCache.get(url)) {
                url += '?v=' + new Date().getTime();
              }
            }
            return get(url, config);
          };
          return $delegate;
        },
      ]);
    });

    this.ngModuleDependencies = [
      'grafana.core',
      'ngRoute',
      'ngSanitize',
      '$strap.directives',
      'ang-drag-drop',
      'thingspin',
      'pasvaz.bindonce',
      'ui.bootstrap',
      'ui.bootstrap.tpls',
      'react',
    ];

    // makes it possible to add dynamic stuff
    _.each(angularModules, m => {
      this.useModule(m);
    });

    // register react angular wrappers
    coreModule.config(setupAngularRoutes);
    registerAngularDirectives();

    // disable tool tip animation
    $.fn.tooltip.defaults.animation = false;

    // bootstrap the app
    angular.bootstrap(document, this.ngModuleDependencies).invoke(() => {
      _.each(this.preBootModules, module => {
        _.extend(module, this.registerFunctions);
      });

      this.preBootModules = null;
    });
  }
}

export default new ThingspinFmsApp();
