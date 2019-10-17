// 3rd party libs
import React from 'react';

// thingspin react components
import Tabs from './Tabs';
import Tab from './Tab';
import { FmsAlarmBandComp } from './FmsAlarmBand';

const getTabNode = (title: string, icon: string) => () => (<>
  <i className={`fa ${icon} fa-2`} />
  <span className="fms-right-tap-alarm-title">
    {title}
  </span>
</>);

const tabs = [
  <Tab
    name="alarm" initActive={true}
    heading={getTabNode('알람', "fms-right-tap-alarm-icon fa-bell")}
  >
    <FmsAlarmBandComp />
  </Tab>,
  /*
  <Tab
    name="log"
    heading={getTabNode('시스템 로그', "fms-right-tap-alarm-icon fa-window-maximize")}
  >
  </Tab>
  */
];

export const TsRightSidebar: React.FC = () => <Tabs>{tabs}</Tabs>;
