import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color } from '../../core';
import { XSpanDatum } from '../layerDataTypes';
import { ChartProviderState, selectSelection, selectXDomain } from '../../connected';
import SpanLayer from '../SpanLayer';

export interface OwnProps {
  fillColor?: Color;
  borderColor?: Color;
}

export interface ConnectedProps {
  data: XSpanDatum[];
  xDomain: Interval;
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  const selection = selectSelection(state);
  return {
    data: selection ? [{ minXValue: selection.min, maxXValue: selection.max }] : [],
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(SpanLayer) as React.ComponentClass<OwnProps>;
