import * as React from 'react';
import { connect } from 'react-redux';

import { Interval, Color } from '../../core';
import { XSpanDatum } from '../layerDataTypes';
import { ChartProviderState, SeriesId, selectData, selectXDomain } from '../../connected';
import SpanLayer from '../SpanLayer';

export interface OwnProps {
  seriesId: SeriesId;
  fillColor?: Color;
  borderColor?: Color;
}

export interface ConnectedProps {
  data: XSpanDatum[];
  xDomain: Interval;
}

function mapStateToProps(state: ChartProviderState, ownProps: OwnProps): ConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state)
  };
}

export default connect(mapStateToProps)(SpanLayer) as React.ComponentClass<OwnProps>;
