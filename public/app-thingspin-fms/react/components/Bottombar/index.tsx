import React, { PureComponent } from 'react';
import { TsBottomLv1Component } from './BottomLv1';
import { TsBottomLv2Component } from './BottomLv2';

interface Props {}

export interface States {
  enable: boolean;
}

export class TsBottombar extends PureComponent<Props, States> {
  constructor(props) {
    super(props);

    this.state = {
      enable: false,
    };
  }

  get rednerMain(): JSX.Element {
    return (
      <div className="ts-bottom-layer">
        <div className="ts-bottom-container">
          <TsBottomLv1Component key="tsbottomlv1comp" />
          <TsBottomLv2Component key="tsbottomlv2comp" />
        </div>
      </div>
    );
  }

  render() {
    return <>{this.state.enable ? this.rednerMain : null}</>;
  }
}
