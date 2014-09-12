Building-Blocks
===============

Reusable components for Firefox OS.

[![Bower version](https://badge.fury.io/bo/building-blocks.svg)](http://badge.fury.io/bo/building-blocks)

The main folder in this repo "style" is fetched from [Gaia](https://github.com/mozilla-b2g/gaia) once a day.
The code you will find here could be useful to anyone interested in creating a Firefox OS application and use the look and feel of core applications in the OS, without having to clone the complete Gaia repo.

You can find more information on how to use Building Blocks in [buildingfirefoxos.com](http://www.buildingfirefoxos.com).
All examples showed there are also available inside "style" forlder, but in a more friendly manner.


Cross browser support
-----------------------
Include `cross_browser.css` if you want your webapp can run on any modern browser.
Please test your app in your target browsers, as "style" folder is pulled automatically from the original source, if some styles changes before we have the change to update this file, we cannot guarantee it will always work as expected.


Install
----------

1. You can git clone the code from github `https://github.com/buildingfirefoxos/Building-Blocks.git`

2. Or if you have bower installed ([http://bower.io/](http://bower.io/)), run command: `$ bower install building-blocks#gh-pages`


Contact a human
------------------

This repo is maintained by [@rnowm](https://github.com/rnowm). Feel free to add your suggestions in issues section.

In case you want to discuss why Firefox OS Building Blocks are coded like that and propose improvements, you should write to [Gaia's mailing list](mailto:dev-gaia@lists.mozilla.org). 
