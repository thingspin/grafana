import { coreModule } from 'app/core/core';
import { ContextSrv } from 'app/core/services/context_srv';
import store from 'app/core/store';

// override class contextSrv
export class TsContextSrv extends ContextSrv {
  sidemenu: any;

  constructor() {
    super();
    this.sidemenu = store.getBool('thingspin.leftsidebar', true);
  }

  toggleSideMenu() {
    this.sidemenu = !this.sidemenu;
    store.set('thingspin.leftsidebar', this.sidemenu);
  }
}

const contextSrv = new TsContextSrv();
export { contextSrv };

coreModule.factory('contextSrv', () => {
  return contextSrv;
});
