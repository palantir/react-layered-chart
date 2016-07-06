import * as React from 'react';

export type Color = string;
export type ScaleFunction = Function; // TODO: d3 scale function typings.
export type SeriesData = any[];

export type Ticks = ((axisDomain: Interval) => number[]) | number[] | number;
export type TickFormat = ((value: number) => string) | string;
export type BooleanMouseEventHandler = (event: React.MouseEvent) => boolean;

export interface Interval {
  min: number;
  max: number;
}

const interval = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

const ticks = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.number,
  React.PropTypes.arrayOf(React.PropTypes.number)
]);

const tickFormat = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.string
]);

export const propTypes = {
  interval,
  ticks,
  tickFormat
};
