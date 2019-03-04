import React, { PureComponent } from 'react';

export class TsBottomLv1Component extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <div className="ts-bottom-lv1-component" />,
      <div className="ts-bottom-center-layer" />,
      <div className="ts-bottom-center-button" />,
    ];
  }
}
