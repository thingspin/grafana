// Services & Utils
import { createErrorNotification } from 'app/core/copy/appNotification';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { DashboardLoaderSrv } from 'app/features/dashboard/services/DashboardLoaderSrv';
import { TimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { AnnotationsSrv } from 'app/features/annotations/annotations_srv';
import { VariableSrv } from 'app/features/templating/variable_srv';
import { KeybindingSrv } from 'app/core/services/keybindingSrv';

// Actions
import { updateLocation } from 'app/core/actions';
import { notifyApp } from 'app/core/actions';
import locationUtil from 'app/core/utils/location_util';
import {
  dashboardInitFetching,
  dashboardInitCompleted,
  dashboardInitFailed,
  dashboardInitSlow,
  dashboardInitServices,
} from 'app/features/dashboard/state/actions';

// Types
import { DashboardModel } from 'app/features/dashboard/state';
import { DashboardRouteInfo, StoreState, ThunkDispatch, ThunkResult, DashboardDTO } from 'app/types';
import { InitDashboardArgs } from 'app/features/dashboard/state/initDashboard';

// ThingSPIN
import { AlarmDashboardSrv } from '../angularjs/services/tsDashboardSrv';
import { AlarmUnsavedChangesSrv } from '../angularjs/services/UnsavedChangesSrv';

async function redirectToNewUrl(slug: string, dispatch: ThunkDispatch, currentPath: string) {
  const res = await getBackendSrv().getDashboardBySlug(slug);

  if (res) {
    let newUrl = res.meta.url;

    // fix solo route urls
    if (currentPath.indexOf('dashboard-solo') !== -1) {
      newUrl = newUrl.replace('/d/', '/d-solo/');
    }

    const url = locationUtil.stripBaseFromUrl(newUrl);
    dispatch(updateLocation({ path: url, partial: true, replace: true }));
  }
}

async function fetchDashboard(
  args: InitDashboardArgs,
  dispatch: ThunkDispatch,
  getState: () => StoreState
): Promise<DashboardDTO | null> {
  try {
    switch (args.routeInfo) {
      case DashboardRouteInfo.Home: {
        // load home dash
        const dashDTO: DashboardDTO = await getBackendSrv().get('/api/dashboards/home');

        // if user specified a custom home dashboard redirect to that
        if (dashDTO.redirectUri) {
          const newUrl: string = locationUtil.stripBaseFromUrl(dashDTO.redirectUri);
          dispatch(updateLocation({ path: newUrl, replace: true }));
          return null;
        }

        // disable some actions on the default home dashboard
        dashDTO.meta.canSave = false;
        dashDTO.meta.canShare = false;
        dashDTO.meta.canStar = false;
        return dashDTO;
      }
      case DashboardRouteInfo.Normal: {
        // for old db routes we redirect
        if (args.urlType === 'db') {
          redirectToNewUrl(args.urlSlug, dispatch, getState().location.path);
          return null;
        }

        const loaderSrv: DashboardLoaderSrv = args.$injector.get('dashboardLoaderSrv');
        const dashDTO: DashboardDTO = await loaderSrv.loadDashboard(args.urlType, args.urlSlug, args.urlUid);

        if (args.fixUrl && dashDTO.meta.url) {
          // check if the current url is correct (might be old slug)
          const dashboardUrl = locationUtil.stripBaseFromUrl(dashDTO.meta.url)
            .replace("/d/", "/thingspin/alarm/"); // convert dashboard Url -> thingspin 알람 Url
          const currentPath = getState().location.path;

          if (dashboardUrl !== currentPath) {
            // replace url to not create additional history items and then return so that initDashboard below isn't executed multiple times.
            dispatch(updateLocation({ path: dashboardUrl, partial: true, replace: true }));
            return null;
          }
        }
        return dashDTO;
      }
      case DashboardRouteInfo.New: {
        return getNewDashboardModelData(args.urlFolderId);
      }
      default:
        throw { message: 'Unknown route ' + args.routeInfo };
    }
  } catch (err) {
    dispatch(dashboardInitFailed({ message: 'Failed to fetch dashboard', error: err }));
    console.log(err);
    return null;
  }
}

/**
 * This action (or saga) does everything needed to bootstrap a dashboard & dashboard model.
 * First it handles the process of fetching the dashboard, correcting the url if required (causing redirects/url updates)
 *
 * This is used both for single dashboard & solo panel routes, home & new dashboard routes.
 *
 * Then it handles the initializing of the old angular services that the dashboard components & panels still depend on
 *
 */
export function tsInitDashboard(args: InitDashboardArgs): ThunkResult<void> {
  return async (dispatch, getState) => {
    // set fetching state
    dispatch(dashboardInitFetching());

    // Detect slow loading / initializing and set state flag
    // This is in order to not show loading indication for fast loading dashboards as it creates blinking/flashing
    setTimeout(() => {
      if (getState().dashboard.model === null) {
        dispatch(dashboardInitSlow());
      }
    }, 500);

    // fetch dashboard data
    const dashDTO = await fetchDashboard(args, dispatch, getState);

    // returns null if there was a redirect or error
    if (!dashDTO) {
      return;
    }

    // set initializing state
    dispatch(dashboardInitServices());

    // create model
    let dashboard: DashboardModel;
    try {
      dashboard = new DashboardModel(dashDTO.dashboard, dashDTO.meta);
    } catch (err) {
      dispatch(dashboardInitFailed({ message: 'Failed create dashboard model', error: err }));
      console.log(err);
      return;
    }

    // add missing orgId query param
    const storeState = getState();
    if (!storeState.location.query.orgId) {
      dispatch(updateLocation({ query: { orgId: storeState.user.orgId }, partial: true, replace: true }));
    }

    // init services
    const timeSrv: TimeSrv = args.$injector.get('timeSrv');
    const annotationsSrv: AnnotationsSrv = args.$injector.get('annotationsSrv');
    const variableSrv: VariableSrv = args.$injector.get('variableSrv');
    const keybindingSrv: KeybindingSrv = args.$injector.get('keybindingSrv');
    const unsavedChangesSrv: AlarmUnsavedChangesSrv = args.$injector.get('unsavedChangesSrv');
    const dashboardSrv: AlarmDashboardSrv = args.$injector.get('dashboardSrv');

    timeSrv.init(dashboard);
    annotationsSrv.init(dashboard);

    // template values service needs to initialize completely before
    // the rest of the dashboard can load
    try {
      await variableSrv.init(dashboard);
    } catch (err) {
      dispatch(notifyApp(createErrorNotification('Templating init failed', err)));
      console.log(err);
    }

    try {
      dashboard.processRepeats();
      dashboard.updateSubmenuVisibility();

      // handle auto fix experimental feature
      const queryParams = getState().location.query;
      if (queryParams.autofitpanels) {
        dashboard.autoFitPanels(window.innerHeight, queryParams.kiosk);
      }

      // init unsaved changes tracking
      unsavedChangesSrv.alarmInit(dashboard, args.$scope);
      keybindingSrv.setupDashboardBindings(args.$scope, dashboard);
    } catch (err) {
      dispatch(notifyApp(createErrorNotification('Dashboard init failed', err)));
      console.log(err);
    }

    // legacy srv state
    dashboardSrv.setCurrent(dashboard);
    // yay we are done
    dispatch(dashboardInitCompleted(dashboard));
  };
}

function getNewDashboardModelData(urlFolderId?: string): any {
  const data: any = {
    meta: {
      canStar: false,
      canShare: false,
      isNew: true,
      canEdit: false,
      folderId: 0,
    },
    dashboard: {
      title: '신규 알람',
      panels: [
        {
          datasource: "사이트 태그",
          type: "graph",
          gridPos: { x: 0, y: 0, w: 24, h: 13 },

          isEditing: true,
          fullscreen: true,

          // default alarm
          alert: {
            alertRuleTags: {},
            conditions: [
              {
                evaluator: {
                  params: [],
                  type: "gt",
                },
                operator: {
                  type: "and",
                },
                query: {
                  params: [ "A", "5m", "now" ],
                },
                reducer: {
                  params: [],
                  type: "avg"
                },
                type: "query"
              }
            ],
            executionErrorState: "alerting",
            for: "5m",
            frequency: "1m",
            handler: 1,
            name: "Panel Title alert",
            noDataState: "no_data",
            notifications: []
          },

        },
      ],
    },
  };

  if (urlFolderId) {
    data.meta.folderId = parseInt(urlFolderId, 10);
  }

  return data;
}
