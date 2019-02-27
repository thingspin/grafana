import React, { PureComponent } from 'react';
// import { TsIMenuItem } from 'app-thingspin-fms/models/LeftSidebar';

interface Props {
  menu: any;
}

export default class TsMenuLv2 extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, url } = this.props.menu;

    return (
      <div className="fms-menu-lv2">
        <a href={url}>{text}</a>
      </div>
    );
  }
}
