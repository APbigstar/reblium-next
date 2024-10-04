import React from 'react';
import Image from 'next/image';

import { FaCheck } from 'react-icons/fa';


const LeftPanel: React.FC = () => {
  return (
    <div className="w-1/2 bg-black text-white p-12 flex flex-col justify-center items-center relative hidden md:flex">
      <div className="absolute top-8 left-8" style={{ width: '95px' }}>
        <Image
          className="cursor-pointer"
          src="/images/white_logo.png"
          alt="logo"
          width={95}
          height={95}
          onClick={() => window.location.href = '/demo'}
        />
      </div>
      <div className="mt-24">
        <h2 className="text-4xl font-bold mb-12">CREATE YOUR ACCOUNT</h2>
        <ul className="space-y-4 text-lg">
          <li className="flex items-center">
            <FaCheck className="text-blue-starndard mr-4" />
            Generate your avatar using AI
          </li>
          <li className="flex items-center">
            <FaCheck className="text-blue-starndard mr-4" />
            Endless Personalisation
          </li>
          <li className="flex items-center">
            <FaCheck className="text-blue-starndard mr-4" />
            Connect to your own ChatGPT
          </li>
          <li className="flex items-center">
            <FaCheck className="text-blue-starndard mr-4" />
            Share with your network
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftPanel;