import React, { PureComponent } from 'react';

export class TsBottomLv1Component extends PureComponent {
  render() {
    return [
      <div className="ts-bottom-lv1-component" key="tsbottomlv1component" />,
      <div className="ts-bottom-center-layer" key="tsbottomcenterlayer" />,
      <div className="ts-bottom-center-button" key="tsbottomcenterbutton" />,
    ];
  }
}
