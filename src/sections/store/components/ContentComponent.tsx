import React from 'react';
import { useRouter } from 'next/navigation';

interface Avatar {
  name: string;
  url: string;
}

interface ContentComponentProps {
  title: string;
  description: string;
  AvatarList: Avatar[];
  exploreUrl: string;
  buttonText: string;
}

const ContentComponent: React.FC<ContentComponentProps> = ({ title, description, AvatarList, exploreUrl, buttonText }) => {
  const router = useRouter();

  const handleExplore = () => {
    router.push(exploreUrl);
  };

  return (
    <div className="flex flex-col justify-around items-start h-full w-full">
      <div className="flex flex-col justify-around items-start gap-8 h-1/2 w-[40%]">
        <div className="flex flex-col justify-start items-start gap-2">
          <h1 className="text-4xl font-bold">{title}</h1>
          <div 
            className="text-lg text-gray-300"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <button 
          className="flex items-center justify-center px-4 py-2 rounded-full transition-colors duration-200 text-gray-300 hover:bg-gray-600 border-white border-2 w-[35%]"
          onClick={handleExplore}
        >
          <span>{buttonText}</span>
        </button>
      </div>
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        {AvatarList.map((avatar, index) => (
          <img key={index} className="w-[357px] h-[245px]" src={avatar.url} alt={avatar.name} />
        ))}
      </div>
    </div>
  );
};

export default ContentComponent;