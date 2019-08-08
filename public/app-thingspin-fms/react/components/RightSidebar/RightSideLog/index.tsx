import React, { PureComponent } from 'react';
import { TabbarProps } from '../models';

export interface Props extends TabbarProps {

}
export class TsRightSideLogComponent extends PureComponent<Props> {
  render() {
    return <div className="ts-right-side-log-component">System Log History View</div>;
  }
}
