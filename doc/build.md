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

Go to `opencast-modules` folder and follow the instructions.

