# Build and Install

In this section we are going to explain how to build and install Paella Player for Opencast.

## Dependencies

We need to install some dependencies:

1. [Git](https://git-scm.com/)
2. [Apache Maven](https://maven.apache.org/) ≥ 3.1.0

Use your package manager to do that or download the software from their project websites.


## Build Paella Player for Opencast

1. Check your Opencast version by running the following command

    `$ grep -m 1 '<version>' $OPENCAST_HOME/pom.xml`    

Note that if you installed opencast using the RPM package madules `$OPENCAST_HOME` will be `/usr/share/opencast`.
If you installed opencast using the source code, `$OPENCAST_HOME` will be the folder where you downloaded the source code.

2. Edit the pom.xml file and change the `<opencast.version>`property to match your Opencast version.

    `<opencast.version>2.0.0</opencast.version>`

3. Build the paella bundle

    `mvn clean install`

4. Copy the paella bundle (file `$PAELLA_SOURCE/target/paella-engage-ui-{version}.jar`) to your opencast installation

    - For opencast 2.0 copy the bundle to: `$OPENCAST_HOME/lib/matterhorn`

    - For opencast 2.1 or 2.2 copy the bundle to: `$OPENCAST_HOME/deploy`

5. By default paella is installed in /paella/ui URL in your server. You need to enable address to that URL. Edit the `${$OPENCAST_HOME}/etc/security/mh_default_org.xml` file and add this line:

    ```
    <sec:intercept-url pattern="/paella/ui/auth.html" access="ROLE_USER" />
    <sec:intercept-url pattern="/paella/ui/**" access="ROLE_ANONYMOUS" />
    ```

6. The Paella Player can be accessed at http://\<yourengageserverurl\>:\<yourport\>/paella/ui

## Configuring Paella as the default video player for your tenant

1. Edit the `${$OPENCAST_HOME}/etc/load/org.opencastproject.organization-${YOUR_ORGANIZATION}.cfg`

	`vim ${$OPENCAST_HOME}/etc/load/org.opencastproject.organization-mh_default_org.cfg`

2. Change the `prop.player` property to `/paella/ui/watch.html`

    `prop.player=/paella/ui/watch.html`

