import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Github from "../../components/Svgs/Github";
import Medium from "../../components/Svgs/Medium";
import Telegram from "../../components/Svgs/Telegram";
import Twitter from "../../components/Svgs/Twitter";
import Website from "../../components/Svgs/Website";
import Youtube from "../../components/Svgs/Youtube";

const useStyles = makeStyles(() => ({
  headerLink: {
    height: 40,
    marginLeft: 4,
    marginRight: 4,
  },
  linkImage: {
    color: "#fff",
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
        <Twitter className={classes.linkImage} />
      </a>
      <a
        href="https://t.me/CovacCryptoChat"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <Telegram className={classes.linkImage} />
      </a>
      <a
        href="https://www.covac.io/"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <Website className={classes.linkImage} />
      </a>
      <a
        href="https://github.com/CovacCrypto"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <Github className={classes.linkImage} />
      </a>
      <a
        href="https://www.youtube.com/channel/UCF0n3StJRbrM1oSeaXBQ4GQ"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <Youtube className={classes.linkImage} />
      </a>
      <a
        href="https://covac.medium.com/"
        target="_blank"
        rel="noreferrer"
        className={classes.headerLink}
      >
        <Medium className={classes.linkImage} />
      </a>
    </>
  );
}

export default Links;
