Build and Install
=================

This guide will explain how to build and install Paella Player for Opencast.

Dependencies
------------

Use your package manager to install the following dependencies or download them
from their project websites.

1. [Git](https://git-scm.com/)
2. [Apache Maven](https://maven.apache.org/) ≥ 3.1.0


Build Paella Player for Opencast
--------------------------------

1. Build the paella bundle by running

    `mvn clean install`

2. Copy the paella bundle (file
	`$PAELLA_SOURCE/target/paella-engage-ui-{version}.jar`) to your Opencast
	installations deploy folder at

	 `$OPENCAST_HOME/deploy`

3. Paella uses the `/paella/ui` URL path. To enable non-admin access to this URL, you need to
	allow the access in your security configuration
	(`${$OPENCAST_HOME}/etc/security/mh_default_org.xml`) by adding these lines:

    ```
    <sec:intercept-url pattern="/paella/ui/auth.html" access="ROLE_USER" />
    <sec:intercept-url pattern="/paella/ui/**" access="ROLE_ANONYMOUS" />
    ```

4. The Paella Player can now be accessed at `http://<yourengageserverurl>:<yourport>/paella/ui`


Configuring Paella As Default Player
------------------------------------

Change the `prop.player` property to `/paella/ui/watch.html` in
`${$OPENCAST_HOME}/etc/load/org.opencastproject.organization-${YOUR_ORGANIZATION}.cfg`

    prop.player=/paella/ui/watch.html
