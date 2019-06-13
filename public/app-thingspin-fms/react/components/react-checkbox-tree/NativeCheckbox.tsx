import React from 'react';

interface Props {
    indeterminate: boolean;

    [name: string]: any;
}

export default class NativeCheckbox extends React.PureComponent<Props> {
    static defaultProps = {
        indeterminate: false,
    };

    checkbox: HTMLInputElement;

    componentDidMount() {
        this.updateDeterminateProperty();
    }

    componentDidUpdate() {
        this.updateDeterminateProperty();
    }

    updateDeterminateProperty(): void {
        const { indeterminate } = this.props;

        this.checkbox.indeterminate = indeterminate;
    }

    render(): JSX.Element {
        const props = { ...this.props };

        // Remove property that does not exist in HTML
        delete props.indeterminate;

        return <input {...props} ref={(c: HTMLInputElement) => { this.checkbox = c; }} type="checkbox" />;
    }
}
