import * as React from 'react';

const interval = React.PropTypes.shape({
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired
});

const ticks =  React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.number,
  React.PropTypes.arrayOf(React.PropTypes.number)
]);

const tickFormat = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.string
]);

export default {
  interval,
  ticks,
  tickFormat
};
