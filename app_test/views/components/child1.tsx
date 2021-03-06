import * as React from 'react';
import { Compose, ServerCallApi } from '../../api';
var { ReduxAsyncConnect, asyncConnect, reducer, store } = require('../../../').Decorators.view;
var loadSuccess = store.loadSuccess;
export interface Props {
  prop1?: any
  prop2?: any
  onClick?: any
  propClick?:any
}
export interface States {
}

@asyncConnect([{
  key: 'prop1',
  promise: ({ params, helpers }) => {
    return Promise.resolve('prop1');
  }
},{
  key: 'propClick',
  promise: ({ params, helpers }) => {
    return '';
  }
}],
// mapStateToProps
null, 
// mapDispatchToProps
(dispatch) => {
  return {
    onClick: () => {
      dispatch(loadSuccess('propClick', 'click.'));
    } 
  }
})
export default class Child1 extends React.Component<Props, States>   {
  constructor(props: Props) {
    super(props);
  }
  componentDidMount() {
    // this.props.onLoad();
  }
  render() {
    var result = <div style={{border:"blue solid 1px", padding : '3px', margin : "5px"}}>
      <h3>child1</h3>
      {this.props.prop1}
      <button id="btn1" onClick={() => {
        this.props.onClick();
      }}>Child1 button</button>{this.props.propClick}
    </div>
    return result;
  }
};