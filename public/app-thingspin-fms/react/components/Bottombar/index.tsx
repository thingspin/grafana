import React, { PureComponent } from 'react';
import { TsBottomLv1Component } from './BottomLv1';
import { TsBottomLv2Component } from './BottomLv2';

export class TsBottombar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return [<TsBottomLv1Component key="tsbottomlv1comp" />, <TsBottomLv2Component key="tsbottomlv2comp" />];
  }
}
