// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';

// thingspin react components
import Tabs from './Tabs';
import Tab from './Tab';

// thingspin react components
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { FmsAlarmBandComp } from './FmsAlarmBand/index';

export interface Props extends TsBaseProps {
}

export interface States {
  filters: any[];
  date: Date;
}

export class TsRightSidebar extends PureComponent<Props, States> {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
  }

  state: States = {
    filters: [],
    date: new Date(),
  };

  getTabNode(title, icon): () => ReactNode {
    return () => {
      return (<>
        <i className={`fa ${icon} fa-2`} />
        <span className="fms-right-tap-alarm-title">
          {title}
        </span>
      </>);
    };
  }

  onChangeDate(date) {
    this.setState({ date });
  }

  onChangeFilter(filters) {
    this.setState({ filters });
  }

  render(): ReactNode {
    return (<Tabs>
      {/* Alarm Log Tab */}
      <Tab
        name="alarm" initActive={true}
        heading={this.getTabNode('알람', "fms-right-tap-alarm-icon fa-bell").bind(this)}
      >
        <FmsAlarmBandComp />
      </Tab>

      {/* System Log Tab */}
      <Tab
        name="log"
        heading={this.getTabNode('시스템 로그', "fms-right-tap-alarm-icon fa-window-maximize").bind(this)}
      >
        {/* <TsRightSideTabbarComponent
          date={date} onChangeDate={this.onChangeDate.bind(this)}
          filters={filters} onChangeFilter={this.onChangeFilter.bind(this)} />
        <TsRightSideLogComponent filters={filters} date={date} /> */}
      </Tab>

    </Tabs>
    );
  }
}
