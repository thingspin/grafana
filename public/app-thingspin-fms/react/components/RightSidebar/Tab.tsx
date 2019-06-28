// 3rd partt libs
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

const Tab: SFC<TabProps> = (props: TabProps): JSX.Element => {
    // closer vairable define
    const { name, children, initActive, heading } = props;

    return (<Consumer>
        {(context: TabsComponent) => {
            // closer vairable define
            const activeName = context.name;
            if (!context.name && initActive && context.handleTabClick) {
                context.handleTabClick(name, children);
                return null;
            }

            // class Define
            const cls = classNames({
                'rtab-active': name === activeName,
            });

            // HTML Event Define
            const handleTabClick = (e: MouseEvent<any>): void => {
                if (context.handleTabClick) {
                    context.handleTabClick(name, children);
                }
            };

            // Render HTML
            return (<div className={`fms-right-tab ${cls}`} onClick={handleTabClick}> { heading() } </div>);
        }}
    </Consumer>
    );
};

export default Tab;
