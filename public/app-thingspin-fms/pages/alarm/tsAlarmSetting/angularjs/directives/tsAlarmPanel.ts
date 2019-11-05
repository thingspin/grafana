// js 3rd party libs
import angular from 'angular';
import $ from 'jquery';
// @ts-ignore
import baron from 'baron';

// Grafana libs
import { PanelEvents } from '@grafana/data';

const module = angular.module('grafana.directives');

const template = /*html*/`
  <div class="panel-container" ng-class="{'panel-container--no-title': !ctrl.panel.title.length}">
      <div class="panel-content">
        <ng-transclude class="panel-height-helper"></ng-transclude>
      </div>
    </div>
  </div>
`;

/** @ngInject */
module.directive('tsAlarmPanel', ($rootScope, $document, $timeout: angular.ITimeoutService): angular.IDirective => {
  return {
    restrict: 'E',
    template,
    transclude: true,
    scope: { ctrl: '=' },
    link: (scope: any, elem: angular.IAugmentedJQuery) => {
      const panelContainer = elem.find('.panel-container');
      const panelContent = elem.find('.panel-content');
      const cornerInfoElem = elem.find('.panel-info-corner');
      const ctrl = scope.ctrl;
      let panelScrollbar: any;

      // the reason for handling these classes this way is for performance
      // limit the watchers on panels etc
      let transparentLastState = false;
      let lastHasAlertRule = false;
      let lastAlertState: boolean;
      let hasAlertRule;

      function resizeScrollableContent() {
        if (panelScrollbar) {
          panelScrollbar.update();
        }
      }

      // set initial transparency
      if (ctrl.panel.transparent) {
        transparentLastState = true;
        panelContainer.addClass('panel-transparent');
      }

      // update scrollbar after mounting
      ctrl.events.on(PanelEvents.componentDidMount, () => {
        if (ctrl.__proto__.constructor.scrollable) {
          const scrollRootClass = 'baron baron__root baron__clipper panel-content--scrollable';
          const scrollerClass = 'baron__scroller';
          const scrollBarHTML = `
            <div class="baron__track">
              <div class="baron__bar"></div>
            </div>
          `;

          const scrollRoot = panelContent;
          const scroller = panelContent.find(':first').find(':first');

          scrollRoot.addClass(scrollRootClass);
          $(scrollBarHTML).appendTo(scrollRoot);
          scroller.addClass(scrollerClass);

          panelScrollbar = baron({
            root: scrollRoot[0],
            scroller: scroller[0],
            bar: '.baron__bar',
            barOnCls: '_scrollbar',
            scrollingCls: '_scrolling',
          });

          panelScrollbar.scroll();
        }
      });

      ctrl.events.on(PanelEvents.panelSizeChanged, () => {
        ctrl.calculatePanelHeight(panelContainer[0].offsetHeight);
        $timeout(() => {
          resizeScrollableContent();
          ctrl.render();
        });
      });

      ctrl.events.on(PanelEvents.viewModeChanged, () => {
        // first wait one pass for dashboard fullscreen view mode to take effect (classses being applied)
        setTimeout(() => {
          // then recalc style
          ctrl.calculatePanelHeight(panelContainer[0].offsetHeight);
          // then wait another cycle (this might not be needed)
          $timeout(() => {
            ctrl.render();
            resizeScrollableContent();
          });
        }, 10);
      });

      ctrl.events.on(PanelEvents.render, () => {
        // set initial height
        if (!ctrl.height) {
          ctrl.calculatePanelHeight(panelContainer[0].offsetHeight);
        }

        if (transparentLastState !== ctrl.panel.transparent) {
          panelContainer.toggleClass('panel-transparent', ctrl.panel.transparent === true);
          transparentLastState = ctrl.panel.transparent;
        }

        hasAlertRule = ctrl.panel.alert !== undefined;
        if (lastHasAlertRule !== hasAlertRule) {
          panelContainer.toggleClass('panel-has-alert', hasAlertRule);

          lastHasAlertRule = hasAlertRule;
        }

        if (ctrl.alertState) {
          if (lastAlertState) {
            panelContainer.removeClass('panel-alert-state--' + lastAlertState);
          }

          if (
            ctrl.alertState.state === 'ok' ||
            ctrl.alertState.state === 'alerting' ||
            ctrl.alertState.state === 'pending'
          ) {
            panelContainer.addClass('panel-alert-state--' + ctrl.alertState.state);
          }

          lastAlertState = ctrl.alertState.state;
        } else if (lastAlertState) {
          panelContainer.removeClass('panel-alert-state--' + lastAlertState);
          lastAlertState = null;
        }
      });

      scope.$on('$destroy', () => {
        elem.off();
        cornerInfoElem.off();

        if (panelScrollbar) {
          panelScrollbar.dispose();
        }
      });
    },
  };
});
