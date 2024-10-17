import React, { useState } from 'react';

interface FoundationSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const FoundationSubmenu: React.FC<FoundationSubmenuProps> = ({ handleSendCommands }) => {
  const [base, setBase] = useState(0);
  const [concealer, setConcealer] = useState(0);
  const [contour, setContour] = useState(0);
  const [highlight, setHighlight] = useState(0);

  const randomizeFoundation = () => {
    const randomBase = Math.random();
    const randomConcealer = Math.random();
    const randomContour = Math.random();
    const randomHighlight = Math.random();

    setBase(randomBase);
    setConcealer(randomConcealer);
    setContour(randomContour);
    setHighlight(randomHighlight);

    handleSendCommands({ scalarname: `M_Switch_Foundation*${randomBase}` });
    handleSendCommands({ scalarname: `M_Switch_Concealer*${randomConcealer}` });
    handleSendCommands({ scalarname: `M_Switch_Contour*${randomContour}` });
    handleSendCommands({ scalarname: `M_Switch_Highlight*${randomHighlight}` });
  };

  const sliderProps = [
    { label: 'Base', value: base, setValue: setBase, command: 'M_Switch_Foundation' },
    { label: 'Concealer', value: concealer, setValue: setConcealer, command: 'M_Switch_Concealer' },
    { label: 'Contour', value: contour, setValue: setContour, command: 'M_Switch_Contour' },
    { label: 'Highlight', value: highlight, setValue: setHighlight, command: 'M_Switch_Highlight' },
  ];

  return (
    <div className="content-container">
      <button onClick={randomizeFoundation} style={{ width: '70%' }}>Randomize Foundation</button>
      {sliderProps.map(({ label, value, setValue, command }) => (
        <div key={label} className="slider-container">
          <div className="slider-label-container">
            <span className="slider-label">{label}</span>
            <span className="slider-value">{value.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={value}
            className="slider"
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              setValue(newValue);
              handleSendCommands({ scalarname: `${command}*${newValue}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FoundationSubmenu;