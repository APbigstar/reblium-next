import React, { ChangeEvent } from 'react';
import { IconType } from 'react-icons';

interface IconInputProps {
  type: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: IconType;
}

const IconInput: React.FC<IconInputProps> = ({ type, id, value, onChange, placeholder, icon: Icon }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-1">
        <Icon className="text-gray-500" size={20} />
      </div>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
        required
        autoComplete={type}
      />
    </div>
  );
};

export default IconInput;