import * as React from 'react';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import { wrapWithAnimatedYDomain } from '../componentUtils';
import propTypes from '../propTypes';
import { Interval, Color, ScaleFunction, BucketDatum, JoinType } from '../interfaces';

const DASH_PERIOD_PX = 10;
const DASH_SOLID_PX = 6;

export interface Props {
  data: BucketDatum[];
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
class BucketedLineLayer extends React.PureComponent<Props, void> {
  context: Context;

  static propTypes: React.ValidationMap<Props> = {
    data: React.PropTypes.arrayOf(propTypes.bucketDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    yDomain: propTypes.interval.isRequired,
    yScale: React.PropTypes.func,
    color: React.PropTypes.string,
    lineWidth: React.PropTypes.number,
    dashedLine: React.PropTypes.bool
  };

  static defaultProps: Partial<Props> = {
    yScale: d3Scale.scaleLinear,
    color: '#444',
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

// Export for testing.
export function _renderCanvas(props: Props, width: number, height: number, context: CanvasRenderingContext2D) {
  const { firstIndex, lastIndex } = getIndexBoundsForSpanData(props.data, props.xDomain, 'minXValue', 'maxXValue');

  if (firstIndex === lastIndex) {
    return;
  }

  // Don't use rangeRound -- it causes flicker as you pan/zoom because it doesn't consistently round in one direction.
  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .range([ 0, width ]);

  const yScale = props.yScale!()
    .domain([ props.yDomain.min, props.yDomain.max ])
    .range([ 0, height ]);

  const computedValuesForVisibleData = props.data
  .slice(firstIndex, lastIndex)
  .map(datum => {
    // TODO: Why is this ceiling'd? There must have been a reason...
    // I think this was to avoid jitter, but if you zoom really slowly when the rects
    // are small you can still see them jitter in their width...
    const minX = Math.ceil(xScale(datum.minXValue));
    const maxX = Math.max(Math.floor(xScale(datum.maxXValue)), minX + 1);

    const minY = Math.floor(yScale(datum.minYValue));
    const maxY = Math.max(Math.floor(yScale(datum.maxYValue)), minY + 1);

    return {
      minX,
      maxX,
      minY,
      maxY,
      firstY: clamp(Math.floor(yScale(datum.firstYValue)), minY, maxY - 1),
      lastY: clamp(Math.floor(yScale(datum.lastYValue)), minY, maxY - 1),
      width: maxX - minX,
      height: maxY - minY
    };
  });

  // Bars
  const sizeAdjust = props.lineWidth! > 1
    ? props.lineWidth!
    : 0;
  const positionAdjust = sizeAdjust / 2;
  context.beginPath();
  for (let i = 0; i < computedValuesForVisibleData.length; ++i) {
    const computedValues = computedValuesForVisibleData[i];
    if (computedValues.width !== 1 || computedValues.height !== 1) {
      drawRectangle(
        computedValues.minX - positionAdjust,
        height - computedValues.maxY - positionAdjust,
        computedValues.width + sizeAdjust,
        computedValues.height + sizeAdjust,
        context, props.dashedLine!
      );
    }
  }
  context.fillStyle = props.color!;
  context.fill();

  // Lines
  context.translate(0.5, -0.5);
  if (props.dashedLine) {
    context.setLineDash([DASH_SOLID_PX, DASH_PERIOD_PX - DASH_SOLID_PX]);
  } else {
    context.setLineDash([]);
  }
  context.beginPath();
  const firstComputedValues = computedValuesForVisibleData[0];
  context.moveTo(firstComputedValues.maxX - 1, height - firstComputedValues.lastY);
  for (let i = 1; i < computedValuesForVisibleData.length; ++i) {
    const computedValues = computedValuesForVisibleData[i];

    if (props.joinType === JoinType.LEADING) {
      context.lineTo(computedValuesForVisibleData[i - 1].maxX - 1, height - computedValues.firstY);
    } else if (props.joinType === JoinType.TRAILING) {
      context.lineTo(computedValues.minX, height - computedValuesForVisibleData[i - 1].lastY);
    }

    context.lineTo(computedValues.minX, height - computedValues.firstY);
    context.moveTo(computedValues.maxX - 1, height - computedValues.lastY);
  }
  context.strokeStyle = props.color!;
  context.lineWidth = props.lineWidth!;
  context.lineCap = 'round';
  context.stroke();
}

function drawRectangle(x: number, y: number, w: number, h: number, context: CanvasRenderingContext2D, dashed: boolean) {
  if (dashed) {
    if (h <= DASH_PERIOD_PX) {
      context.rect(x, y, w, h);
    } else {
      context.rect(x, y, w, DASH_SOLID_PX);
      drawRectangle(x, y + DASH_PERIOD_PX, w, h - DASH_PERIOD_PX, context, dashed);
    }
  } else {
    context.rect(x, y, w, h);
  }
}

export default wrapWithAnimatedYDomain(BucketedLineLayer);
