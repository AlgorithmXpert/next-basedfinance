import React, { useContext } from 'react';
import styled, {createGlobalStyle, keyframes} from 'styled-components';

interface BackgroundImageProps {
  children?: React.ReactNode;
  url: string;
  firstPartColor?: string;
  secondPartColor?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ children,
                                                           url,
                                                             firstPartColor = 'rgba(23, 27, 40, 0.9)',
                                                             secondPartColor= 'rgba(23, 27, 40, 0.6)'}) => {
  return <StyledBackgroundImage url={url} firstPartColor={firstPartColor} secondPartColor={secondPartColor}>
  </StyledBackgroundImage>;
};

interface StyledBackgroundImageProps {
  url?: string;
  firstPartColor?: string;
  secondPartColor?: string;
}

const fadeIn = keyframes`
  0% {
    opacity: 0.1;
  }
  100% {
    opacity: 1;
  }
`

const StyledBackgroundImage = createGlobalStyle<StyledBackgroundImageProps>`
  body {
    background: no-repeat  linear-gradient(to bottom,
     ${(props) => props.firstPartColor},
      ${(props) => props.secondPartColor} ),
       url(${(props) => props.url} ) !important;
    background-size: cover !important;  
    background-attachment: fixed !important;
    }
`;

export default BackgroundImage;
