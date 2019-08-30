// Libraries
// Services & Utils
import store from 'app/core/store';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { Emitter } from 'app/core/core';
import {
  ensureQueries,
  generateEmptyQuery,
  parseUrlState,
  getTimeRange,
  getTimeRangeFromUrl,
  generateNewKeyAndAddRefIdIfMissing,
  lastUsedDatasourceKeyForOrgId,
  hasNonEmptyQuery,
  buildQueryTransaction,
  updateHistory,
  getRefIds,
  instanceOfDataQueryError,
  clearQueryKeys,
  serializeStateToUrlParam,
  stopQueryState,
} from 'app/core/utils/explore';
// Types
import { ThunkResult, ExploreUrlState } from 'app/types';
import {
  DataSourceApi,
  DataQuery,
  DataSourceSelectItem,
  QueryFixAction,
  PanelData,
  DataQueryResponseData,
} from '@grafana/ui';

import {
  RawTimeRange,
  LogsDedupStrategy,
  AbsoluteTimeRange,
  LoadingState,
  DataFrame,
  TimeRange,
  isDateTime,
  dateTimeForTimeZone,
} from '@grafana/data';
import { ExploreId, ExploreUIState, QueryTransaction, ExploreMode } from 'app/types/explore';
import {
  updateDatasourceInstanceAction,
  changeQueryAction,
  changeRefreshIntervalAction,
  ChangeRefreshIntervalPayload,
  changeSizeAction,
  ChangeSizePayload,
  clearQueriesAction,
  initializeExploreAction,
  loadDatasourceMissingAction,
  loadDatasourcePendingAction,
  queriesImportedAction,
  LoadDatasourceReadyPayload,
  loadDatasourceReadyAction,
  modifyQueriesAction,
  scanStartAction,
  setQueriesAction,
  splitCloseAction,
  splitOpenAction,
  addQueryRowAction,
  toggleGraphAction,
  toggleTableAction,
  ToggleGraphPayload,
  ToggleTablePayload,
  updateUIStateAction,
  testDataSourcePendingAction,
  testDataSourceSuccessAction,
  testDataSourceFailureAction,
  loadExploreDatasources,
  changeModeAction,
  scanStopAction,
  changeLoadingStateAction,
  historyUpdatedAction,
  queryStartAction,
  resetQueryErrorAction,
  querySuccessAction,
  queryFailureAction,
  setUrlReplacedAction,
  changeRangeAction,
} from './actionTypes';
import { ActionOf, ActionCreator } from 'app/core/redux/actionCreatorFactory';
import { getTimeZone } from 'app/features/profile/state/selectors';
import { offOption } from '@grafana/ui/src/components/RefreshPicker/RefreshPicker';
import { getShiftedTimeRange } from 'app/core/utils/timePicker';
import { ResultProcessor } from '../utils/ResultProcessor';
import _ from 'lodash';
import { toDataQueryError } from '../../dashboard/state/PanelQueryState';
import { updateLocation } from '../../../core/actions';
import { getTimeSrv } from '../../dashboard/services/TimeSrv';

/**
 * Updates UI state and save it to the URL
 */
const updateExploreUIState = (exploreId: ExploreId, uiStateFragment: Partial<ExploreUIState>): ThunkResult<void> => {
  return dispatch => {
    dispatch(updateUIStateAction({ exploreId, ...uiStateFragment }));
    dispatch(stateSave());
  };
};

/**
 * Adds a query row after the row with the given index.
 */
export function addQueryRow(exploreId: ExploreId, index: number): ThunkResult<void> {
  return (dispatch, getState) => {
    const queries = getState().explore[exploreId].queries;
    const query = generateEmptyQuery(queries, index);

    dispatch(addQueryRowAction({ exploreId, index, query }));
  };
}

/**
 * Loads a new datasource identified by the given name.
 */
