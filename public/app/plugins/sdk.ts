import { PanelCtrl } from 'app/features/panel/panel_ctrl';
// thingspin edit code -----
// import { MetricsPanelCtrl } from 'app/features/panel/metrics_panel_ctrl';
import TsMetricsPanelCtrl from 'app-thingspin-fms/angular-modules/core/plugins/tsMetricsPanelCtrl';
// thingspin edit code -----
import { QueryCtrl } from 'app/features/panel/query_ctrl';
import { alertTab } from 'app/features/alerting/AlertTabCtrl';
import { loadPluginCss } from '@grafana/runtime';

// thingspin edit code -----
// export { PanelCtrl, MetricsPanelCtrl, QueryCtrl, alertTab, loadPluginCss };
export { PanelCtrl, TsMetricsPanelCtrl as MetricsPanelCtrl, QueryCtrl, alertTab, loadPluginCss };
// thingspin edit code -----
