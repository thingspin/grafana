// js 3rd party libs
import _ from 'lodash';
import { Kernel, ServerConnection } from '@jupyterlab/services';

// Grafana libs
import { DataFrame, FieldType, ArrayVector, TimeSeriesValue } from '@grafana/data';
import { coreModule, Emitter } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import TsMetricsPanelCtrl from '../plugins/tsMetricsPanelCtrl';

/*
function getSparkScript(ml: any) {
  const { model, judgeAlg, datasource } = ml;
  return `%run /data/model-judge/${judgeAlg} /data/data/${datasource} ${JSON.stringify(model).replace(/"/g, '\\"')}`;
}
*/

function str2Obj(str: string) {
  str = str.replace(/(\r\n|\n|\r)/gm, '');
  str = str.replace(/'/g, '"');
  str = str.replace(/[,]+[\s]+\.\.\.[\]]/g, ']');
  return JSON.parse(str);
}

export class JupyterSrv {
  proxy = window.location.origin + '/thingspin/analytics/jupyter/';
  jupyterUrl = this.proxy;
  jupyterOpts = ServerConnection.makeSettings({
    baseUrl: this.jupyterUrl
  });

  /** @ngInject */
  constructor(private backendSrv: BackendSrv,
    protected $routeParams: angular.route.IRouteParamsService
  ) { }

  setPanel(panel: any) {
    const { kernel, scripts } = panel;
    panel.kernel = !kernel ? 'python3_j' : kernel;
    panel.scripts = !scripts ? '' : scripts;
    panel.enableScript = false;
  }

  changeScript(names: any[], signals: any[], panel: any) {
    let script = panel.scripts;
    for (const name of names) {
      script = script.replace(name, signals.shift().toString());
    }

    // ????
    const { roiParam } = panel;
    if (roiParam) {
      script = script.replace('roiX', roiParam.roiXlocation.toString())
        .replace('roiY', roiParam.roiYlocation.toString())
        .replace('roiW', roiParam.roiWidth.toString())
        .replace('roiH', roiParam.roiHeight.toString())
        .replace('roiT', roiParam.roiThreshold.toString());
    }

    return script.replace(new RegExp(String.fromCharCode(13), 'g'), '');
  }

  changeDataFrameScript(list: DataFrame[], panel: any) {
    const signals = [];
    const names = [];
    for (const data of list) {
      const [field] = data.fields;
      signals.push(field.values.toArray());
      names.push(data.name);
    }

    return this.changeScript(names, signals, panel);
  }

  changeQueryScript(result: any, panel: any) {
    const signals = [];
    const names = [];
    for (const { datapoints, target } of result.data) {
      signals.push(datapoints.map(([point]: any[]) => point));
      names.push(target);
    }

    return this.changeScript(names, signals, panel);
  }

  execute(data: any, callback: Function): void {
    const { script, kernelName } = data;

    (async () => {
      const kernelModels = await Kernel.listRunning(this.jupyterOpts);

      let newKernelFlag = true;
      let selectedKernelModel: Kernel.IModel;
      for (const model of kernelModels) {
        if (model.name === kernelName) {
          selectedKernelModel = model;
          newKernelFlag = false;
        }
      }

      let kernel: Kernel.IKernel;
      if (!newKernelFlag) {
        kernel = await Kernel.connectTo(selectedKernelModel, this.jupyterOpts);
      } else {
        const opts = await Kernel.getSpecs();
        kernel = await Kernel.startNew({ name: opts.default, serverSettings: this.jupyterOpts });
      }

      const future = kernel.requestExecute({ code: script });
      future.onIOPub = (msg: any) => {
        msg.kernelName = kernelName;
        callback(msg);
      };
    })();
  }

  getKernelSpecs(): Promise<any> {
    return Kernel.getSpecs(this.jupyterOpts);
  }

