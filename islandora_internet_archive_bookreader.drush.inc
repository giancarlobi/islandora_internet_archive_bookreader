<?php

/**
 * @file
 * drush integration for islandora_iabookreader.
 */

/**
 * The Internet Archive Bookreader plugin URI.
 */
define('IABOOKREADER_DOWNLOAD_URI', 'https://github.com/internetarchive/bookreader/archive/master.zip');

/**
 * The original extracted directory frome the zip file.
 */
define('IABOOKREADER_ORIGINAL_DIR', 'bookreader-master');

/**
 * Implements hook_drush_command().
 */
function islandora_internet_archive_bookreader_drush_command() {
  $items = array();
  // The key in the $items array is the name of the command.
  $items['iabookreader-plugin'] = array(
    'callback' => 'drush_islandora_internet_archive_bookreader_plugin',
    'description' => dt('Download and install the Internet Archive Bookreader plugin.'),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUSH,
    'arguments' => array(
      'path' => dt('Optional. A path where to install the Internet Archive Bookreader plugin. If omitted Drush will use the default location.'),
    ),
    'aliases' => array('iabookreaderplugin'),
  );

  return $items;
}

/**
 * Implements hook_drush_help().
 */
function islandora_internet_archive_bookreader_drush_help($section) {
  switch ($section) {
    case 'drush:iabookreader-plugin':
      return dt('Download and install the Internet Archive Bookreader plugin, default location is sites/all/libraries.');
  }
}

/**
 * Command to download the Internet Archive Bookreader plugin.
 */
function drush_islandora_internet_archive_bookreader_plugin() {
  $args = func_get_args();
  if (!empty($args[0])) {
    $path = $args[0];
  }
  else {
    $path = _drush_core_directory("@site:sites/all/libraries");
  }

  // Create the path if it does not exist.
  if (!is_dir($path)) {
    drush_op('mkdir', $path);
    drush_log(dt('Directory @path was created', array('@path' => $path)), 'notice');
  }

  // Set the directory to the download location.
  $olddir = getcwd();
  chdir($path);

  // Download the zip archive.
  if ($filepath = drush_download_file(IABOOKREADER_DOWNLOAD_URI)) {
    $filename = basename($filepath);
    $dirname = IABOOKREADER_ORIGINAL_DIR;

    // Remove any existing Internet Archive Bookreader plugin directory.
    if (is_dir($dirname) || is_dir('bookreader')) {
      drush_delete_dir($dirname, TRUE);
      drush_delete_dir('bookreader', TRUE);
      drush_log(dt('A existing Internet Archive Bookreader plugin was deleted from @path', array('@path' => $path)), 'notice');
    }

    // Decompress the zip archive.
    drush_tarball_extract($filename);

    // Change the directory name to "bookreader" if needed.
    if ($dirname != 'bookreader') {
      drush_move_dir($dirname, 'bookreader', TRUE);
      $dirname = 'bookreader';
    }
  }

  if (is_dir($dirname)) {
    drush_log(dt('Internet Archive Bookreader plugin has been installed in @path', array('@path' => $path)), 'success');
  }
  else {
    drush_log(dt('Drush was unable to install the Internet Archive Bookreader plugin to @path', array('@path' => $path)), 'error');
  }

  // Set working directory back to the previous working directory.
  chdir($olddir);
}
