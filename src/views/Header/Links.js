import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import github_icon from "../../assets/github_icon.png";
import medium_icon from "../../assets/medium_icon.svg";
import tg_icon from "../../assets/tg_icon.png";
import twitter_icon from "../../assets/twitter_icon.png";
import website_icon from "../../assets/website_icon.png";
import youtube_icon from "../../assets/youtube_icon.png";

const useStyles = makeStyles(() => ({
  headerLink: {
    height: 40,
    marginLeft: 4,
    marginRight: 4,
  },
  linkImage: {
    width: 40,
    height: 40,
  },
}));

function Links() {
  const classes = useStyles();

  return (
    <>
      <a
        href="https://twitter.com/covaccrypto"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img
          src={twitter_icon}
          className={classes.linkImage}
          alt="covac twitter"
        />
      </a>
      <a
        href="https://t.me/CovacCryptoChat"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img src={tg_icon} className={classes.linkImage} alt="covac telegram" />
      </a>
      <a
        href="https://www.covac.io/"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img
          src={website_icon}
          className={classes.linkImage}
          alt="covac website"
        />
      </a>
      <a
        href="https://github.com/CovacCrypto"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img
          src={github_icon}
          className={classes.linkImage}
          alt="covac github"
        />
      </a>
      <a
        href="https://www.youtube.com/channel/UCF0n3StJRbrM1oSeaXBQ4GQ"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img
          src={youtube_icon}
          className={classes.linkImage}
          alt="covac youtube"
        />
      </a>
      <a
        href="https://covac.medium.com/"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <img
          src={medium_icon}
          className={classes.linkImage}
          alt="covac medium"
        />
      </a>
    </>
  );
}

export default Links;
