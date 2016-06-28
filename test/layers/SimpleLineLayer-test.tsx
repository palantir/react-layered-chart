import * as _ from 'lodash';
import * as React from 'react';
import * as d3Scale from 'd3-scale';

import { PointDatum } from '../../src';
import { point, method } from './layerTestUtils';
import CanvasContextSpy from '../CanvasContextSpy';
import { _renderCanvas, Props } from '../../src/core/layers/SimpleLineLayer';

describe('SimpleLineLayer', () => {
  let spy: typeof CanvasContextSpy;

  const DEFAULT_PROPS = {
    xDomain: { min: 0, max: 100 },
    yDomain: { min: 0, max: 100 },
    yScale: d3Scale.scaleLinear,
    color: '#000'
  };

  beforeEach(() => {
    spy = new CanvasContextSpy();
  });

  function renderWithSpy(data: PointDatum[], spy: typeof CanvasContextSpy) {
    _renderCanvas(_.defaults({ data }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render all visible data plus one on each end when the data spans more than the domain', () => {
    renderWithSpy([
      point(-10, 5),
      point(-5, 10),
      point(50, 15),
      point(105, 20),
      point(110, 2)
    ], spy);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ -5, 90 ]),
      method('lineTo', [ 50, 85 ]),
      method('lineTo', [ 105, 80 ]),
      method('stroke', [])
    ]);
  });

  it('should render all the data if all the data fits in the domain', () => {
    renderWithSpy([
      point(25, 33),
      point(75, 50)
    ], spy);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 25, 67 ]),
      method('lineTo', [ 75, 50 ]),
      method('stroke', [])
    ]);
  });

  it('should not render anything if there is only one data point', () => {
    renderWithSpy([
      point(50, 50)
    ], spy);
  });

  it('should round X and Y values to the nearest integer', () => {
    renderWithSpy([
      point(34.6, 22.1),
      point(55.4, 84.6)
    ], spy);

    spy.calls.should.deepEqual([
      method('beginPath', []),
      method('moveTo', [ 35, 78 ]),
      method('lineTo', [ 55, 15 ]),
      method('stroke', [])
    ]);
  });
});