export function changeDatasource(exploreId: ExploreId, datasource: string): ThunkResult<void> {
  return async (dispatch, getState) => {
    let newDataSourceInstance: DataSourceApi = null;

    if (!datasource) {
      newDataSourceInstance = await getDatasourceSrv().get();
    } else {
      newDataSourceInstance = await getDatasourceSrv().get(datasource);
    }

    const currentDataSourceInstance = getState().explore[exploreId].datasourceInstance;
    const queries = getState().explore[exploreId].queries;
    const orgId = getState().user.orgId;

    dispatch(updateDatasourceInstanceAction({ exploreId, datasourceInstance: newDataSourceInstance }));

    await dispatch(importQueries(exploreId, queries, currentDataSourceInstance, newDataSourceInstance));

    if (getState().explore[exploreId].isLive) {
      dispatch(changeRefreshInterval(exploreId, offOption.value));
    }

    await dispatch(loadDatasource(exploreId, newDataSourceInstance, orgId));
    dispatch(runQueries(exploreId));
  };
}

/**
 * Change the display mode in Explore.
 */
export function changeMode(exploreId: ExploreId, mode: ExploreMode): ThunkResult<void> {
  return dispatch => {
    dispatch(clearQueriesAction({ exploreId }));
    dispatch(changeModeAction({ exploreId, mode }));
  };
}

/**
 * Query change handler for the query row with the given index.
 * If `override` is reset the query modifications and run the queries. Use this to set queries via a link.
 */
export function changeQuery(
  exploreId: ExploreId,
  query: DataQuery,
  index: number,
  override: boolean
): ThunkResult<void> {
  return (dispatch, getState) => {
    // Null query means reset
    if (query === null) {
      const queries = getState().explore[exploreId].queries;
      const { refId, key } = queries[index];
      query = generateNewKeyAndAddRefIdIfMissing({ refId, key }, queries, index);
    }

    dispatch(changeQueryAction({ exploreId, query, index, override }));
    if (override) {
      dispatch(runQueries(exploreId));
    }
  };
}

/**
 * Keep track of the Explore container size, in particular the width.
 * The width will be used to calculate graph intervals (number of datapoints).
 */
export function changeSize(
  exploreId: ExploreId,
  { height, width }: { height: number; width: number }
): ActionOf<ChangeSizePayload> {
  return changeSizeAction({ exploreId, height, width });
}

export const updateTimeRange = (options: {
  exploreId: ExploreId;
  rawRange?: RawTimeRange;
  absoluteRange?: AbsoluteTimeRange;
}): ThunkResult<void> => {
  return dispatch => {
    dispatch(updateTime({ ...options }));
    dispatch(runQueries(options.exploreId));
  };
};

/**
 * Change the refresh interval of Explore. Called from the Refresh picker.
 */
export function changeRefreshInterval(
  exploreId: ExploreId,
  refreshInterval: string
): ActionOf<ChangeRefreshIntervalPayload> {
  return changeRefreshIntervalAction({ exploreId, refreshInterval });
}

/**
 * Clear all queries and results.
 */
export function clearQueries(exploreId: ExploreId): ThunkResult<void> {
  return dispatch => {
    dispatch(scanStopAction({ exploreId }));
    dispatch(clearQueriesAction({ exploreId }));
    dispatch(stateSave());
  };
}

/**
 * Loads all explore data sources and sets the chosen datasource.
 * If there are no datasources a missing datasource action is dispatched.
 */
export function loadExploreDatasourcesAndSetDatasource(
  exploreId: ExploreId,
  datasourceName: string
): ThunkResult<void> {
  return dispatch => {
    const exploreDatasources: DataSourceSelectItem[] = getDatasourceSrv()
      .getExternal()
      .map(
        (ds: any) =>
          ({
            value: ds.name,
            name: ds.name,
            meta: ds.meta,
          } as DataSourceSelectItem)
      );

    dispatch(loadExploreDatasources({ exploreId, exploreDatasources }));

    if (exploreDatasources.length >= 1) {
      dispatch(changeDatasource(exploreId, datasourceName));
    } else {
      dispatch(loadDatasourceMissingAction({ exploreId }));
    }
  };
}

