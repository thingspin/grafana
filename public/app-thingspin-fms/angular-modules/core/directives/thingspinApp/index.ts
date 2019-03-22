import Drop from 'tether-drop';

import { GrafanaCtrl, grafanaAppDirective } from 'app/routes/GrafanaCtrl';
import { BackendSrv } from 'app/core/services/backend_srv';
import { TimeSrv } from 'app/features/dashboard/services/TimeSrv';
import DatasourceSrv from 'app/features/plugins/datasource_srv';
import { KeybindingSrv, coreModule, appEvents } from 'app/core/core';
import { AngularLoader } from 'app/core/services/AngularLoader';
import { KioskUrlValue } from 'app/types';
import { store } from 'app/store/store';
import { TS_NAV_ACTION_TYPES } from 'app-thingspin-fms/react/redux/reducers/navbar';
import { ILocationService } from 'angular';

export class ThingspinCtrl extends GrafanaCtrl {
  navbarEnable: boolean;
  /** @ngInject */
  constructor(
    $scope,
    utilSrv,
    $rootScope,
    $controller,
    contextSrv,
    bridgeSrv,
    backendSrv: BackendSrv,
    timeSrv: TimeSrv,
    datasourceSrv: DatasourceSrv,
    keybindingSrv: KeybindingSrv,
    angularLoader: AngularLoader
  ) {
    super(
      $scope,
      utilSrv,
      $rootScope,
      $controller,
      contextSrv,
      bridgeSrv,
      backendSrv,
      timeSrv,
      datasourceSrv,
      keybindingSrv,
      angularLoader
    );
    this.navbarEnable = store.getState().thingspinNavbar.enable;
  }
}

// function override
function setViewModeBodyClass(body: JQuery, mode: KioskUrlValue, sidemenuOpen: boolean) {
  body.removeClass('view-mode--tv');
  body.removeClass('view-mode--kiosk');
  body.removeClass('view-mode--inactive');

  switch (mode) {
    case 'tv': {
      // thingspin add code ----
      body.removeClass('sidemenu-open');
      // thingspin add code ----
      body.addClass('view-mode--tv');
      break;
    }
    // 1 & true for legacy states
    case '1':
    case true: {
      // thingspin add code ----
      body.removeClass('sidemenu-open');
      // thingspin add code ----
      body.addClass('view-mode--kiosk');
      break;
    }
    // thingspin add code ----
    default:
      body.toggleClass('sidemenu-open', sidemenuOpen);
    // thingspin add code ----
  }
}

