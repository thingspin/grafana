// ref source : 'app/features/plugins/plugin_loader.ts'
// Grafana libs
import * as grafanaRuntime from '@grafana/runtime';
import { appEvents, coreModule, liveSrv } from 'app/core/core';

// Thingspin libs
import { contextSrv } from 'app-thingspin-fms/grafana_custom/core';

function exposeToPlugin(name: string, component: any) {
  grafanaRuntime.SystemJS.registerDynamic(name, [], true, (require: any, exports: any, module: { exports: any }) => {
    module.exports = component;
  });
}

// override
exposeToPlugin('app/core/core', {
  coreModule: coreModule,
  appEvents: appEvents,
  contextSrv: contextSrv,
  liveSrv: liveSrv,
  __esModule: true,
});
