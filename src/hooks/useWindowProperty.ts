import { useState, useEffect } from 'react';

import { DESKTOP_BREAKPOINT, TAB_BREAKPOINT } from '@/constants/Constants';

// custom hook to handle window related events
type WindowPropertyProps = {
  onTabCallBack?: (width: number) => void
  onDesktopCallBack?: (width: number) => void
};
export default function useWindowProperties({
  onDesktopCallBack = () => { },
  onTabCallBack = () => { },
}: WindowPropertyProps) {
  const [baseUrl, setBaseurl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Set the base URL when the window object is available
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMounted(true)
      setBaseurl(window.location.origin);
      // Function to handle screen resize
      const handleResize = () => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        if (window.innerWidth > TAB_BREAKPOINT) {
          onDesktopCallBack(window.innerWidth);
        } else if (window.innerWidth < TAB_BREAKPOINT) {
          onTabCallBack(window.innerWidth);
        }
      };

      // Add event listener for resizing
      window.addEventListener('resize', handleResize);

      // Cleanup event listener on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    // satisfy eslint
    return undefined;
  }, [onDesktopCallBack, onTabCallBack]);

  return {
    baseUrl,
    width: screenSize.width,
    height: screenSize.height,
    isTab: screenSize.width > TAB_BREAKPOINT,
    isDesktop: screenSize.width > DESKTOP_BREAKPOINT,
    isSmallScreen: screenSize.width < TAB_BREAKPOINT,
    isMounted
  };
}
