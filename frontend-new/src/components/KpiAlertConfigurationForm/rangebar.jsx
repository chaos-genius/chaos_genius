import React from 'react';
import { Range, getTrackBackground } from 'react-range';

const STEP = 0.1;
const MIN = 0;
const MAX = 100;

class App extends React.Component {
  state = {
    values: [50]
  };
  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
        <Range
          values={this.state.values}
          step={STEP}
          min={MIN}
          max={MAX}
          onChange={(values) => this.setState({ values })}
          renderTrack={({ props, children }) => (
            <div
              onMouseDown={props.onMouseDown}
              onTouchStart={props.onTouchStart}
              style={{
                ...props.style,
                height: '36px',
                display: 'flex',
                width: '100%'
              }}>
              <div
                ref={props.ref}
                style={{
                  height: '5px',
                  width: '100%',
                  borderRadius: '4px',
                  background: getTrackBackground({
                    values: this.state.values,
                    colors: ['red', '#ccc'],
                    min: MIN,
                    max: MAX
                  }),
                  alignSelf: 'center'
                }}>
                {children}
              </div>
            </div>
          )}
          renderThumb={({ props, isDragged }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '18px',
                width: '18px',
                borderRadius: '50%',
                outline: 'none',
                background: '#FFFFFF',
                border: '2px solid #60CA9A',
                boxSizing: 'border-box',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}></div>
          )}
        />
      </div>
    );
  }
}
export default App;