/**
 * Initialize Explore state with state from the URL and the React component.
 * Call this only on components for with the Explore state has not been initialized.
 */
export function initializeExplore(
  exploreId: ExploreId,
  datasourceName: string,
  queries: DataQuery[],
  rawRange: RawTimeRange,
  mode: ExploreMode,
  containerWidth: number,
  eventBridge: Emitter,
  ui: ExploreUIState
): ThunkResult<void> {
  return async (dispatch, getState) => {
    const timeZone = getTimeZone(getState().user);
    const range = getTimeRange(timeZone, rawRange);
    dispatch(loadExploreDatasourcesAndSetDatasource(exploreId, datasourceName));
    dispatch(
      initializeExploreAction({
        exploreId,
        containerWidth,
        eventBridge,
        queries,
        range,
        mode,
        ui,
      })
    );
    dispatch(updateTime({ exploreId }));
  };
}

/**
 * Datasource loading was successfully completed.
 */
export const loadDatasourceReady = (
  exploreId: ExploreId,
  instance: DataSourceApi,
  orgId: number
): ActionOf<LoadDatasourceReadyPayload> => {
  const historyKey = `grafana.explore.history.${instance.meta.id}`;
  const history = store.getObject(historyKey, []);
  // Save last-used datasource

  store.set(lastUsedDatasourceKeyForOrgId(orgId), instance.name);

  return loadDatasourceReadyAction({
    exploreId,
    history,
  });
};

export function importQueries(
  exploreId: ExploreId,
  queries: DataQuery[],
  sourceDataSource: DataSourceApi,
  targetDataSource: DataSourceApi
): ThunkResult<void> {
  return async dispatch => {
    if (!sourceDataSource) {
      // explore not initialized
      dispatch(queriesImportedAction({ exploreId, queries }));
      return;
    }

    let importedQueries = queries;
    // Check if queries can be imported from previously selected datasource
    if (sourceDataSource.meta.id === targetDataSource.meta.id) {
      // Keep same queries if same type of datasource
      importedQueries = [...queries];
    } else if (targetDataSource.importQueries) {
      // Datasource-specific importers
      importedQueries = await targetDataSource.importQueries(queries, sourceDataSource.meta);
    } else {
      // Default is blank queries
      importedQueries = ensureQueries();
    }

    const nextQueries = ensureQueries(importedQueries);

    dispatch(queriesImportedAction({ exploreId, queries: nextQueries }));
  };
}

/**
 * Tests datasource.
 */
export const testDatasource = (exploreId: ExploreId, instance: DataSourceApi): ThunkResult<void> => {
  return async dispatch => {
    let datasourceError = null;

    dispatch(testDataSourcePendingAction({ exploreId }));

    try {
      const testResult = await instance.testDatasource();
      datasourceError = testResult.status === 'success' ? null : testResult.message;
    } catch (error) {
      datasourceError = (error && error.statusText) || 'Network error';
    }

    if (datasourceError) {
      dispatch(testDataSourceFailureAction({ exploreId, error: datasourceError }));
      return;
    }

    dispatch(testDataSourceSuccessAction({ exploreId }));
  };
};

/**
 * Reconnects datasource when there is a connection failure.
 */
export const reconnectDatasource = (exploreId: ExploreId): ThunkResult<void> => {
  return async (dispatch, getState) => {
    const instance = getState().explore[exploreId].datasourceInstance;
    dispatch(changeDatasource(exploreId, instance.name));
  };
};

/**
 * Main action to asynchronously load a datasource. Dispatches lots of smaller actions for feedback.
 */
