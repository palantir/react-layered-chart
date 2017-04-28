import * as _ from 'lodash';
import * as d3Scale from 'd3-scale';
import { expect } from 'chai';

import { bucket, method, property } from './layerTestUtils';
import CanvasContextSpy from '../../src/test-util/CanvasContextSpy';
import { BucketDatum, JoinType } from '../../src/core/interfaces';
import { _renderCanvas } from '../../src/core/layers/BucketedLineLayer';
import { DASH_PERIOD_PX, DASH_SOLID_PX } from '../../src/core/renderUtils';

describe('BucketedLineLayer', () => {
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

  function renderWithSpy(spy: CanvasRenderingContext2D, data: BucketDatum[], joinType?: JoinType, lineWidth?: number, dashedLine?: boolean) {
    _renderCanvas(_.defaults({ data, joinType, lineWidth, dashedLine }, DEFAULT_PROPS), 100, 100, spy);
  }

  it('should render a single rect for a single bucket', () => {
    renderWithSpy(spy, [
      bucket(10, 25, 35, 80, 0, 0)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 10, 20, 15, 45 ])
    ]);
  });

  it('should round min-X up and max-X down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(10.4, 40.6, 0, 100, 0, 0)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 11, 0, 29, 100 ])
    ]);
  });

  it('should round min-Y and max-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket(0, 100, 40.4, 60.6, 0, 0)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 0, 40, 100, 20 ])
    ]);
  });

  it('should always draw a rect with width at least 1, even for tiny buckets', () => {
    renderWithSpy(spy, [
      bucket(50, 50, 0, 100, 0, 100)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 50, 0, 1, 100 ])
    ]);
  });

  it('should always draw a rect with height at least 1, even for tiny buckets', () => {
    renderWithSpy(spy, [
      bucket(0, 100, 50, 50, 50, 50)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([
      method('rect', [ 0, 49, 100, 1 ])
    ]);
  });

  it('should not draw a rect for a bucket of both width and height of 1', () => {
    renderWithSpy(spy, [
      bucket(50, 50, 50, 50, 50, 50)
    ]);

    expect(spy.callsOnly('rect')).to.deep.equal([]);
  });

  it('should draw lines between the last and first (respectively) Y values of adjacent rects', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,  0, 67),
      bucket(60, 100, 0, 100, 45,  0)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 39,  33 ]),
      method('lineTo', [ 60,  55 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  it('should draw an extra segment, vertical-first, when JoinType is LEADING', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,  0, 67),
      bucket(60, 100, 0, 100, 45,  0)
    ], JoinType.LEADING);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 39,  33 ]),
      method('lineTo', [ 39,  55 ]),
      method('lineTo', [ 60,  55 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  it('should draw an extra segment, vertical-last, when JoinType is TRAILING', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,  0, 67),
      bucket(60, 100, 0, 100, 45,  0)
    ], JoinType.TRAILING);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 39,  33 ]),
      method('lineTo', [ 60,  33 ]),
      method('lineTo', [ 60,  55 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  it('should round first-Y and last-Y values down to the nearest integer', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,    0, 67.6),
      bucket(60, 100, 0, 100, 45.6,    0)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 39,  33 ]),
      method('lineTo', [ 60,  55 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  it('should clamp first-Y and last-Y values to be between the min Y and max Y - 1', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0,   40, 0, 100),
      bucket(60, 100, 60, 100, 0, 100)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [ 39, 61 ]),
      method('lineTo', [ 60, 40 ]),
      method('moveTo', [ 99,  1 ])
    ]);
  });

  it('should draw wide lines and rectangles when line width greater than 1 is specified', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 100,  0, 67),
      bucket(60, 100, 0, 100, 45,  0)
    ], JoinType.DIRECT, 2);

    expect(spy.properties.filter(({ property }) => property === 'lineWidth')).to.deep.equal([
      property('lineWidth', 2)
    ]);
    expect(spy.callsOnly('moveTo', 'lineTo', 'rect')).to.deep.equal([
      method('rect', [ -1, -1, 42, 102]),
      method('rect', [ 59, -1, 42, 102]),
      method('moveTo', [ 39,  33 ]),
      method('lineTo', [ 60,  55 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  it('should draw dashed lines and striped rectangles when dashed lines are specified', () => {
    renderWithSpy(spy, [
      bucket( 0,  40, 0, 20,  0, 67),
      bucket(60, 100, 0, 20, 45,  0)
    ], JoinType.DIRECT, 1, true);

    expect(spy.callsOnly('moveTo', 'lineTo', 'rect', 'setLineDash')).to.deep.equal([
      method('rect', [ 0, 80, 40, DASH_SOLID_PX]),
      method('rect', [ 0, 90, 40, DASH_PERIOD_PX]),
      method('rect', [ 60, 80, 40, DASH_SOLID_PX]),
      method('rect', [ 60, 90, 40, DASH_PERIOD_PX]),
      method('setLineDash', [ [DASH_SOLID_PX, DASH_PERIOD_PX - DASH_SOLID_PX] ]),
      method('moveTo', [ 39,  81 ]),
      method('lineTo', [ 60,  81 ]),
      method('moveTo', [ 99, 100 ])
    ]);
  });

  xit('should not draw lines between rects when they overlap in Y and they are separated by 0 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  60,  0,  60),
      bucket(50, 100, 40, 100, 40, 100)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ]),
    ]);
  });

  xit('should not draw lines between rects when they overlap in Y and they are separated by 1 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  60,  0,  60),
      bucket(51, 100, 40, 100, 40, 100)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ])
    ]);
  });

  xit('should draw lines between rects when they do not overlap in Y and they are separated by 0 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  40,  0,  40),
      bucket(50, 100, 60, 100, 60, 100)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [  50, 60 ]),
      method('lineTo', [  50, 40 ]),
      method('moveTo', [ 100,  0 ])
    ]);
  });

  xit('should draw lines between rects when they do not overlap in Y and they are separated by 1 along X', () => {
    renderWithSpy(spy, [
      bucket( 0,  50,  0,  40,  0,  40),
      bucket(51, 100, 60, 100, 60, 100)
    ]);

    expect(spy.callsOnly('moveTo', 'lineTo')).to.deep.equal([
      method('moveTo', [  50, 60 ]),
      method('lineTo', [  51, 40 ]),
      method('moveTo', [ 100,  0 ])
    ]);
  });
});
