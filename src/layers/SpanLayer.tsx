import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';
import { deprecate } from 'react-is-deprecated';

import {
  Interval,
  Color,
  NonReactRender,
  PixelRatioContext,
  PixelRatioContextType,
  getIndexBoundsForSpanData,
  wrapWithAnimatedYDomain,
  propTypes
} from '../core';
import { XSpanDatum, layerPropTypes } from './layerDataTypes';
import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';

export interface Props {
  data: XSpanDatum[];
  xDomain: Interval;
  color?: Color;
  fillColor?: Color;
  borderColor?: Color;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class SpanLayer extends React.Component<Props, void> {
  context: PixelRatioContextType;

  static propTypes = {
    data: React.PropTypes.arrayOf(layerPropTypes.xSpanDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    color: deprecate(React.PropTypes.string, 'SpanLayer\'s \'color\' prop is deprecated in favor of \'fillColor\' and/or \'borderColor\''),
    fillColor: React.PropTypes.string,
    borderColor: React.PropTypes.string
  } as React.ValidationMap<Props>;

  static defaultProps = {
    fillColor: 'rgba(0, 0, 0, 0.1)'
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
  }
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

  const defaultFill = props.color || props.fillColor;

  context.lineWidth = 1;
  context.strokeStyle = props.borderColor;

  for (let i = firstIndex; i < lastIndex; ++i) {
    const left = xScale(props.data[i].minXValue);
    const right = xScale(props.data[i].maxXValue);
    context.beginPath();
    context.rect(left, -1, right - left, height + 2);

    const fillStyle = props.data[i].color || defaultFill;
    if (fillStyle) {
      context.fillStyle = fillStyle;
      context.fill();
    }

    if (props.borderColor) {
      context.stroke();
    }
  }
}
