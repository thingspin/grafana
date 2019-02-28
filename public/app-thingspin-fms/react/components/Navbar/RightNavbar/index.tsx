import React, { PureComponent } from 'react';
import { TsSearchButtonComponent } from './SearchButton';
import { TsViewModeButtonCompoent } from './ViewModeButton';
import { TsUserSettingButtonComponent } from './UserSettingButton';
import { TsAlarmButtonComponent } from './AlarmButton';

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
