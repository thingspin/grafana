import React, { PureComponent } from 'react';
import { Tooltip } from '@grafana/ui';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

export interface Props extends TsBaseProps {}

export interface States {
  mode: boolean;
}

export class TsSearchButtonComponent extends PureComponent<Props, States> {
  constructor(props) {
    super(props);

    this.state = {
      mode: false,
    };
  }

  render() {
    // Virtual DOM Private Variables
    const tooltip = '설비 / 태그 / 대시보드 / 메뉴 / 알람을 검색합니다. ';
    // Virtual DOM events Methods
    const onToggleMode = () => {
      this.setState({ mode: !this.state.mode });
    };

    // return virtual DOM
    return (
      <div className="ts-search-button-component navbar-buttons--tv">
        <Tooltip content={tooltip} placement="bottom">
          <button className={`btn navbar-button--tv`} onClick={onToggleMode}>
            <i className={'fa fa-search'} />
          </button>
        </Tooltip>
      </div>
    );
  }
}
