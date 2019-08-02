import React, { PureComponent, ReactNode } from 'react';
import { TsRightSideTabbarComponent } from '../RightSideTabbar/index';
import { TsRightSideHistoryComponent } from '../RightSideHistory/index';


interface Props {
}

export interface States {
    filters: any[];
    date: Date;
    play: boolean;
}

export class FmsAlarmBandComp extends PureComponent<Props, States> {
    state: States = {
        filters: [],
        date: new Date(),
        play: true,
    };

    getTabNode(title: string, icon: string): () => ReactNode {
        return () => {
            return (<>
                <i className={`fa ${icon} fa-2`} />
                <span className="fms-right-tap-alarm-title">
                    {title}
                </span>
            </>);
        };
    }

    onChangeDate(date: Date) {
        this.setState({ date });
    }

    onChangeFilter(filters: any[]) {
        this.setState({ filters: [...filters] });
    }

    onPlay(play: boolean) {
        this.setState({ play, });
    }

    render(): ReactNode {
        const { filters, date, play } = this.state;

        return (<>
            <TsRightSideTabbarComponent
                date={date}
                onChangeDate={this.onChangeDate.bind(this)}
                filters={filters}
                onChangeFilter={this.onChangeFilter.bind(this)}
                play={play}
                onPlay={this.onPlay.bind(this)}
            />
            <TsRightSideHistoryComponent filters={filters} date={date} play={play} />
        </>);
    }
}
