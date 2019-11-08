// Js 3rd party libs
import _ from 'lodash';

// Grafana libs
import { CoreEvents } from 'app/types';
import { MetricsPanelCtrl } from 'app/features/panel/metrics_panel_ctrl';
import { DataQueryResponse, PanelEvents, DataFrame, toDataFrameDTO, AppEvents } from '@grafana/data';

// Thingspin libs
import { JupyterSrv } from '../services/jupyterSrv';
import { appEvents } from 'app/core/core';

export default class TsMetricsPanelCtrl extends MetricsPanelCtrl {
  jupyterSrv: JupyterSrv = this.$injector.get('jupyterSrv');

  // AnalyticsData
  kernel = {
    'R (jupyter)': 'ir_j',
    'Python (native)': 'python3',
    'Python (jupyter)': 'python3_j',
    'Octave (jupyter)': 'octave_j',
  };

  constructor($scope: any, $injector: any) {
    super($scope, $injector);
    this.jupyterSrv.setPanel(this.panel);
  }

  // MetricsPanelCtrl Override Methods(Custom -----------------------------------------------------------------

  // Override
  handleQueryResult(result: DataQueryResponse) {
    this.loading = false;

    if (this.dashboard.snapshot) {
      this.panel.snapshotData = result.data;
    }

    if (!result || !result.data) {
      console.log('Data source query result invalid, missing data field:', result);
      result = { data: [] };
    }

    try {
      if (this.panel.enableScript && this.panel.scripts) {
        const script = this.jupyterSrv.changeQueryScript(result, this.panel);
        this.runAnalytricsScript(result, script);
        return;
      }

      this.events.emit(PanelEvents.dataReceived, result.data);
    } catch (err) {
      this.processDataError(err);
    }
  }

  // Override
  handleDataFrames(data: DataFrame[]) {
    this.loading = false;

    if (this.dashboard && this.dashboard.snapshot) {
      this.panel.snapshotData = data.map(frame => toDataFrameDTO(frame));
    }

    try {
      if (this.panel.enableScript && this.panel.scripts) {
        const script = this.jupyterSrv.changeDataFrameScript(data, this.panel);
        this.runAnalytricsScript(data, script);
        return;
      }

      this.events.emit(CoreEvents.dataFramesReceived, data);
    } catch (err) {
      this.processDataError(err);
    }
  }

  // Thingspin add methods -----------------------------------------------------------------

  async runAnalytricsScript(result: any, script: any) {
    const { kernel }: { kernel: string } = this.panel;

    switch (kernel) {
      case 'ir':
      case 'python3':
        const res = await this.jupyterSrv.runNativeScript(result, kernel, script, this.events);
        if (res.length) {
          this.events.emit(PanelEvents.dataReceived, res);
        }
        break;
      case 'ir_j':
      case 'python3_j':
      case 'octave_j':
        try {
          const res = await this.jupyterSrv.runJupyterScript(result, kernel.replace('_j', ''), script, this);
          if (Array.isArray(res) && res.length) {
            this.events.emit(PanelEvents.dataReceived, res);
          }
        } catch (e) {
          appEvents.emit(AppEvents.alertError, e);
        }
        break;
      default: break;
    }
  }

  modeChanged = this.refresh;
}
