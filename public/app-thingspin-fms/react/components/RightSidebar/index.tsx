// 3rd party libs
import React from 'react';

// thingspin react components
import Tabs from './Tabs';
import Tab from './Tab';

// thingspin react components
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { FmsAlarmBandComp } from './FmsAlarmBand';

export interface Props extends TsBaseProps {
}

function getTabNode(title: string, icon: string): () => React.ReactNode {
  return () => {
    return <>
      <i className={`fa ${icon} fa-2`} />
      <span className="fms-right-tap-alarm-title">
        {title}
      </span>
    </>;
  };
}

export const TsRightSidebar: React.FC<Props> = (_) => {
  return (<Tabs>
    {/* Alarm Log Tab */}
    <Tab
      name="alarm" initActive={true}
      heading={getTabNode('알람', "fms-right-tap-alarm-icon fa-bell")}
    >
      <FmsAlarmBandComp />
    </Tab>

    {/* System Log Tab */}
    <Tab
      name="log"
      heading={getTabNode('시스템 로그', "fms-right-tap-alarm-icon fa-window-maximize")}
    >
    </Tab>

  </Tabs>
  );
};
