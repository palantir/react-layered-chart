import { PointDatum, SpanDatum, XSpanDatum, BucketDatum } from '../../src/layers/layerDataTypes';
import { PropertySet, MethodCall } from '../../src/test-util/CanvasContextSpy';

export function point(xValue: number, yValue: number): PointDatum {
  return { xValue, yValue };
}

export function span(minXValue: number, maxXValue: number, yValue: number): SpanDatum {
  return { minXValue, maxXValue, yValue };
}

export function xSpan(minXValue: number, maxXValue: number, color?: string): XSpanDatum {
  return { minXValue, maxXValue, color };
}

export function bucket(minXValue: number, maxXValue: number, minYValue: number, maxYValue: number, firstYValue: number, lastYValue: number): BucketDatum {
  return { minXValue, maxXValue, minYValue, maxYValue, firstYValue, lastYValue };
}

export function property(property: string, value: any): PropertySet {
  return { property, value };
}

export function method(method: string, args: any[]): MethodCall {
  return { method, arguments: args };
}
