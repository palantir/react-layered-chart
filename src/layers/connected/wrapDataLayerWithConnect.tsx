import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, ScaleFunction, SeriesData} from '../../core';
import { ChartProviderState, SeriesId, selectData, selectXDomain, selectYDomains } from '../../connected';

export interface SeriesIdProp {
  seriesId: SeriesId;
}

export interface WrappedDataLayerConnectedProps {
  data: SeriesData;
  xDomain: Interval;
  yDomain: Interval;
}

function mapStateToProps(state: ChartProviderState, ownProps: SeriesIdProp): WrappedDataLayerConnectedProps {
  return {
    data: selectData(state)[ownProps.seriesId],
    xDomain: selectXDomain(state),
    yDomain: selectYDomains(state)[ownProps.seriesId]
  };
}

export function wrapDataLayerWithConnect<
    OwnProps,
    OriginalProps extends OwnProps & WrappedDataLayerConnectedProps
  >(OriginalComponent: React.ComponentClass<OriginalProps>): React.ComponentClass<OwnProps & SeriesIdProp> {

  return connect(mapStateToProps)(OriginalComponent) as React.ComponentClass<OwnProps & SeriesIdProp>;
}