  runNativeScript = async (result: any, kernel: any, scripts: any, events: Emitter) => {
    if (!scripts) {
      return result;
    }

    try {
      const datasource = JSON.stringify({ signalNames: [], signals: [], script: scripts, });
      let ret: any[] = [];
      switch (kernel) {
        case 'ir':
          const { rResult } = await this.backendSrv.post('/thingspin/analytics/script/R', datasource);
          ret = this.onReceivedQueryData(rResult, result);
          break;
        case 'spark':
        case 'python3':
          const res = await this.backendSrv.post('/thingspin/analytics/script/python', datasource);
          if (!res.html) {
            ret = this.onReceivedQueryData(res.result, result);
          } else {
            events.emit('mpld3', result);
          }
          break;
        default:
          break;
      }
      return ret;
    } catch (e) {
      events.emit('mpld3-error', e);
      return result;
    }
  };

  runJupyterScript = (result: any, kernel: any, script: any, ctrl: TsMetricsPanelCtrl) => {
    return new Promise((resolve, reject) => {
      if (!script) {
        return resolve(result);
      }

      const cmdData: any = {
        kernelName: kernel,
        script,
        param: [[], []],
        input: [[], []],
      };

      this.execute(cmdData, (msg: any) => {
        if (!msg) {
          return;
        }

        let obj;
        const { msg_type, content: { data, ename, evalue, name, text }, kernelName } = msg;
        switch (msg_type) {
          case 'error': {
            return reject([`[ Jupyter ${ename}]`, evalue]);
          }
          case 'execute_result': {
            if (kernelName === 'python3' || kernelName === 'octave') {
              obj = str2Obj(data['text/plain']);
            }
            break;
          }
          case 'stream': {
            if (name === 'stdout' && (kernelName === 'python3' || kernelName === 'octave')) {
              try {
                obj = str2Obj(text);
              } catch (err) {
                return reject(['[ Jupyter Received Data JSON Parse Error]', err]);
              }
            } else {
              return reject([`[ Jupyter ${ename}]`, text]);
            }

            if (kernelName === 'python3' || kernelName === 'octave') {
              obj = str2Obj(text);
            }
            break;
          }
          case 'display_data': {
            if (kernelName === 'ir') {
              obj = str2Obj(data['text/plain']);
            }

            if (data['image/png']) {
              ctrl.scope.jupyterGraph = `<img width="100%" src="data:image/png;base64,${data['image/png']}" >`;
              ctrl.scope.$applyAsync();
            }
            break;
          }
          default:
            return;
        }
        if (ctrl.useDataFrames) {
          return resolve(this.onReceivedFrameData(obj, result));
        } else {
          return resolve(this.onReceivedQueryData(obj, result));
        }
      });
    });
  };

  onReceivedQueryData = (obj: any, result: any) => {
    const datas = [];

    let datapoints;
    const { data } = result;
    const now = new Date().getTime(); // ms
    for (const target in obj) {
      if (obj.hasOwnProperty(target)) {
        datapoints = obj[target].map((item: any, i: any) => !data.length || !data[0].datapoints[i]
          ? [item, now + i]
          : [item, data[0].datapoints[i][1]]
        );

        datas.push({ target, datapoints });
      }
    }

    return datas;
  };

  onReceivedFrameData = (obj: any, results: DataFrame[]) => {
    const now = new Date().getTime(); // ms

    const res: DataFrame[] = [];
    for (const target in obj) {
      const values: any[] = obj[target];
      const convNow = now - (values.length * 1000);
      const times = values.map((_: any, i: number) => convNow + (i * 1000));

      res.push({
        name: target,
        refId: 'A',
        fields: [
          {
            name: target || 'Value',
            type: FieldType.number,
            config: {},
            values: new ArrayVector<TimeSeriesValue>(values),
          },
          {
            name: 'Time',
            type: FieldType.time,
            config: {},
            values: new ArrayVector<number>(times),
          },
        ],
        length: values.length,
      });
    }

    return res;
  };
}

coreModule.service('jupyterSrv', JupyterSrv);
