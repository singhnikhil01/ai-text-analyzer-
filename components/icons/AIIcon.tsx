
import React from 'react';

interface AIIconProps extends React.SVGProps<SVGSVGElement> {}

const AIIcon: React.FC<AIIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6" // Default size, can be overridden by props
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h1.5m-1.5 7.5h1.5M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 001.013 1.904l-.494 1.318a.75.75 0 001.462.548l.494-1.318A2.25 2.25 0 0012 12zm0 0a2.25 2.25 0 012.25 2.25 2.25 2.25 0 01-1.013 1.904l.494 1.318a.75.75 0 01-1.462.548l-.494-1.318A2.25 2.25 0 0112 12zm0 0V6.75m0 0A2.25 2.25 0 009.75 9h4.5A2.25 2.25 0 0012 6.75z" />
  </svg>
);

export default AIIcon;