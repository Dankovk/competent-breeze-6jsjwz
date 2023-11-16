import React from 'react';

export default ({
                    width = '23',
                    height = '21',
                    onClick,
                    id
                }: any) => (
    <svg width={width} height={height} viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg"
         onClick={onClick}>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M11.5 6.59375C8.76738 6.59375 6.55212 8.80901 6.55212 11.5417C6.55212 14.2743 8.76738 16.4896 11.5 16.4896C14.2327 16.4896 16.448 14.2743 16.448 11.5417C16.448 8.80901 14.2327 6.59375 11.5 6.59375ZM8.11462 11.5417C8.11462 9.67195 9.63033 8.15625 11.5 8.15625C13.3698 8.15625 14.8855 9.67195 14.8855 11.5417C14.8855 13.4114 13.3698 14.9271 11.5 14.9271C9.63033 14.9271 8.11462 13.4114 8.11462 11.5417Z"
              fill="url(#paint0_linear_25068_1302)"/>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M9.49001 0.34375C8.53223 0.34375 7.63781 0.822425 7.10653 1.61935L6.26014 2.88893C6.01865 3.25117 5.6121 3.46875 5.17674 3.46875H4.20837C2.05101 3.46875 0.302124 5.21764 0.302124 7.375V16.75C0.302124 18.9074 2.05101 20.6562 4.20837 20.6562H18.7917C20.9491 20.6562 22.698 18.9074 22.698 16.75V7.375C22.698 5.21764 20.9491 3.46875 18.7917 3.46875H17.8233C17.388 3.46875 16.9814 3.25117 16.7399 2.88893L15.8936 1.61935C15.3623 0.822425 14.4679 0.34375 13.5101 0.34375H9.49001ZM8.40661 2.48607C8.6481 2.12383 9.05465 1.90625 9.49001 1.90625H13.5101C13.9454 1.90625 14.352 2.12383 14.5935 2.48607L15.4399 3.75565C15.9711 4.55258 16.8656 5.03125 17.8233 5.03125H18.7917C20.0861 5.03125 21.1355 6.08058 21.1355 7.375V16.75C21.1355 18.0444 20.0861 19.0938 18.7917 19.0938H4.20837C2.91396 19.0938 1.86462 18.0444 1.86462 16.75V7.375C1.86462 6.08058 2.91396 5.03125 4.20837 5.03125H5.17674C6.13452 5.03125 7.02894 4.55257 7.56022 3.75565L8.40661 2.48607Z"
              fill="url(#paint1_linear_25068_1302)"/>
        <defs>
            <linearGradient id="paint0_linear_25068_1302" x1="11.5" y1="0.34375" x2="11.5" y2="20.6562"
                            gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE8F4"/>
                <stop offset="0.5" stopColor="#FDADFF"/>
                <stop offset="0.5" stopColor="#FDADFF"/>
                <stop offset="0.5001" stopColor="#FDADFF"/>
                <stop offset="1" stopColor="#8DDBFF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_25068_1302" x1="11.5" y1="0.34375" x2="11.5" y2="20.6562"
                            gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE8F4"/>
                <stop offset="0.5" stopColor="#FDADFF"/>
                <stop offset="0.5" stopColor="#FDADFF"/>
                <stop offset="0.5001" stopColor="#FDADFF"/>
                <stop offset="1" stopColor="#8DDBFF"/>
            </linearGradient>
        </defs>
    </svg>
);
