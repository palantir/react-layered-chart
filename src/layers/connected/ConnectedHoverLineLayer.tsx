import * as React from 'react';
import { connect } from 'react-redux';

import { Interval } from '../../core';
import { ChartProviderState, selectHover, selectXDomain } from '../../connected';
import HoverLineLayer from '../HoverLineLayer';

export interface OwnProps {
  color?: string;
}

export interface ConnectedProps {
  hover?: number;
  xDomain: Interval;
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    hover: selectHover(state),
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(HoverLineLayer) as React.ComponentClass<OwnProps>;
