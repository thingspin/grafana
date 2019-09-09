// 3rd party libs
import React, { FunctionComponent } from 'react';

// Grafana libs
// Views
import { Tooltip } from '@grafana/ui';

interface Props {
    tooltip: string;
    classSuffix: string;

    onClick?: () => void;
    href?: string;

}

// Alarm Monitoring Navigation Button Component
// (Customized grafana react component)
export const AlarmNavButton: FunctionComponent<Props> = ({ tooltip, classSuffix, onClick, href, children }) => (
    <Tooltip content={tooltip}>
        {onClick
            ? <button className={`btn navbar-button navbar-button--${classSuffix}`}
                aria-label={`${tooltip} navbar button`}
                onClick={onClick}>
                {children}
            </button>
            : <a className={`btn navbar-button navbar-button--${classSuffix}`} href={href}>
                {children}
            </a>
        }
    </Tooltip>
);
