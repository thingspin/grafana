// ref: ../app.ts
import { GrafanaApp } from 'app/app';

import angular from 'angular';
import config from 'app/core/config';
import _ from 'lodash';

import { setLocale } from '@grafana/data';

import { coreModule, angularModules } from './grafana_custom/core_module';
import { tsRegisterAngularDirectives } from './angular-modules/tsCore';
import { registerAngularDirectives } from './grafana_custom/core';
import { importPluginModule } from 'app/features/plugins/plugin_loader';
import './plugins/plugin_loaders';
import { setMarkdownOptions } from '@grafana/data';

import { fmsSetupAngularRoutes } from './routes/routes';
import addThingspinReducers from './react/redux/addReducers';
import 'angular-ui-tree';

import './angular-modules/core';
import './pages/login/TsResetPassword';
import './pages/login/TsSignup';

addThingspinReducers();

class ThingspinFmsApp extends GrafanaApp {
  ng1App: any;

  constructor() {
    super();

    this.ng1App = angular.module('thingspin', []);

    setLocale(config.bootData.user.locale);

    setMarkdownOptions({ sanitize: !config.disableSanitizeHtml });

    this.ngModuleDependencies = [
      'grafana.core',
      'ngRoute',
      'ngSanitize',
      '$strap.directives',
      'ang-drag-drop',
      'thingspin',
      'pasvaz.bindonce',
      'react',
      'ui.tree',
    ];
  }

  init() {
    this.ng1App.config(
      (
        $locationProvider: angular.ILocationProvider,
        $controllerProvider: angular.IControllerProvider,
        $compileProvider: angular.ICompileProvider,
        $filterProvider: angular.IFilterProvider,
        $httpProvider: angular.IHttpProvider,
        $provide: angular.auto.IProvideService
      ) => {
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

        // redefine $http.get function
        $provide.decorator('$http', [
          '$delegate',
          '$templateCache',
          ($delegate: any, $templateCache: any) => {
            const get = $delegate.get;
            $delegate.get = (url: string, config: any) => {
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
      }
    );

    // makes it possible to add dynamic stuff
    _.each(angularModules, (m: angular.IModule) => {
      this.useModule(m);
    });

    // register react angular wrappers
    coreModule.config(fmsSetupAngularRoutes);
    // ThingSPIN용 React Component 등록
    tsRegisterAngularDirectives();
    registerAngularDirectives();

    // disable tool tip animation
    $.fn.tooltip.defaults.animation = false;

    // bootstrap the app
    angular.bootstrap(document, this.ngModuleDependencies).invoke(() => {
      _.each(this.preBootModules, (module: angular.IModule) => {
        _.extend(module, this.registerFunctions);
      });

      this.preBootModules = null;
    });

    // Preload selected app plugins
    for (const modulePath of config.pluginsToPreload) {
      importPluginModule(modulePath);
    }
  }
}

export default new ThingspinFmsApp();
