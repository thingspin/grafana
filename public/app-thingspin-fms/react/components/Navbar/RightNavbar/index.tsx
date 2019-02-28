import React, { PureComponent } from 'react';
import { TsSearchButtonComponent } from './SearchButton/index';
import { TsViewModeButtonCompoent } from './ViewModeButton/index';
import { TsUserSettingButtonComponent } from './UserSettingButton/index';
import { TsAlarmButtonComponent } from './AlarmButton/index';

export class TsRightNavbar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ts-right-navbar">
        <TsSearchButtonComponent />
        <TsAlarmButtonComponent />
        <TsViewModeButtonCompoent />
        <TsUserSettingButtonComponent />
      </div>
    );
  }
}
