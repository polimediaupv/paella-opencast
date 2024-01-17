> [!IMPORTANT]
> This repository is **NOT** the official paella player for opencast

Paella Player For Opencast
===========================
Paella player is now integrated into opencast.
If you are looking for paella player for [Opencast](https://opencast.org), you should go to the official [opencast repository](https://github.com/opencast/opencast). 
Link to Paella player 7 [opencast module](https://github.com/opencast/opencast/tree/develop/modules/engage-paella-player-7).

Any issue or pull request should be sent to [opencast repository](https://github.com/opencast/opencast).

![Paella Player Logo](paella_oc.png)


> [!CAUTION]
> This repository is used for testing and experimentation before integration into the official opencast repository.
> 
> Not to be used for production



# References

- [Opencast webpage](https://opencast.org)
- [Opencast github repository](https://github.com/opencast/opencast)
- [Paella player webpage](https://paellaplayer.upv.es/)
- [Paella player documentation for Opencast](https://docs.opencast.org/develop/admin/#configuration/player/paella.player7/configuration/)



# Testing 

You can test this player online in https://polimediaupv.github.io/paella-opencast/watch.html?id=ID-dual-stream-demo. You can change the video id by anyone from http://develop.opencast.org

You can test themes using the `oc.theme` URL parameter: https://polimediaupv.github.io/paella-opencast/watch.html?id=ID-dual-stream-demo&oc.theme=ethz_theme.


# Local development

To test in your local environment, run:

`npm run dev -- --env server=https://stable.opencast.org` 

and navigate to http://localhost:7070/engage/ui/index.html to view the videos from the opencast server you configured or directly to [http://localhost:7070/paella7/ui/watch.html?id=\<videoid\>](http://localhost:7070/paella7/ui/watch.html?id=videoid).
