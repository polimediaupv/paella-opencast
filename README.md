Paella Player For Opencast
===========================

Paella player is now integrated into opencast.
You can find the Paella player bundled for [Opencast](https://opencast.org) in [opencast github repository](https://github.com/opencast/opencast).

![Paella Player Logo](paella_oc.png)


**NOTE**: This repository is used for testing and experimentation before integration into the official opencast repository. Not to be used for production


# References

- [Opencast webpage](https://opencast.org)
- [Opencast github repository](https://github.com/opencast/opencast)
- [Paella player webpage](https://paellaplayer.upv.es/)
- [Paella player documentation for Opencast](https://docs.opencast.org/develop/admin/#modules/paella.player7/configuration/)


# Testing 

You can test this player online in https://polimediaupv.github.io/paella-opencast/watch.html?id=ID-dual-stream-demo. You can change the video id by anyone from http://develop.opencast.org


# Local development

To test in your local environment, run:

`npm run dev -- --env server=https://stable.opencast.org` 

and navigate to http://localhost:7070/engage/ui/index.html to view the videos from the opencast server you configured or directly to [http://localhost:7070/paella7/ui/watch.html?id=\<videoid\>](http://localhost:7070/paella7/ui/watch.html?id=videoid).