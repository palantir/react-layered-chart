import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { span, method } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { SpanDatum } from '../../src/layers/layerDataTypes';
import { _renderCanvas, Props } from '../../src/layers/BarLayer';

describe('BarLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    yDomain: { min: 0, max: 100 },
    color: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(spy: CanvasRenderingContext2D, data: SpanDatum[]) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a bar with a positive value', () => {
    renderWithSpy(spy, [
      span(40, 60, 33)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 40, 100, 20, -33 ]),
      method('fill', [])
    ]);
  });

  it('should render a bar with a negative value', () => {
    renderWithSpy(spy, [
      span(40, 60, -33)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 40, 100, 20, 33 ]),
      method('fill', [])
    ]);
  });

  it('should round X and Y values to the nearest integer', () => {
    renderWithSpy(spy, [
      span(33.4, 55.6, 84.7)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 33, 100, 23, -85 ]),
      method('fill', [])
    ]);
  });

  it('should fill once at the end', () => {
    renderWithSpy(spy, [
      span(20, 40, 10),
      span(60, 80, 90)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ 20, 100, 20, -10 ]),
      method('rect', [ 60, 100, 20, -90 ]),
      method('fill', [])
    ]);
  });

  it('should attempt to render points even if their X or Y values are NaN or infinite', () => {
    renderWithSpy(spy, [
      span(NaN, 50, 50),
      span(50, NaN, 50),
      span(50, 50, NaN),
      span(-Infinity, 50, 50),
      span(50, Infinity, 50),
      span(50, 50, Infinity)
    ]);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('rect', [ NaN, 100, NaN, -50 ]),
      method('rect', [ 50, 100, NaN, -50 ]),
      method('rect', [ 50, 100, 0, NaN ]),
      method('rect', [ -Infinity, 100, Infinity, -50 ]),
      method('rect', [ 50, 100, Infinity, -50 ]),
      method('rect', [ 50, 100, 0, -Infinity ]),
      method('fill', [])
    ]);
  });
});
