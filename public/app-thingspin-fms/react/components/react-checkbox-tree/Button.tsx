import React from 'react';

interface Props {
    title: string;

    [name: string]: any;
}

export default class Button extends React.PureComponent<Props> {
    static defaultProps = {
        title: null,
    };

    render() {
        const { children, title, ...props } = this.props;

        return (
            <button type="button" aria-label={title} title={title} {...props}>
                {children}
            </button>
        );
    }
}
