Build and Install
=================

This guide will explain how to build and install Paella Player for Opencast.

**Note:** This bundle is only tested in Opencast 6.x

Dependencies
------------

Use your package manager to install the following dependencies or download them
from their project websites.

1. [Git](https://git-scm.com/)
2. [Apache Maven](https://maven.apache.org/) ≥ 3.1.0
3. [Opencast source]((https://github.com/opencast/opencast)) = 6.x


Preparing the build
-------------------

You would need to download the opencast(opencast/opencast) source code and the paella-opencast
```
/usr/src
|
|- opencast
|- paella-opencast
```

1. Download the opencast source code (same version you have installed)

    `git clone https://github.com/opencast/opencast.git --branch $OPENCAST_VERSION /usr/src/opencast`

2. Download the paella-opencast source code 

    `git clone https://github.com/polimediaupv/paella-opencast.git --branch 6.2.x /usr/src/paella-opencast`


Build Paella Player for Opencast
--------------------------------

1. Build the opencast source (in `/user/src/opencast`)
   
    `mvn --quiet --batch-mode install -DskipTests=true -Dcheckstyle.skip=true -DskipJasmineTests=true -Pnone`
    
2. Build the paella bundle by running (in `/user/src/paella-opencast`)

    `mvn clean install`

If you don't want to compile the bundle yourself, you can download the compiled bundle from [github releases](https://github.com/polimediaupv/paella-opencast/releases).
Download the bundle for your opencast version (`opencast-engage-paella-player-${OPENCAST_VERSION}.jar`).


Substitute the opencast paella bundle
-------------------------------------

1. Copy the paella bundle (file 
	`$PAELLA_SOURCE/target/opencast-engage-paella-player-${OPENCAST_VERSION}.jar`) to your Opencast
	installations `system` folder

	 `cp /usr/src/paella-opencast/target/opencast-engage-paella-player-${${OPENCAST_VERSION}}.jar ${OPENCAST_HOME}/system/org/opencastproject/opencast-engage-paella-player/${${OPENCAST_VERSION}}/opencast-engage-paella-player-${${OPENCAST_VERSION}}.jar`
	 
	 
2. You will need to update the paella config file from `etc/paella/mh_default_org`

