import React, { Component } from 'react';
import config from 'app/core/config';

import { getBackendSrv } from 'app/core/services/backend_srv';
import { provideTheme } from 'app/core/utils/ConfigProvider';

export const ThingspinContext = React.createContext(config.bootData.thingspin);

export interface TsPrivderCtrl {
    tsMenu: any[];

  savePinState: (args: any) => Promise<any>;
  getUserPins: () => Promise<any>;
}

class TsProvider extends Component<{}, TsPrivderCtrl> {

  savePinState = async (args: any) => (await getBackendSrv().post(`/thingspin/menu/pin/${args.menuID}/${args.Pinned}`, {}));

  getUserPins = async () => (await getBackendSrv().get(`/thingspin/menu/pin`));

  updateTsMenu = async (orgId: number) => {
    const result = await getBackendSrv().get(`/thingspin/menu/${orgId}`);
    this.setState({
      tsMenu: result,
    });
  };

  state = {
    tsMenu: config.bootData.thingspin.menu,

    savePinState: this.savePinState,
    getUserPins: this.getUserPins,
  };

  render() {
    return <ThingspinContext.Provider value={this.state}>
      {this.props.children}
    </ThingspinContext.Provider>;
  }
}

export const provideThingspin = (component: React.ComponentType<any>) => {
  const ThingspinProvider = (props: any) => (
    <TsProvider>
      {React.createElement(component, { ...props })}
    </TsProvider>
  );

  return ThingspinProvider;
};

export default (component: React.ComponentType<any>) => (
  provideThingspin(
    (props: any) => provideTheme(component)(props)
  )
);
