import * as React from 'react';
import { deprecate } from 'react-is-deprecated';

import { Color, ScaleFunction, Ticks, TickFormat, propTypes } from '../core';

export interface PointDatum {
  xValue: number;
  yValue: number;
}

export interface XSpanDatum {
  minXValue: number;
  maxXValue: number;
  color?: Color;
}

export interface SpanDatum {
  minXValue: number;
  maxXValue: number;
  yValue: number;
}

export interface BucketDatum {
  minXValue: number;
  maxXValue: number;
  minYValue: number;
  maxYValue: number;
  firstYValue: number;
  lastYValue: number;
}

export interface AxisSpec {
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
}


const pointDatum = React.PropTypes.shape({
  xValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

const spanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  yValue: React.PropTypes.number.isRequired
});

const bucketDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  minYValue: React.PropTypes.number.isRequired,
  maxYValue: React.PropTypes.number.isRequired,
  firstYValue: React.PropTypes.number.isRequired,
  lastYValue: React.PropTypes.number.isRequired
});

const xSpanDatum = React.PropTypes.shape({
  minXValue: React.PropTypes.number.isRequired,
  maxXValue: React.PropTypes.number.isRequired,
  color: deprecate(React.PropTypes.string, 'xSpanDatum\'s \'color\' prop is deprecated and may not be respected by all layers')
});

const axisSpecPartial = {
  scale: React.PropTypes.func,
  ticks: propTypes.ticks,
  tickFormat: propTypes.tickFormat,
  color: React.PropTypes.string
};

export const layerPropTypes = {
  pointDatum,
  spanDatum,
  xSpanDatum,
  bucketDatum,
  axisSpecPartial
};
