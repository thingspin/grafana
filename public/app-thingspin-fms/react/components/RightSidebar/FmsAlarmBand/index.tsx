import React, { PureComponent, ReactNode } from 'react';
import { TsRightSideTabbarComponent } from '../RightSideTabbar/index';
import { TsRightSideHistoryComponent } from '../RightSideHistory/index';


interface Props {
}

export interface States {
    filters: any[];
    date: Date;
}

export class FmsAlarmBandComp extends PureComponent<Props, States> {
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
        const { filters, date } = this.state;

        return (<>
            <TsRightSideTabbarComponent
                date={date}
                onChangeDate={this.onChangeDate.bind(this)}
                filters={filters}
                onChangeFilter={this.onChangeFilter.bind(this)} />
            <TsRightSideHistoryComponent filters={filters} date={date} />
        </>);
    }
}
