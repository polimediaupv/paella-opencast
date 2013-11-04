PAELLA PLAYER INSTALLATION
==========================

NOTE: In the following instructions, `$MH_HOME` represents the path where the Matterhorn source has been downloaded.


PLEASE READ BEFORE INSTALLING
-----------------------------

- This bundle is only for Matterhorn 1.4.0
- In multi-machine installations, the player must be installed in the 'engage' server only.
- Paella Player requires a browser with HTML5 support and compatible with the format of the distributed videos. Please refer to your browser's documentation to see the formats it supports.
- By default, Matterhorn does NOT encode and distribute videos in a format suitable for HTML5 --specific workflow and encoding profiles are required. The Paella source package includes suitable workflow definitions and encoding profiles in the resources folder. Please note that:
    * These profiles encode the distributed videos to the H264/MP4 format, which is patent encumbered. Please be aware of the restrictions to use videos encoded in such formats.
    * FFMPEG needs to be compiled with H264/MP4 support. In multi-machine installations, this applies to every worker machine.
      - You can check the formats currently supported by your FFMPEG by running: ffmpeg -formats and ffmpeg -codecs.
      - A guide to enable FFMPEG support for several formats, including H264, can be found here: https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide
    * To install the new workflow, simply copy the `resources/etc/workflows/*` files into `$MH_HOME/etc/workflows`.
      - In multi-machine installations, this has to be done in the 'admin' server only.
    * To install the new encoding profiles, copying the `resources/etc/encoding/*` files into `$MH_HOME/etc/encoding`.
      - In multi-machine installations, this has to be done in every 'worker' machine.
    * Alternatively, you can create your custom workflow and encoding profiles for distributing video in other formats compatible with HTML5. The process is described in the Matterhorn documentation:
      http://opencast.jira.com/wiki/display/MHDOC/Release+Notes . The recommendations above also apply to any custom workflows and encoding profiles.



INSTALLATION INSTRUCTIONS
-------------------------

1. Check your Matterhorn version by running the following command

    `$ grep -m 1 '<version>' $MH_HOME/pom.xml`

2. Copy the bundle to your matterhorn installation.

    `$ cp -r $MH_VERSION/paella-engage-ui $MH_HOME/modules`

3. Go to 'paella-engage-ui' folder.

    `$ cd $MH_HOME/modules/paella-engage-ui`

4. Build the 'paella-engage-ui' bundle by running the following command:

    `$ mvn clean install -DdeployTo=$MH_HOME`

5. The Paella Player can be accessed at http://\<yourengageserverurl\>:\<yourport\>/paella/ui
