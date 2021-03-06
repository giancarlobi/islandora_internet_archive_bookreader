# Islandora Internet Archive BookReader [![Build Status](https://travis-ci.org/giancarlobi/islandora_internet_archive_bookreader.png)](https://travis-ci.org/giancarlobi/islandora_internet_archive_bookreader)

## ==================================
## IAB v 4.2.0  | work in progress |
## ==================================
## README

## Introduction

An Islandora wrapper for the Internet Archive BookReader.

This module doesn't do much on its own, its assummed that it will be used in conjunction with a solution pack, where it will be provided as a viewer.

## Requirements

This module requires the following modules/libraries:

* [Islandora](https://github.com/islandora/islandora)
* [Tuque](https://github.com/islandora/tuque)
* [Islandora Solr Search](https://github.com/Islandora/islandora_solr_search/) (Optional ??)
* [Libraries API](https://www.drupal.org/project/libraries)
* [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
* [Islandora Solr Views](https://github.com/Islandora/islandora_solr_views) (Optional)
* [Islandora OpenSeaDragon](https://github.com/Islandora/islandora_openseadragon) (Optional)
* [Cantaloupe IIIF server](https://github.com/medusa-project/cantaloupe/releases) (Optional)


## Installation

Install as usual.... (see Drupal7 module install)

Download/clone the [Internet Archive BookReader](https://github.com/internetarchive/bookreader) to `sites/all/libraries/bookreader`, or run `drush iabookreader-plugin`.

Internet Archive BookReader [Developer documentation](https://openlibrary.org/dev/docs/bookreader)

This module requires that you set up IIIF server (Cantaloupe) OR Djatoka, please follow the steps outlined at [here](https://wiki.duraspace.org/pages/viewpage.action?pageId=34658947).

Note: If you use the Drush command, it is advisable to Move (not copy) the install script to your `.drush` folder and run it.

## Configuration

IIIF Server


![Configuration](https://user-images.githubusercontent.com/4232178/51184852-cc86d580-18d5-11e9-9361-899d816f6847.png)


OR Djatoka
Set the 'djatoka image compression level' and additional option involve behavior for using the JPG datastream as a backup in case Djatoka cannot return a JP2.


![Configuration](https://user-images.githubusercontent.com/4232178/51185417-55524100-18d7-11e9-8b8b-9b84251d2064.png)



![Configuration](https://user-images.githubusercontent.com/4232178/51185061-74040800-18d6-11e9-8966-8154f5ca221f.png)

![Configuration](https://user-images.githubusercontent.com/4232178/51185159-aa418780-18d6-11e9-8186-ffd84d8650b7.png)

![Configuration](https://user-images.githubusercontent.com/4232178/51185226-d52bdb80-18d6-11e9-88d2-f70cb898e4ab.png)


## PR starting from IAB v2 (see https://github.com/DiegoPino/islandora_internet_archive_bookreader/tree/7.x-2dev)

 step 1: fullscreen, info tab, mobile
 
 step 2.0: search is working, we need more code make-up
 
 step 2.1: less override code for search, popup for no result, ToDo: goToFirstResult and disablePopup as options in admin panel 

 step 3: fulltext
 
 step 4.0: integration with openseadragon, Page view, first draft
 
 step 4.1: Page view: viewers inline when 2-page, redraw Iabr after fullscreen OSD, some code cleanup
 
 step 4.2: Page view: makeup css colorbox window
 
 step 4.3: Page view: IIIF required, tilesource from IABR settings, some makeup
 
 step 4.4: Page view: added logic to disable zoom buttons when active, some makeup
 
 step 5.0: add chapters (TOC) from Views
 
 Step 5.1: chapter tooltip makeup postition
 
 step 6.0: SEARCH jump to the first result now works, results sorted on page number
 
 step 6.1: SEARCH makeup tooltip position and text
 
 Step 7.0: ZoomPage (aka Page view): using callback, lazyload, makeup
 
 Step 8.0: Add admin settings for Search and Toc, makeup osd loading
 
 Step 9.0: Restyling Fulltext colorbox and lazyloading
 
 Step 9.1: Custom CSS optimized and moved style from js to css file
 
 Step 9.2: Fulltext logic moved to CSS and class. Makeup mobile rendering.
 
 Step 9.3: Navbar tooltip makeup
 
 Step 9.4: Title on fullscreen, bars makeup
 
 Step 9.5: Add option to switch to fullscreen on open if URL query parameter fs=1
 
 Step 10: switch to IABR version 4


## ToDO from here********

## Documentation

Further documentation for this module is available at [our wiki](https://wiki.duraspace.org/display/ISLANDORA/Islandora+Internet+Archive+Bookreader).

## Troubleshooting/Issues

Having problems or solved a problem? Check out the Islandora google groups for a solution.

* [Islandora Group](https://groups.google.com/forum/?hl=en&fromgroups#!forum/islandora)
* [Islandora Dev Group](https://groups.google.com/forum/?hl=en&fromgroups#!forum/islandora-dev)

## Maintainers/Sponsors

Current maintainers:

* [Alan Stanley](https://github.com/ajstanley)

## Development

If you would like to contribute to this module, please check out [CONTRIBUTING.md](CONTRIBUTING.md). In addition, we have helpful [Documentation for Developers](https://github.com/Islandora/islandora/wiki#wiki-documentation-for-developers) info, as well as our [Developers](http://islandora.ca/developers) section on the [Islandora.ca](http://islandora.ca) site.

## License

[GPLv3](http://www.gnu.org/licenses/gpl-3.0.txt)
