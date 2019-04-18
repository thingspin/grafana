import React, { PureComponent } from 'react';

import cloneDeep from 'lodash/cloneDeep';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';

import { TsBaseProps } from 'app-thingspin-fms/models/common';
import TsMenuLv1 from './MenuLv1';
import { getUserPins } from './getUserPins';

export interface Props extends TsBaseProps {
  getUserPins: typeof getUserPins;
}

export interface State {
  load: boolean;
}

export class TsMenu extends PureComponent<Props, State> {
  state: State = {
    load: false,
  };
  isSignedIn = contextSrv.isSignedIn;

  navTree = cloneDeep(config.bootData.thingspin.menu);
  pins: any;

  async componentWillMount() {
    if ( this.isSignedIn ) {
      this.pins = await this.props.getUserPins();
      this.setState( {load: true} );
    }
  }
  async componentDidMount() {}
  componentWillUnmount() {}
  componentDidUpdate(prevProps: Props) {}

  get dom() {
    return this.navTree
      .filter(item => !item.hideFromMenu)
      .filter(item => item.icon)
      .filter(item => !item.divider)
    .map((item, idx) => {
      item.pinned = (this.pins === undefined || this.pins === null) ? false : ((this.pins.filter(p => ( item.id === p)).length > 0));
      return (<TsMenuLv1 key={item.id} menu={item} pinned={item.pinned}/>);
    });
  }

  render() {
    return (<div className="fms-menu">{this.dom}</div>);
  }
}

const mapDispatchToProps = {
  getUserPins,
};

const mapStateToProps = () => ({});

export default connectWithStore(TsMenu, mapStateToProps, mapDispatchToProps);
