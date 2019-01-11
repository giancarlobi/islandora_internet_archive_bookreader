# Islandora Internet Archive BookReader [![Build Status](https://travis-ci.org/Islandora/islandora_internet_archive_bookreader.png?branch=7.x)](https://travis-ci.org/Islandora/islandora_internet_archive_bookreader)

## ==================================
## IABR v 4.0.1  | work in progress |
## ==================================

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



## ==================================
## README DRAFT

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
* [??][Djatoka](http://sourceforge.net/apps/mediawiki/djatoka/index.php?title=Main_Page)
* [??][Colorbox](https://www.drupal.org/project/colorbox)
* [Islandora Solr Views](https://github.com/Islandora/islandora_solr_views) (Optional)
* [Cantaloupe IIIF server](https://github.com/medusa-project/cantaloupe/releases) (Optional)


## Installation

Install as usual, see [this](https://drupal.org/documentation/install/modules-themes/modules-7) for further information.

Download/clone the [Internet Archive BookReader](https://github.com/Islandora/internet_archive_bookreader.git) to `sites/all/libraries/bookreader`, or run `drush iabookreader-plugin`.

Internet Archive BookReader [Developer documentation](http://openlibrary.org/dev/docs/bookreader)

This module requires that you set up Djatoka, please follow the steps outlined at [here](https://wiki.duraspace.org/pages/viewpage.action?pageId=34658947).

This module requires [Colorbox](https://www.drupal.org/project/colorbox) and its dependant library [Colorbox library](http://www.jacklmoore.com/colorbox/). Depending on the version of the Colorbox module and library you are using, there can be some issues with Colorbox finding the library. [This](https://www.drupal.org/node/1074474#comment-9137159) comment solves the issue.

Note: If you use the Drush command, it is advisable to Move (not copy) the install script to your `.drush` folder and run it.

## Configuration

Set the 'djatoka image compression level', 'Solr field relating pages to book PIDs ', 'Overlay Opacity', a content type to be displayed in the IAV, and select the 'Default page view' in Administration » Islandora » Islandora Viewers » Internet Archive BookReader (/admin/islandora/islandora_viewers/internet_archive_bookreader). Additional options involve behavior for mobile users, and using the JPG datastream as a backup in case Djatoka cannot return a JP2.

![Configuration](https://cloud.githubusercontent.com/assets/10052068/24043645/fce70382-0aed-11e7-9e70-11678aa7d1df.png)

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
