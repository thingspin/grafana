// External Libraries
import React, { PureComponent } from 'react';
// Grafana Libraries
import { updateLocation } from 'app/core/actions';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
// ThingSPIN Libraries
import { TsBaseProps } from 'app-thingspin-fms/models/common';

export interface Props extends TsBaseProps {
  updateLocation: typeof updateLocation;
}

export interface States {
  mode: boolean;
  search: string;
}

export class TsNavSearchComponent extends PureComponent<Props, States> {
  constructor(props) {
    super(props);

    this.state = {
      mode: false,
      search: '',
    };
  }

  // common event Methods

  onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        const { updateLocation } = this.props;
        updateLocation({
          path: '/fms/search',
          query: {
            search: this.state.search,
          },
        });
        break;
    }
  }
  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    this.setState({ search: value });
  }

  render() {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods

    // return virtual DOM
    return (
      <div className="ts-nav-search-component">
        <span className="fa fa-search" />
        <input
          type="text"
          placeholder={'검색'}
          onKeyPress={this.onKeyPress.bind(this)}
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsNavSearchComponent, mapStateToProps, mapDispatchToProps);