export function loadDatasource(exploreId: ExploreId, instance: DataSourceApi, orgId: number): ThunkResult<void> {
  return async (dispatch, getState) => {
    const datasourceName = instance.name;

    // Keep ID to track selection
    dispatch(loadDatasourcePendingAction({ exploreId, requestedDatasourceName: datasourceName }));

    await dispatch(testDatasource(exploreId, instance));

    if (datasourceName !== getState().explore[exploreId].requestedDatasourceName) {
      // User already changed datasource again, discard results
      return;
    }

    if (instance.init) {
      try {
        instance.init();
      } catch (err) {
        console.log(err);
      }
    }

    if (datasourceName !== getState().explore[exploreId].requestedDatasourceName) {
      // User already changed datasource again, discard results
      return;
    }

    dispatch(loadDatasourceReady(exploreId, instance, orgId));
  };
}

/**
 * Action to modify a query given a datasource-specific modifier action.
 * @param exploreId Explore area
 * @param modification Action object with a type, e.g., ADD_FILTER
 * @param index Optional query row index. If omitted, the modification is applied to all query rows.
 * @param modifier Function that executes the modification, typically `datasourceInstance.modifyQueries`.
 */
export function modifyQueries(
  exploreId: ExploreId,
  modification: QueryFixAction,
  index: number,
  modifier: any
): ThunkResult<void> {
  return dispatch => {
    dispatch(modifyQueriesAction({ exploreId, modification, index, modifier }));
    if (!modification.preventSubmit) {
      dispatch(runQueries(exploreId));
    }
  };
}

/**
 * Main action to run queries and dispatches sub-actions based on which result viewers are active
 */
export function runQueries(exploreId: ExploreId): ThunkResult<void> {
  return (dispatch, getState) => {
    dispatch(updateTime({ exploreId }));

    const exploreItemState = getState().explore[exploreId];
    const {
      datasourceInstance,
      queries,
      datasourceError,
      containerWidth,
      isLive: live,
      queryState,
      queryIntervals,
      range,
      scanning,
      history,
    } = exploreItemState;

    if (datasourceError) {
      // let's not run any queries if data source is in a faulty state
      return;
    }

    if (!hasNonEmptyQuery(queries)) {
      dispatch(clearQueriesAction({ exploreId }));
      dispatch(stateSave()); // Remember to save to state and update location
      return;
    }

    // Some datasource's query builders allow per-query interval limits,
    // but we're using the datasource interval limit for now
    const interval = datasourceInstance.interval;

    stopQueryState(queryState, 'New request issued');

    queryState.sendFrames = true;
    queryState.sendLegacy = true; // temporary hack until we switch to PanelData

    const queryOptions = { interval, maxDataPoints: containerWidth, live };
    const datasourceId = datasourceInstance.meta.id;
    const now = Date.now();
    const transaction = buildQueryTransaction(queries, queryOptions, range, queryIntervals, scanning);

    // temporary hack until we switch to PanelData, Loki already converts to DataFrame so using legacy will destroy the format
    const isLokiDataSource = datasourceInstance.meta.name === 'Loki';

    queryState.onStreamingDataUpdated = () => {
      const data = queryState.validateStreamsAndGetPanelData();
      const { state, error, legacy, series } = data;
      if (!data && !error && !legacy && !series) {
        return;
      }

      if (state === LoadingState.Error) {
        dispatch(processErrorResults({ exploreId, response: error, datasourceId }));
        return;
      }

      if (state === LoadingState.Streaming) {
        dispatch(limitMessageRate(exploreId, isLokiDataSource ? series : legacy, datasourceId));
        return;
      }

      if (state === LoadingState.Done) {
        dispatch(changeLoadingStateAction({ exploreId, loadingState: state }));
      }
    };

    dispatch(queryStartAction({ exploreId }));

    queryState
      .execute(datasourceInstance, transaction.options)
      .then((response: PanelData) => {
        const { legacy, error, series } = response;
        if (error) {
          dispatch(processErrorResults({ exploreId, response: error, datasourceId }));
          return;
        }

        const latency = Date.now() - now;
        // Side-effect: Saving history in localstorage
        const nextHistory = updateHistory(history, datasourceId, queries);
        dispatch(historyUpdatedAction({ exploreId, history: nextHistory }));
        dispatch(
          processQueryResults({
            exploreId,
            latency,
            datasourceId,
            loadingState: LoadingState.Done,
            series: isLokiDataSource ? series : legacy,
          })
        );
        dispatch(stateSave());
      })
      .catch(error => {
        dispatch(processErrorResults({ exploreId, response: error, datasourceId }));
      });
  };
}

