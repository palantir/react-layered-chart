import * as React from 'react';
import { connect } from 'react-redux';

import { Interval } from '../../core';
import { AxisSpec } from '../layerDataTypes';
import { ChartProviderState, selectXDomain } from '../../connected';
import XAxisLayer from '../XAxisLayer';


export interface OwnProps extends AxisSpec {
  font?: string;
}

export interface ConnectedProps {
  xDomain: Interval;
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(XAxisLayer) as React.ComponentClass<OwnProps>;
