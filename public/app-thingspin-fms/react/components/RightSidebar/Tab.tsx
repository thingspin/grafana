// 3rd party libs
import classNames from 'classnames';
import React, { SFC, MouseEvent, ReactNode } from 'react';

// thingspin libs
import { Consumer, TabsComponent } from './Context';

export interface TabProps {
    name: string;
    initActive?: boolean;
    heading: () => ReactNode;

    // default
    children?: ReactNode;
}

const Tab: SFC<TabProps> = ({ name, children, initActive, heading }: TabProps): JSX.Element => (
    <Consumer>
        {(context: TabsComponent) => {
            // closer vairable define
            if (!context.name && initActive && context.handleTabClick) {
                context.handleTabClick(name, children);
                return null;
            }

            // class Define
            const cls = classNames({
                'rtab-active': name === context.name,
            });

            // HTML Event Define
            const handleTabClick = (_: MouseEvent<any>): void => {
                if (context.handleTabClick) {
                    context.handleTabClick(name, children);
                }
            };

            // Render HTML
            return (<div className={`fms-right-tab ${cls}`} onClick={handleTabClick}> {heading()} </div>);
        }}
    </Consumer>
);

export default Tab;
