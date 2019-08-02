// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';
import Calendar from 'react-calendar';
// tslint:disable-next-line: import-blacklist
import moment from 'moment';

export interface Props {
    onChange?: (date: Date) => void;
    date?: Date;
}

export interface States {
    date?: Date;
    isShow: boolean;
}


export default class TsDatePciker extends PureComponent<Props, States> {
    state: States = {
        date: this.props.date,
        isShow: false,
    };

    onChange(date: Date, toggle?: boolean) {
        const { onChange } = this.props;
        if (onChange) {
            onChange(date);
        }

        this.setState({ date });
        this.showToggle(toggle);
    }

    showToggle(toggle?: boolean) {
        const { isShow } = this.state;

        if (toggle === undefined || toggle === null) {
            this.setState({ isShow: !isShow });
        } else {
            this.setState({ isShow: toggle });
        }
    }

    setToday() {
        const d = new Date();

        this.onChange(d, false);
        this.setState({ date: d });
    }

    moveDay(value: number) {
        const { date } = this.state;
        date.setDate(date.getDate() + value);

        const d = new Date(date);
        this.onChange(d, false);

        this.setState({ date: d });
    }

    viewCalendar() {
        this.showToggle();
    }

    render(): ReactNode {
        const { isShow, date } = this.state;

        return (<div className="ts-date-picker">
            <button className={`dp-btn ts-date ${isShow ? 'active' : ''}`}
                onClick={this.viewCalendar.bind(this)}>{moment(date).format("YYYY년 MM월 DD일(ddd)")}</button>

            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, -1)}>
                <i className="tsi icon-ts-chevron_left"></i>
            </button>
            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, 1)}>
                <i className="tsi icon-ts-chevron_right"></i>
            </button>
            <button className="dp-btn today" onClick={this.setToday.bind(this)}>오늘</button>

            {isShow ?
                <div className="ts-calendar">
                    <Calendar onChange={this.onChange.bind(this)} value={date} />
                </div>
                : ''}
        </div>);
    }
}
