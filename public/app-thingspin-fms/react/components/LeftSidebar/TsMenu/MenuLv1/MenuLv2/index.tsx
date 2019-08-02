import React, { PureComponent } from 'react';

interface Props {
  menu: any;
}

export default class TsMenuLv2 extends PureComponent<Props> {
  render() {
    const { text, url, target } = this.props.menu;
    return [
      <div className="fms-menu-lv2" key="ts-l2">
        <a href={url} target={target}>
          {text}
        </a>
        <hr className="fms-menu-lv2-divider" key="ts-l2-divider" />
      </div>,
    ];
  }
}