export const limitMessageRate = (
  exploreId: ExploreId,
  series: DataFrame[] | any[],
  datasourceId: string
): ThunkResult<void> => {
  return (dispatch, getState) => {
    dispatch(
      processQueryResults({
        exploreId,
        latency: 0,
        datasourceId,
        loadingState: LoadingState.Streaming,
        series,
      })
    );
  };
};

export const processQueryResults = (config: {
  exploreId: ExploreId;
  latency: number;
  datasourceId: string;
  loadingState: LoadingState;
  series?: DataQueryResponseData[];
}): ThunkResult<void> => {
  return (dispatch, getState) => {
    const { exploreId, datasourceId, latency, loadingState, series } = config;
    const { datasourceInstance, scanning, eventBridge } = getState().explore[exploreId];

    // If datasource already changed, results do not matter
    if (datasourceInstance.meta.id !== datasourceId) {
      return;
    }

    const result = series || [];
    const replacePreviousResults = loadingState === LoadingState.Done && series ? true : false;
    const resultProcessor = new ResultProcessor(getState().explore[exploreId], replacePreviousResults, result);
    const graphResult = resultProcessor.getGraphResult();
    const tableResult = resultProcessor.getTableResult();
    const logsResult = resultProcessor.getLogsResult();
    const refIds = getRefIds(result);

    // For Angular editors
    eventBridge.emit('data-received', resultProcessor.getRawData());

    // Clears any previous errors that now have a successful query, important so Angular editors are updated correctly
    dispatch(resetQueryErrorAction({ exploreId, refIds }));

    dispatch(
      querySuccessAction({
        exploreId,
        latency,
        loadingState,
        graphResult,
        tableResult,
        logsResult,
      })
    );

    // Keep scanning for results if this was the last scanning transaction
    if (scanning) {
      if (_.size(result) === 0) {
        const range = getShiftedTimeRange(-1, getState().explore[exploreId].range);
        dispatch(updateTime({ exploreId, absoluteRange: range }));
        dispatch(runQueries(exploreId));
      } else {
        // We can stop scanning if we have a result
        dispatch(scanStopAction({ exploreId }));
      }
    }
  };
};

export const processErrorResults = (config: {
  exploreId: ExploreId;
  response: any;
  datasourceId: string;
}): ThunkResult<void> => {
  return (dispatch, getState) => {
    const { exploreId, datasourceId } = config;
    let { response } = config;
    const { datasourceInstance, eventBridge } = getState().explore[exploreId];

    if (datasourceInstance.meta.id !== datasourceId || response.cancelled) {
      // Navigated away, queries did not matter
      return;
    }

    // For Angular editors
    eventBridge.emit('data-error', response);

    console.error(response); // To help finding problems with query syntax

    if (!instanceOfDataQueryError(response)) {
      response = toDataQueryError(response);
    }

    dispatch(queryFailureAction({ exploreId, response }));
  };
};

const toRawTimeRange = (range: TimeRange): RawTimeRange => {
  let from = range.raw.from;
  if (isDateTime(from)) {
    from = from.valueOf().toString(10);
  }

  let to = range.raw.to;
  if (isDateTime(to)) {
    to = to.valueOf().toString(10);
  }

  return {
    from,
    to,
  };
};

