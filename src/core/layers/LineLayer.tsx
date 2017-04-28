import * as React from 'react';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { DASH_PERIOD_PX, DASH_SOLID_PX, getIndexBoundsForPointData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, PointDatum, ScaleFunction, Color, JoinType } from '../interfaces';

export interface Props {
  data: PointDatum[];
  xDomain: Interval;
  yDomain: Interval;
  yScale?: ScaleFunction;
  color?: Color;
  lineWidth?: number;
  dashedLine?: boolean;
  joinType?: JoinType;
}

@NonReactRender
@PixelRatioContext
class LineLayer extends React.PureComponent<Props, void> {
  context: Context;

  static propTypes: React.ValidationMap<Props> = {
    data: React.PropTypes.arrayOf(propTypes.pointDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    lineWidth: React.PropTypes.number,
    dashedLine: React.PropTypes.bool
  };

  static defaultProps: Partial<Props> = {
    yScale: d3Scale.scaleLinear,
    color: 'rgba(0, 0, 0, 0.7)',
    lineWidth: 1,
    dashedLine: false,
    joinType: JoinType.DIRECT
  };

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
  // Should we draw something if there is one data point?
  if (props.data.length < 2) {
    return;
  }

  const { firstIndex, lastIndex } = getIndexBoundsForPointData(props.data, props.xDomain, 'xValue');
  if (firstIndex === lastIndex) {
    return;
  }

  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  const yScale = props.yScale!()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .rangeRound([ 0, height ]);

  context.translate(0.5, -0.5);
  if (props.dashedLine) {
    context.setLineDash([DASH_SOLID_PX, DASH_PERIOD_PX - DASH_SOLID_PX]);
  } else {
    context.setLineDash([]);
  }
  context.beginPath();

  context.moveTo(xScale(props.data[firstIndex].xValue), height - yScale(props.data[firstIndex].yValue));
  for (let i = firstIndex + 1; i < lastIndex; ++i) {
    const xValue = xScale(props.data[i].xValue);
    const yValue = height - yScale(props.data[i].yValue);

    if (props.joinType === JoinType.LEADING) {
      context.lineTo(xScale(props.data[i - 1].xValue), yValue);
    } else if (props.joinType === JoinType.TRAILING) {
      context.lineTo(xValue, height - yScale(props.data[i - 1].yValue));
    }

    context.lineTo(xValue, yValue);
  }

  context.strokeStyle = props.color!;
  context.lineWidth = props.lineWidth!;
  context.lineCap = 'round';
  context.stroke();
}

export default wrapWithAnimatedYDomain(LineLayer);
