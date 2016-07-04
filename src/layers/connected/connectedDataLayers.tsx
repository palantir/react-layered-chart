import { Color, ScaleFunction } from '../../core';
import { SeriesId } from '../../connected';

import { default as BarLayer, Props as BarLayerProps } from '../BarLayer';
import { default as BucketedLineLayer, Props as BucketedLineLayerProps } from '../BarLayer';
import { default as PointLayer, Props as PointLayerProps } from '../BarLayer';
import { default as SimpleLineLayer, Props as SimpleLineLayerProps } from '../BarLayer';

import { wrapDataLayerWithConnect, SeriesIdProp } from './wrapDataLayerWithConnect';


export interface _CommonConnectedBarLayerProps {
  color?: Color;
}
export type ConnectedBarLayerProps = _CommonConnectedBarLayerProps & SeriesIdProp;
export const ConnectedBarLayer = wrapDataLayerWithConnect<_CommonConnectedBarLayerProps, BarLayerProps>(BarLayer);


export interface _CommonConnectedBucketedLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
}
export type ConnectedBucketedLineLayerProps = _CommonConnectedBucketedLineLayerProps & SeriesIdProp;
export const ConnectedBucketedLineLayer = wrapDataLayerWithConnect<_CommonConnectedBucketedLineLayerProps, BucketedLineLayerProps>(BucketedLineLayer);


export interface _CommonConnectedPointLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
  radius?: number;
  innerRadius?: number;
}
export type ConnectedPointLayerProps = _CommonConnectedPointLayerProps & SeriesIdProp;
export const ConnectedPointLayer = wrapDataLayerWithConnect<_CommonConnectedPointLayerProps, PointLayerProps>(PointLayer);


export interface _CommonConnectedSimpleLineLayerProps {
  yScale?: ScaleFunction;
  color?: Color;
}
export type ConnectedSimpleLineLayerProps = _CommonConnectedSimpleLineLayerProps & SeriesIdProp;
export const ConnectedSimpleLineLayer = wrapDataLayerWithConnect<_CommonConnectedSimpleLineLayerProps, SimpleLineLayerProps>(SimpleLineLayer);
