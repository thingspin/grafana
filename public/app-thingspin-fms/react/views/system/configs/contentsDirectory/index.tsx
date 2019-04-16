import React, { PureComponent, SyntheticEvent } from 'react';
import * as m from '../types';

interface PropsContentsDirectory {
    item: m.Item;
}

interface StatesContentsDirectory {
}

export class ContentsDirectory extends PureComponent<PropsContentsDirectory, StatesContentsDirectory> {
    render() {
        const { tag, attribute } = this.props.item;
        return ([
            <div className="attribute" key={ tag + "." + attribute}>
                { this.contents }
            </div>
        ]);
    }

    onClickSave = (event: SyntheticEvent) => {
        if (event) {
          event.preventDefault();
        }

        alert("Hello Save");

        // this.setState({
        //   showConfirm: true,
        // });
      };

      onClickCancel = (event: SyntheticEvent) => {
        if (event) {
          event.preventDefault();
        }
        alert("Hello Cancel");
        // this.setState({
        //   showConfirm: false,
        // });
      };

    get contents(): JSX.Element {
        const { tag, attribute, value } = this.props.item;
        let form = (<div></div>);

        switch ( tag ) {
            default: {
                form = (
                    <div className="gf-form" key={tag + ".folder"}>
                        <span className="gf-form-label width-10">{attribute}</span>
                        <input type="text" required className="gf-form-input min-width-20 width-30" name={tag + ".folder"} placeholder={value}/>

                        <span className="gf-form-label width-4">{"api"}</span>
                        <input type="text" required className="gf-form-input min-width-16 width-20" name={tag + ".api"} placeholder={"api/app/name"}/>

                        <button type = "reset" className="btn icon-button"><i className="fa fa-repeat"></i></button>
                        <button className="btn icon-button" onClick={e =>this.onClickSave(e)}><i className="fa fa-save"></i></button>
                    </div>
                );
            } break;
        }
        return form;
    }
}
