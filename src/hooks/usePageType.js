import { useMemo } from "react";

import { useLocation } from "react-router-dom";

export const PAGE_TYPE = Object.freeze({
  tokenblast: "tokenblast",
  howToUse: "how-to-use",
});

const usePageType = () => {
  const location = useLocation();

  const pageType = useMemo(() => {
    if (location?.pathname === "/") {
      return PAGE_TYPE.tokenblast;
    } else if (location?.pathname === "/how-to-use") {
      return PAGE_TYPE.howToUse;
    } else {
      return null;
    }
  }, [location]);

  return pageType;
};

export default usePageType;
