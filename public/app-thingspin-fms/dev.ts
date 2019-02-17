import fms from './fms';

/*
Import theme CSS based on env vars, e.g.: `env THINGSPIN_THEME=light yarn start`
*/
declare var THINGSPIN_THEME: any;
require('../sass/grafana.' + THINGSPIN_THEME + '.scss');

fms.init();
