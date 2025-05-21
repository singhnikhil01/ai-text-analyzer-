
import React from 'react';

interface ShieldCheckIconProps extends React.SVGProps<SVGSVGElement> {}

const ShieldCheckIcon: React.FC<ShieldCheckIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6" // Default size, can be overridden by props
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0018.402 6a11.959 11.959 0 01-2.258-3.036m-11.142 0c.247.082.48.175.718.275V5.25A2.25 2.25 0 0113.5 3h-3a2.25 2.25 0 00-2.25 2.25V5.25A12.038 12.038 0 015.002 2.714z" />
  </svg>
);

export default ShieldCheckIcon;