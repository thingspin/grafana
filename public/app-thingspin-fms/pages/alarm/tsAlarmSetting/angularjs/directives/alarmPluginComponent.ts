// js 3rd party libs
import _ from 'lodash';
import angular from 'angular';

// Grafana libs
import config from 'app/core/config';
import { PanelEvents } from '@grafana/data';
import coreModule from 'app/core/core_module';
import { importPanelPlugin } from 'app/features/plugins/plugin_loader';

/** @ngInject */
function alarmPluginDirectiveLoader( $compile: any, $q: angular.IQService, $http: any, $templateCache: any ) {

  function getTemplate(component: { template: any; templateUrl: any }) {
    if (component.template) {
      return $q.when(component.template);
    }

    const cached = $templateCache.get(component.templateUrl);
    if (cached) {
      return $q.when(cached);
    }

    return $http.get(component.templateUrl).then(({ data }: any) => data);
  }

  function relativeTemplateUrlToAbs(templateUrl: string, baseUrl: string) {
    if (!templateUrl) {
      return undefined;
    }

    if (templateUrl.indexOf('public') === 0) {
      return templateUrl;
    }

    return baseUrl + '/' + templateUrl;
  }

  function getPluginComponentDirective(options: any) {
    // handle relative template urls for plugin templates
    options.Component.templateUrl = relativeTemplateUrlToAbs(options.Component.templateUrl, options.baseUrl);

    return () => {
      return {
        templateUrl: options.Component.templateUrl,
        template: options.Component.template,
        restrict: 'E',
        controller: options.Component,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: options.bindings,
        link: (scope: any, elem: any, attrs: any, ctrl: any) => {
          if (ctrl.link) {
            ctrl.link(scope, elem, attrs, ctrl);
          }
          if (ctrl.init) {
            ctrl.init();
          }
        },
      };
    };
  }

  function loadPanelComponentInfo(scope: any, attrs: any) {
    const componentInfo: any = {
      name: 'panel-plugin-' + scope.panel.type,
      bindings: { dashboard: '=', panel: '=', row: '=' },
      attrs: {
        dashboard: 'dashboard',
        panel: 'panel',
        class: 'panel-height-helper',
      },
    };

    const panelInfo = config.panels[scope.panel.type];
    return importPanelPlugin(panelInfo.id).then(panelPlugin => {
      const PanelCtrl = panelPlugin.angularPanelCtrl;
      componentInfo.Component = PanelCtrl;

      if (!PanelCtrl || PanelCtrl.registered) {
        return componentInfo;
      }

      if (PanelCtrl.templatePromise) {
        return PanelCtrl.templatePromise.then((res: any) => componentInfo );
      }

      if (panelInfo) {
        PanelCtrl.templateUrl = relativeTemplateUrlToAbs(PanelCtrl.templateUrl, panelInfo.baseUrl);
      }

      PanelCtrl.templatePromise = getTemplate(PanelCtrl).then((template: any) => {
        PanelCtrl.templateUrl = null;
        PanelCtrl.template = `<ts-alarm-panel ctrl="ctrl" class="panel-height-helper">${template}</ts-alarm-panel>`;
        return componentInfo;
      });

      return PanelCtrl.templatePromise;
    });
  }

  function getModule(scope: any, attrs: any): any {
    switch (attrs.type) {
      // Panel
      case 'panel': {
        return loadPanelComponentInfo(scope, attrs);
      }

      default: {
        return $q.reject({
          message: 'Could not find component type: ' + attrs.type,
        });
      }
    }
  }

  function appendAndCompile(scope: any, elem: JQuery, componentInfo: any) {
    const child = angular.element(document.createElement(componentInfo.name));
    _.each(componentInfo.attrs, (value, key) => {
      child.attr(key, value);
    });

    $compile(child)(scope);
    elem.empty();

    // let a binding digest cycle complete before adding to dom
    setTimeout(() => {
      scope.$applyAsync(() => {
        elem.append(child);
        setTimeout(() => {
          scope.$applyAsync(() => {
            scope.$broadcast(PanelEvents.componentDidMount);
          });
        });
      });
    });
  }

  function registerPluginComponent(scope: any, elem: JQuery, attrs: any, componentInfo: any) {
    if (componentInfo.notFound) {
      elem.empty();
      return;
    }

    if (!componentInfo.Component) {
      throw {
        message: 'Failed to find exported plugin component for ' + componentInfo.name,
      };
    }

    if (!componentInfo.Component.registered) {
      const directiveName = attrs.$normalize(componentInfo.name);
      const directiveFn = getPluginComponentDirective(componentInfo);
      coreModule.directive(directiveName, directiveFn);
      componentInfo.Component.registered = true;
    }

    appendAndCompile(scope, elem, componentInfo);
  }

  return {
    restrict: 'E',
    link: async (scope: any, elem: JQuery, attrs: any) => {
      try {
        const cInfo = await getModule(scope, attrs);

        registerPluginComponent(scope, elem, attrs, cInfo);
      } catch (err) {
        console.log('Plugin component error', err);
      }
    },
  };
}

coreModule.directive('alarmPluginComponent', alarmPluginDirectiveLoader);
