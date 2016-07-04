import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color, XSpanDatum } from '../../core';
import { ChartProviderState, selectSelection, selectXDomain } from '../../connected';
import BrushLayer from '../BrushLayer';

export interface OwnProps {
  stroke?: Color;
  fill?: Color;
}

export interface ConnectedProps {
  xDomain: Interval;
  selection?: Interval;
}

@PureRender
class ConnectedBrushLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    return (
      <BrushLayer {...this.props}/>
    );
  }
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    xDomain: selectXDomain(state),
    selection: selectSelection(state)
  };
}

export default connect(mapStateToProps)(ConnectedBrushLayer) as React.ComponentClass<OwnProps>;
