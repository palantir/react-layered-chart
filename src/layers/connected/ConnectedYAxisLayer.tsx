import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import { Interval, Color, AxisSpec } from '../../core';
import { ChartProviderState, SeriesId, TBySeriesId, selectXDomain, selectYDomains } from '../../connected';
import YAxisLayer from '../YAxisLayer';

export interface ConnectedYAxisSpec extends AxisSpec {
  seriesId: SeriesId;
}

export interface OwnProps {
  axes: ConnectedYAxisSpec[];
  font?: string;
  backgroundColor?: Color;
}

export interface ConnectedProps {
  yDomainsBySeriesId: TBySeriesId<Interval>;
}

@PureRender
export class ConnectedYAxisLayer extends React.Component<OwnProps & ConnectedProps, {}> {
  render() {
    const denormalizedProps = _.defaults({
      axes: this.props.axes.map(axis => _.defaults({
        yDomain: this.props.yDomainsBySeriesId[axis.seriesId],
        axisId: axis.seriesId
      }, axis))
    }, this.props);
    return (
      <YAxisLayer {...denormalizedProps}/>
    );
  }
}

function mapStateToProps(state: ChartProviderState): ConnectedProps {
  return {
    yDomainsBySeriesId: selectYDomains(state)
  };
}

export default connect(mapStateToProps)(ConnectedYAxisLayer) as React.ComponentClass<OwnProps>;
