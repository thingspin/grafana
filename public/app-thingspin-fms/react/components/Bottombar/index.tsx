import React, { PureComponent } from 'react';
import { TsBottomLv1Component } from './BottomLv1';
import { TsBottomLv2Component } from './BottomLv2';

export class TsBottombar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ts-bottom-layer">
        <div className="ts-bottom-container">
          <TsBottomLv1Component key="tsbottomlv1comp" />
          <TsBottomLv2Component key="tsbottomlv2comp" />
        </div>
      </div>
    );
  }
}
