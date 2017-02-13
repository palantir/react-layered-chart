import * as React from 'react';
import * as classNames from 'classnames';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';

const LEFT_MOUSE_BUTTON = 0;

export interface Props {
  className?: string;
  zoomSpeed?: number | ((e: React.WheelEvent) => number);
  onZoom?: (factor: number, xPct: number, yPct: number, e: React.WheelEvent) => void;
  onDragStart?: (xPct: number, yPct: number, e: React.MouseEvent) => void;
  onDrag?: (xPct: number, yPct: number, e: React.MouseEvent) => void;
  onDragEnd?: (xPct: number, yPct: number, e: React.MouseEvent) => void;
  onClick?: (xPct: number, yPct: number, e: React.MouseEvent) => void;
  onHover?: (xPct: number, yPct: number, e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export interface State {
  mouseDownClientX?: number;
  mouseDownClientY?: number;
  lastMouseMoveClientX?: number;
  lastMouseMoveClientY?: number;
}

@PureRender
export default class MouseCapture extends React.Component<Props, State> {
  static propTypes = {
    className: React.PropTypes.string,
    zoomSpeed: React.PropTypes.oneOfType([
       React.PropTypes.number,
       React.PropTypes.func
    ]),
    onZoom: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onHover: React.PropTypes.func,
    onClick: React.PropTypes.func,
    children: React.PropTypes.oneOfType([
       React.PropTypes.element,
       React.PropTypes.arrayOf(React.PropTypes.element)
    ])
  };

  static defaultProps = {
    zoomSpeed: 0.05
  } as any as Props;

  private element: HTMLDivElement;

  state: State = {};

  render() {
    return (
      <div
        className={classNames('lc-mouse-capture', this.props.className)}
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseLeave}
        onWheel={this._onWheel}
        ref={element => { this.element = element; }}
      >
        {this.props.children}
      </div>
    );
  }

  private _createPhysicalToLogicalScales() {
    const { left, right, top, bottom } = this.element.getBoundingClientRect();
    return {
      xScale: d3Scale.scaleLinear()
        .domain([ left, right ])
        .range([ 0, 1 ]),
      yScale: d3Scale.scaleLinear()
        .domain([ top, bottom ])
        .range([ 0, 1 ])
    };
  }

  private _clearState() {
    this.setState({
      mouseDownClientX: null,
      mouseDownClientY: null,
      lastMouseMoveClientX: null,
      lastMouseMoveClientY: null
    });
  }

  private _onMouseDown = (e: React.MouseEvent) => {
    if (e.button === LEFT_MOUSE_BUTTON) {
      this.setState({
        mouseDownClientX: e.clientX,
        mouseDownClientY: e.clientY,
        lastMouseMoveClientX: e.clientX,
        lastMouseMoveClientY: e.clientY
      });

      if (this.props.onDragStart) {
        const { xScale, yScale } = this._createPhysicalToLogicalScales();
        this.props.onDragStart(xScale(e.clientX), yScale(e.clientY), e);
      }
    }
  };

  private _maybeDispatchDragHandler(e: React.MouseEvent, handler: (xPct: number, yPct: number, e: React.MouseEvent) => void) {
    if (e.button === LEFT_MOUSE_BUTTON && handler && this.state.mouseDownClientX != null) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      handler(
        xScale(e.clientX),
        yScale(e.clientY),
        e
      );
    }
  }

  private _onMouseMove = (e: React.MouseEvent) => {
    this._maybeDispatchDragHandler(e, this.props.onDrag);

    if (this.props.onHover) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onHover(xScale(e.clientX), yScale(e.clientY), e);
    }

    this.setState({
      lastMouseMoveClientX: e.clientX,
      lastMouseMoveClientY: e.clientY
    });
  };

  private _onMouseUp = (e: React.MouseEvent) => {
    this._maybeDispatchDragHandler(e, this.props.onDragEnd);

    if (e.button === LEFT_MOUSE_BUTTON && this.props.onClick && Math.abs(this.state.mouseDownClientX - e.clientX) <= 2 && Math.abs(this.state.mouseDownClientY - e.clientY) <= 2) {
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onClick(xScale(e.clientX), yScale(e.clientY), e);
    }

    this._clearState();
  };

  private _onMouseLeave = (e: React.MouseEvent) => {
    this._maybeDispatchDragHandler(e, this.props.onDragEnd);

    if (this.props.onHover) {
      this.props.onHover(null, null, e);
    }

    this._clearState();
  };

  private _onWheel = (e: React.WheelEvent) => {
    // In Chrome, shift + wheel results in horizontal scrolling and
    // deltaY == 0 while deltaX != 0, and deltaX should be used instead
    const delta = e.shiftKey ? e.deltaY || e.deltaX : e.deltaY;
    if (this.props.onZoom && delta) {
      const zoomSpeed = typeof this.props.zoomSpeed === 'function'
        // Why doesn't the compiler accept this type guard?
        ? (this.props.zoomSpeed as any as Function)(e)
        : this.props.zoomSpeed;
      const zoomFactor = Math.exp(-delta * zoomSpeed);
      const { xScale, yScale } = this._createPhysicalToLogicalScales();
      this.props.onZoom(zoomFactor, xScale(e.clientX), yScale(e.clientY), e);
    }
  };
}
