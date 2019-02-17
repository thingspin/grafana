import 'app/core/directives/dropdown_typeahead';
import 'app/core/directives/autofill_event_fix';
import 'app/core/directives/metric_segment';
import 'app/core/directives/misc';
import 'app/core/directives/ng_model_on_blur';
import 'app/core/directives/tags';
import 'app/core/directives/value_select_dropdown';
import 'app/core/directives/rebuild_on_change';
import 'app/core/directives/give_focus';
import 'app/core/directives/diff-view';
import 'app/core/jquery_extended';
import 'app/core/partials';
import 'app/core/components/jsontree/jsontree';
import 'app/core/components/code_editor/code_editor';
import 'app/core/utils/outline';
import 'app/core/components/colorpicker/spectrum_picker';
import 'app/core/services/search_srv';
import 'app/core/services/ng_react';
import { colors } from '@grafana/ui/';

import { searchDirective } from 'app/core/components/search/search';
import { infoPopover } from 'app/core/components/info_popover';
import { navbarDirective } from 'app/core/components/navbar/navbar';
import { arrayJoin } from 'app/core/directives/array_join';
import { liveSrv } from 'app/core/live/live_srv';
import { Emitter } from 'app/core/utils/emitter';
import { layoutSelector } from 'app/core/components/layout_selector/layout_selector';
import { switchDirective } from 'app/core/components/switch';
import { dashboardSelector } from 'app/core/components/dashboard_selector';
import { queryPartEditorDirective } from 'app/core/components/query_part/query_part_editor';
import { sqlPartEditorDirective } from 'app/core/components/sql_part/sql_part_editor';
import { formDropdownDirective } from 'app/core/components/form_dropdown/form_dropdown';
import 'app/core/controllers/all';
import 'app/core/services/all';
import 'app/core/filters/filters';
import coreModule from './core_module';
import appEvents from 'app/core/app_events';
import { assignModelProperties } from 'app/core/utils/model_utils';
import { contextSrv } from 'app/core/services/context_srv';
import { KeybindingSrv } from 'app/core/services/keybindingSrv';
import { helpModal } from 'app/core/components/help/help';
import { JsonExplorer } from 'app/core/components/json_explorer/json_explorer';
import { NavModelSrv, NavModel } from 'app/core/nav_model_srv';
import { geminiScrollbar } from 'app/core/components/scroll/scroll';
import { orgSwitcher } from 'app/core/components/org_switcher';
import { profiler } from 'app/core/profiler';
import { registerAngularDirectives } from 'app/core/angular_wrappers';
import { updateLegendValues } from 'app/core/time_series2';
import TimeSeries from 'app/core/time_series2';
import { searchResultsDirective } from 'app/core/components/search/search_results';
import { manageDashboardsDirective } from 'app/core/components/manage_dashboards/manage_dashboards';

export {
  profiler,
  registerAngularDirectives,
  arrayJoin,
  coreModule,
  navbarDirective,
  searchDirective,
  liveSrv,
  layoutSelector,
  switchDirective,
  infoPopover,
  Emitter,
  appEvents,
  dashboardSelector,
  queryPartEditorDirective,
  sqlPartEditorDirective,
  colors,
  formDropdownDirective,
  assignModelProperties,
  contextSrv,
  KeybindingSrv,
  helpModal,
  JsonExplorer,
  NavModelSrv,
  NavModel,
  geminiScrollbar,
  orgSwitcher,
  manageDashboardsDirective,
  TimeSeries,
  updateLegendValues,
  searchResultsDirective,
};