export const stateSave = (): ThunkResult<void> => {
  return (dispatch, getState) => {
    const { left, right, split } = getState().explore;
    const orgId = getState().user.orgId.toString();
    const replace = left && left.urlReplaced === false;
    const urlStates: { [index: string]: string } = { orgId };
    const leftUrlState: ExploreUrlState = {
      datasource: left.datasourceInstance.name,
      queries: left.queries.map(clearQueryKeys),
      range: toRawTimeRange(left.range),
      mode: left.mode,
      ui: {
        showingGraph: left.showingGraph,
        showingLogs: true,
        showingTable: left.showingTable,
        dedupStrategy: left.dedupStrategy,
      },
    };
    urlStates.left = serializeStateToUrlParam(leftUrlState, true);
    if (split) {
      const rightUrlState: ExploreUrlState = {
        datasource: right.datasourceInstance.name,
        queries: right.queries.map(clearQueryKeys),
        range: toRawTimeRange(right.range),
        mode: right.mode,
        ui: {
          showingGraph: right.showingGraph,
          showingLogs: true,
          showingTable: right.showingTable,
          dedupStrategy: right.dedupStrategy,
        },
      };

      urlStates.right = serializeStateToUrlParam(rightUrlState, true);
    }

    dispatch(updateLocation({ query: urlStates, replace }));
    if (replace) {
      dispatch(setUrlReplacedAction({ exploreId: ExploreId.left }));
    }
  };
};

export const updateTime = (config: {
  exploreId: ExploreId;
  rawRange?: RawTimeRange;
  absoluteRange?: AbsoluteTimeRange;
}): ThunkResult<void> => {
  return (dispatch, getState) => {
    const { exploreId, absoluteRange: absRange, rawRange: actionRange } = config;
    const itemState = getState().explore[exploreId];
    const timeZone = getTimeZone(getState().user);
    const { range: rangeInState } = itemState;
    let rawRange: RawTimeRange = rangeInState.raw;

    if (absRange) {
      rawRange = {
        from: dateTimeForTimeZone(timeZone, absRange.from),
        to: dateTimeForTimeZone(timeZone, absRange.to),
      };
    }

    if (actionRange) {
      rawRange = actionRange;
    }

    const range = getTimeRange(timeZone, rawRange);
    const absoluteRange: AbsoluteTimeRange = { from: range.from.valueOf(), to: range.to.valueOf() };

    getTimeSrv().init({
      time: range.raw,
      refresh: false,
      getTimezone: () => timeZone,
      timeRangeUpdated: (): any => undefined,
    });

    dispatch(changeRangeAction({ exploreId, range, absoluteRange }));
  };
};

/**
 * Start a scan for more results using the given scanner.
 * @param exploreId Explore area
 * @param scanner Function that a) returns a new time range and b) triggers a query run for the new range
 */
export function scanStart(exploreId: ExploreId): ThunkResult<void> {
  return (dispatch, getState) => {
    // Register the scanner
    dispatch(scanStartAction({ exploreId }));
    // Scanning must trigger query run, and return the new range
    const range = getShiftedTimeRange(-1, getState().explore[exploreId].range);
    // Set the new range to be displayed
    dispatch(updateTime({ exploreId, absoluteRange: range }));
    dispatch(runQueries(exploreId));
  };
}

/**
 * Reset queries to the given queries. Any modifications will be discarded.
 * Use this action for clicks on query examples. Triggers a query run.
 */
export function setQueries(exploreId: ExploreId, rawQueries: DataQuery[]): ThunkResult<void> {
  return (dispatch, getState) => {
    // Inject react keys into query objects
    const queries = getState().explore[exploreId].queries;
    const nextQueries = rawQueries.map((query, index) => generateNewKeyAndAddRefIdIfMissing(query, queries, index));
    dispatch(setQueriesAction({ exploreId, queries: nextQueries }));
    dispatch(runQueries(exploreId));
  };
}

/**
 * Close the split view and save URL state.
 */
export function splitClose(itemId: ExploreId): ThunkResult<void> {
  return dispatch => {
    dispatch(splitCloseAction({ itemId }));
    dispatch(stateSave());
  };
}

