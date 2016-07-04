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
