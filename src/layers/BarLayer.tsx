import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

import {
  Interval,
  SpanDatum,
  Color,
  NonReactRender,
  PixelRatioContext,
  PixelRatioContextType,
  getIndexBoundsForSpanData,
  wrapWithAnimatedYDomain,
  propTypes
} from '../core';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';

export interface Props {
  data: SpanDatum[];
  xDomain: Interval;
  yDomain: Interval;
  color?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
class BarLayer extends React.Component<Props, void> {
  context: PixelRatioContextType;

  static propTypes = {
    data: React.PropTypes.arrayOf(propTypes.spanDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    color: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    color: 'rgba(0, 0, 0, 0.7)'
  } as any as Props;

  render() {
    return <PollingResizingCanvasLayer
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
      pixelRatio={this.context.pixelRatio}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = (this.refs['canvasLayer'] as PollingResizingCanvasLayer).resetCanvas();
    _renderCanvas(this.props, width, height, context);
  };
}

// Export for testing.
export function _renderCanvas(props: Props, width: number, height: number, context: CanvasRenderingContext2D) {
  const { firstIndex, lastIndex } = getIndexBoundsForSpanData(props.data, props.xDomain, 'minXValue', 'maxXValue');
  if (firstIndex === lastIndex) {
    return;
  }

  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  const yScale = d3Scale.scaleLinear()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .rangeRound([ 0, height ]);

  context.beginPath();

  for (let i = firstIndex; i < lastIndex; ++i) {
    const left = xScale(props.data[i].minXValue);
    const right = xScale(props.data[i].maxXValue);
    const top = height - yScale(props.data[i].yValue);
    const bottom = height - yScale(0);

    context.rect(left, bottom, right - left, top - bottom);
  }

  context.fillStyle = props.color;
  context.fill();
}

export default wrapWithAnimatedYDomain(BarLayer);
