// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';
import Calendar from 'react-calendar';

// Grafana libs
import { dateTime } from '@grafana/data';

export interface Props {
    onChange?: (date: Date) => void;
    date?: Date;
}

export interface States {
    isShow: boolean;
}

export default class TsDatePciker extends PureComponent<Props, States> {
    state: States = {
        isShow: false,
    };

    showToggle(isShow: boolean = !this.state.isShow) {
        this.setState({ isShow });
    }

    moveDay(value: number) {
        const { date } = this.props;
        const d = new Date(date);

        d.setDate(date.getDate() + value);
        this.onChange(d, false);
    }

    onChange = (date: Date, toggle?: boolean) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(date);
        }

        this.showToggle(toggle);
    }

    setToday = () => {
        const d = new Date();

        this.onChange(d, false);
    };

    viewCalendar = () => this.showToggle();

    render(): ReactNode {
        const { date } = this.props;
        const { isShow, } = this.state;

        return (<div className="ts-date-picker">
            <button className={`dp-btn ts-date ${isShow && 'active'}`}
                onClick={this.viewCalendar}>{dateTime(date).format("YYYY년 MM월 DD일(ddd)")}</button>

            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, -1)}>
                <i className="tsi icon-ts-chevron_left" />
            </button>
            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, 1)}>
                <i className="tsi icon-ts-chevron_right" />
            </button>
            <button className="dp-btn today" onClick={this.setToday}>오늘</button>

            {isShow && <div className="ts-calendar">
                <Calendar onChange={this.onChange} value={date} />
            </div>}
        </div>);
    }
}
