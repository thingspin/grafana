import React, { PureComponent } from 'react';

export class UnderConstruction extends PureComponent {
  render() {
      return (
          <div className="under-construction">
            <span><i className="fa fa-exclamation-triangle fa-10x"></i></span>
          </div>
      );
  }
}