/**
 * Open the split view and copy the left state to be the right state.
 * The right state is automatically initialized.
 * The copy keeps all query modifications but wipes the query results.
 */
export function splitOpen(): ThunkResult<void> {
  return (dispatch, getState) => {
    // Clone left state to become the right state
    const leftState = getState().explore[ExploreId.left];
    const queryState = getState().location.query[ExploreId.left] as string;
    const urlState = parseUrlState(queryState);
    const queryTransactions: QueryTransaction[] = [];
    const itemState = {
      ...leftState,
      queryTransactions,
      queries: leftState.queries.slice(),
      exploreId: ExploreId.right,
      urlState,
    };
    dispatch(splitOpenAction({ itemState }));
    dispatch(stateSave());
  };
}

/**
 * Creates action to collapse graph/logs/table panel. When panel is collapsed,
 * queries won't be run
 */
const togglePanelActionCreator = (
  actionCreator: ActionCreator<ToggleGraphPayload> | ActionCreator<ToggleTablePayload>
) => (exploreId: ExploreId, isPanelVisible: boolean): ThunkResult<void> => {
  return dispatch => {
    let uiFragmentStateUpdate: Partial<ExploreUIState>;
    const shouldRunQueries = !isPanelVisible;

    switch (actionCreator.type) {
      case toggleGraphAction.type:
        uiFragmentStateUpdate = { showingGraph: !isPanelVisible };
        break;
      case toggleTableAction.type:
        uiFragmentStateUpdate = { showingTable: !isPanelVisible };
        break;
    }

    dispatch(actionCreator({ exploreId }));
    dispatch(updateExploreUIState(exploreId, uiFragmentStateUpdate));

    if (shouldRunQueries) {
      dispatch(runQueries(exploreId));
    }
  };
};

/**
 * Expand/collapse the graph result viewer. When collapsed, graph queries won't be run.
 */
export const toggleGraph = togglePanelActionCreator(toggleGraphAction);

/**
 * Expand/collapse the table result viewer. When collapsed, table queries won't be run.
 */
export const toggleTable = togglePanelActionCreator(toggleTableAction);

/**
 * Change logs deduplication strategy and update URL.
 */
export const changeDedupStrategy = (exploreId: ExploreId, dedupStrategy: LogsDedupStrategy): ThunkResult<void> => {
  return dispatch => {
    dispatch(updateExploreUIState(exploreId, { dedupStrategy }));
  };
};

export function refreshExplore(exploreId: ExploreId): ThunkResult<void> {
  return (dispatch, getState) => {
    const itemState = getState().explore[exploreId];
    if (!itemState.initialized) {
      return;
    }

    const { urlState, update, containerWidth, eventBridge } = itemState;
    const { datasource, queries, range: urlRange, mode, ui } = urlState;
    const refreshQueries: DataQuery[] = [];
    for (let index = 0; index < queries.length; index++) {
      const query = queries[index];
      refreshQueries.push(generateNewKeyAndAddRefIdIfMissing(query, refreshQueries, index));
    }
    const timeZone = getTimeZone(getState().user);
    const range = getTimeRangeFromUrl(urlRange, timeZone);

    // need to refresh datasource
    if (update.datasource) {
      const initialQueries = ensureQueries(queries);
      dispatch(initializeExplore(exploreId, datasource, initialQueries, range, mode, containerWidth, eventBridge, ui));
      return;
    }

    if (update.range) {
      dispatch(updateTime({ exploreId, rawRange: range.raw }));
    }

    // need to refresh ui state
    if (update.ui) {
      dispatch(updateUIStateAction({ ...ui, exploreId }));
    }

    // need to refresh queries
    if (update.queries) {
      dispatch(setQueriesAction({ exploreId, queries: refreshQueries }));
    }

    // need to refresh mode
    if (update.mode) {
      dispatch(changeModeAction({ exploreId, mode }));
    }

    // always run queries when refresh is needed
    if (update.queries || update.ui || update.range) {
      dispatch(runQueries(exploreId));
    }
  };
}
