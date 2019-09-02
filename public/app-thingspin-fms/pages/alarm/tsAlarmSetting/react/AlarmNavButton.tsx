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

// Facaility Monitoring Navigation Button Component
// (Customized grafana react component)
export const AlarmNavButton: FunctionComponent<Props> = ({ tooltip, classSuffix, onClick, href, children }) => {
    if (onClick) {
        return (
            <Tooltip content={tooltip}>
                <button className={`btn navbar-button navbar-button--${classSuffix}`}
                    aria-label={`${tooltip} navbar button`}
                    onClick={onClick}>
                    {children}
                </button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={tooltip}>
            <a className={`btn navbar-button navbar-button--${classSuffix}`} href={href}>
                {children}
            </a>
        </Tooltip>
    );
};
