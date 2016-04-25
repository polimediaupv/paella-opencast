# Build and Install

In this section we are going to explain how to build and install Paella Player for Opencast.

## Dependencies

Paella Player uses [Grunt](http://gruntjs.com/) as a task runner. So we need to install some dependencies:

1. [Node Js](http://nodejs.org/)
2. [Grunt Js](http://gruntjs.com/)
3. [Js Hint](http://www.jshint.com/)

First we are goint to install [Node Js](http://nodejs.org/) in our system. To do so, go to [http://nodejs.org/](http://nodejs.org/) and download and install nodejs.
Now we have the node and npm command installed.

Now, we are going to install the other dependencies. To do so open a terminal and run the next command:

	$ npm -g install grunt-cli jshint
	
If you are in a OSX/Linux machine, run that command with sudo:

	$ sudo npm -g install grunt-cli jshint


Finally, we need to install the grunt modules needed by Paella. Open the terminal and go to the folder you have downloaded paella player.
Now, run the next command:

	$ npm install

Congratulations, you have all the dependencies installed.	


## Build Paella Player for Opencast

1. Check your Opencast version by running the following command

    `$ grep -m 1 '<version>' $OPENCAST_HOME/pom.xml`

2. Edit the pom.xml file and change the `<opencast.version>`property to match your Opencast version.

    `<opencast.version>2.0.0</opencast.version>`

3. Copy the paella-engage-ui module to your Opencast installation

4. By default paella is installed in /paella/ui URL in your server. You need to enable address to that URL. Edit the `${$OPENCAST_HOME}/etc/security/mh_default_org.xml` file and add this line:

    ```
    <sec:intercept-url pattern="/paella3.1/ui/auth.html" access="ROLE_USER" />
    <sec:intercept-url pattern="/paella3.1/ui/**" access="ROLE_ANONYMOUS" />
    ```
    
5. The Paella Player can be accessed at http://\<yourengageserverurl\>:\<yourport\>/paella/ui

## Configuring Paella as the default video player for your tenant

1. Edit the `${$OPENCAST_HOME}/etc/load/org.opencastproject.organization-${YOUR_ORGANIZATION}.cfg`

	`vim ${$OPENCAST_HOME}/etc/load/org.opencastproject.organization-mh_default_org.cfg`

2. Change the `prop.player` property to `/paella/ui/watch.html`

    `prop.player=/paella/ui/watch.html`
 
