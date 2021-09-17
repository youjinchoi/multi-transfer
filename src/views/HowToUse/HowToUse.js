import React, { useState } from "react";

import {
  CircularProgress,
  Box,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import YouTube from "react-youtube";

const useStyles = makeStyles(() => ({
  howToUse: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  loading: {
    color: "#fff",
    position: "absolute",
    top: 250,
    zIndex: -1,
  },
  youtube: {
    maxWidth: "100%",
  },
  youtubeMobile: {
    width: 375,
    height: 211,
  },
}));

const opts = {
  height: 360,
  width: 640,
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

function HowToUse() {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 375px)");

  const onReady = () => setIsLoading(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      my={5}
      position="relative"
    >
      <Box my={3}>
        <Typography variant="h4" className={classes.howToUse}>
          How to use <strong>TokenBlast</strong>
        </Typography>
      </Box>
      {isLoading && <CircularProgress size={36} className={classes.loading} />}
      <YouTube
        videoId="TBrurrQTxuQ"
        opts={opts}
        onReady={onReady}
        className={clsx(classes.youtube, { [classes.youtubeMobile]: isMobile })}
      />
    </Box>
  );
}

export default HowToUse;
