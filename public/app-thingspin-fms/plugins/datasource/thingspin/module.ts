import { DataSourcePlugin } from '@grafana/data';

import { FmsDatasource } from './angularjs';
import './react/queryCtrl';
import FmsQueryCtrl from './angularjs/queryController';

export const plugin = new DataSourcePlugin(FmsDatasource)
  .setQueryCtrl(FmsQueryCtrl);
