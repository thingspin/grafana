import React, { PureComponent } from 'react';
import { TsIconLogo } from './IconLogo';
import { TsNavTitle } from './NavTitle';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

interface Props extends TsBaseProps {}

export class TsLeftNavbarComponent extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ts-left-navbar">
        <TsIconLogo {...this.props} imgagePath={'public/img/thingspin/thingspin_icon.svg'} />
        <TsNavTitle />
      </div>
    );
  }
}