/** @ngInject */
export function thingspinAppDirective(playlistSrv, contextSrv, $timeout, $rootScope, $location: ILocationService) {
  // link function override
  const link = (scope, elem) => {
    // thingspin add code ----
    let sidemenuOpen;
    // thingspin add code ----

    const body = $('body');

    // see https://github.com/zenorocha/clipboard.js/issues/155
    $.fn.modal.Constructor.prototype.enforceFocus = () => {};

    $('.preloader').remove();

    // thingspin add code ----
    sidemenuOpen = scope.contextSrv.sidemenu;
    body.toggleClass('sidemenu-open', sidemenuOpen);

    appEvents.on('toggle-sidemenu', () => {
      sidemenuOpen = scope.contextSrv.sidemenu;
      body.toggleClass('sidemenu-open');
    });

    appEvents.on('toggle-right-sidebar', (enable: boolean | undefined) => {
      if (enable === undefined) {
        enable = store.getState().thingspinNavbar.enableRightSidebarButton;
      }
      body.toggleClass('rightmenu-open', enable);
      store.dispatch({
        type: TS_NAV_ACTION_TYPES.UPDATE_NAV,
        payload: {
          enableRightSidebarButton: !enable,
        },
      });
    });
    appEvents.on('ts-change-viewmode', num => {
      // Virtual DOM events Methods
      const getBeforeViewMode = (num: number) => {
        const search: { kiosk?: KioskUrlValue } = {};
        switch (num) {
          case 0: {
            search.kiosk = true; //or '1';
            break;
          }
          case 1: {
            break;
          }
          case 2: {
            search.kiosk = 'tv';
          }
        }
        return search;
      };
      const search: any = getBeforeViewMode(num);
      $location.search(search);
      appEvents.emit('toggle-kiosk-mode');
    });
    // thingspin add code ----

    appEvents.on('toggle-sidemenu-mobile', () => {
      body.toggleClass('sidemenu-open--xs');
    });

    appEvents.on('toggle-sidemenu-hidden', () => {
      body.toggleClass('sidemenu-hidden');
    });

    appEvents.on('playlist-started', () => {
      elem.toggleClass('view-mode--playlist', true);
    });

    appEvents.on('playlist-stopped', () => {
      elem.toggleClass('view-mode--playlist', false);
    });

    // check if we are in server side render
    if (document.cookie.indexOf('renderKey') !== -1) {
      body.addClass('body--phantomjs');
    }

    // tooltip removal fix
    // manage page classes
    let pageClass;
    scope.$on('$routeChangeSuccess', (evt, data) => {
      if (pageClass) {
        body.removeClass(pageClass);
      }

      if (data.$$route) {
        pageClass = data.$$route.pageClass;
        if (pageClass) {
          body.addClass(pageClass);
        }
      }

      // clear body class sidemenu states
      body.removeClass('sidemenu-open--xs');

      $('#tooltip, .tooltip').remove();

      // check for kiosk url param
      setViewModeBodyClass(body, data.params.kiosk, sidemenuOpen);

      // close all drops
      for (const drop of Drop.drops) {
        drop.destroy();
      }

      appEvents.emit('hide-dash-search');
    });

    // handle kiosk mode
    appEvents.on('toggle-kiosk-mode', (options: { exit?: boolean }) => {
      const search: { kiosk?: KioskUrlValue } = $location.search();

      if (options && options.exit) {
        search.kiosk = '1';
      }

      switch (search.kiosk) {
        case 'tv': {
          search.kiosk = true;
          appEvents.emit('alert-success', ['Press ESC to exit Kiosk mode']);
          break;
        }
        case '1':
        case true: {
          delete search.kiosk;
          break;
        }
        default: {
          search.kiosk = 'tv';
        }
      }
      // thingspin add code ----
      store.dispatch({
        type: TS_NAV_ACTION_TYPES.UPDATE_VIEWMODE,
        payload: search.kiosk,
      });
      // thingspin add code ----

      $timeout(() => $location.search(search));
      setViewModeBodyClass(body, search.kiosk, sidemenuOpen);
    });

    // handle in active view state class
    let lastActivity = new Date().getTime();
    let activeUser = true;
    const inActiveTimeLimit = 60 * 5000;

    function checkForInActiveUser() {
      if (!activeUser) {
        return;
      }
      // only go to activity low mode on dashboard page
      if (!body.hasClass('page-dashboard')) {
        return;
      }

      if (new Date().getTime() - lastActivity > inActiveTimeLimit) {
        activeUser = false;
        body.addClass('view-mode--inactive');
      }
    }

    function userActivityDetected() {
      lastActivity = new Date().getTime();
      if (!activeUser) {
        activeUser = true;
        body.removeClass('view-mode--inactive');
      }
    }

    // mouse and keyboard is user activity
    body.mousemove(userActivityDetected);
    body.keydown(userActivityDetected);
    // set useCapture = true to catch event here
    document.addEventListener('wheel', userActivityDetected, { capture: true, passive: true });
    // treat tab change as activity
    document.addEventListener('visibilitychange', userActivityDetected);

    // check every 2 seconds
    setInterval(checkForInActiveUser, 2000);

    appEvents.on('toggle-view-mode', () => {
      lastActivity = 0;
      checkForInActiveUser();
    });

    // handle document clicks that should hide things
    body.click(evt => {
      const target = $(evt.target);
      if (target.parents().length === 0) {
        return;
      }

      // ensure dropdown menu doesn't impact on z-index
      body.find('.dropdown-menu-open').removeClass('dropdown-menu-open');

      // for stuff that animates, slides out etc, clicking it needs to
      // hide it right away
      const clickAutoHide = target.closest('[data-click-hide]');
      if (clickAutoHide.length) {
        const clickAutoHideParent = clickAutoHide.parent();
        clickAutoHide.detach();
        setTimeout(() => {
          clickAutoHideParent.append(clickAutoHide);
        }, 100);
      }

      // hide search
      if (body.find('.search-container').length > 0) {
        if (target.parents('.search-results-container, .search-field-wrapper').length === 0) {
          scope.$apply(() => {
            scope.appEvent('hide-dash-search');
          });
        }
      }

      // hide popovers
      const popover = elem.find('.popover');
      if (popover.length > 0 && target.parents('.graph-legend').length === 0) {
        popover.hide();
      }

      // hide time picker
      const timePickerDropDownIsOpen = elem.find('.gf-timepicker-dropdown').length > 0;
      if (timePickerDropDownIsOpen) {
        const targetIsInTimePickerDropDown = target.parents('.gf-timepicker-dropdown').length > 0;
        const targetIsInTimePickerNav = target.parents('.gf-timepicker-nav').length > 0;
        const targetIsDatePickerRowBtn = target.parents('td[id^="datepicker-"]').length > 0;
        const targetIsDatePickerHeaderBtn = target.parents('button[id^="datepicker-"]').length > 0;

        if (
          targetIsInTimePickerNav ||
          targetIsInTimePickerDropDown ||
          targetIsDatePickerRowBtn ||
          targetIsDatePickerHeaderBtn
        ) {
          return;
        }

        scope.$apply(() => {
          scope.appEvent('closeTimepicker');
        });
      }
    });
  };

  return Object.assign(grafanaAppDirective(playlistSrv, contextSrv, $timeout, $rootScope, $location), {
    controller: ThingspinCtrl,
    controllerAs: 'ctrl',
    link,
  });
}

coreModule.directive('thingspinApp', thingspinAppDirective);
