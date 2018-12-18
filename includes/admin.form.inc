<?php

/**
 * @file
 * Handles the display/submission of the admin settings form for this module.
 */

/**
 * Defines the admin settings form.
 *
 * @param array $form
 *   The Drupal form definition.
 * @param array $form_state
 *   The Drupal form state.
 *
 * @return array
 *   The Drupal form definition.
 */
function islandora_internet_archive_bookreader_admin_settings_form(array $form, array &$form_state) {
  $get_default_value = function($name, $default) use($form_state) {
    return isset($form_state['values'][$name]) ? $form_state['values'][$name] : variable_get($name, $default);
  };
  $solr_enabled = module_exists('islandora_solr');

//NEW

  $form = array(
    'islandora_internet_archive_bookreader_imageserver' => array(
      '#type' => 'select',
      '#title' => t('Image Server'),
      '#description' => t('Select the image server to use with Internet Archive BookReader'),
      '#default_value' => variable_get('islandora_internet_archive_bookreader_imageserver', 'djatoka'),
      '#options' => array(
        'djatoka' => t('Adore-Djatoka Image Server'),
        'iiif' => t('IIIF Image Server'),
      ),
    ),
    'djatoka' => array(
      '#type' => 'fieldset',
      '#title' => t('Adore Djatoka Image Server Settings'),
      '#description' => '<p>'.t('Djatoka URL (from Paged content admin form):').' <b>'.variable_get('islandora_paged_content_djatoka_url').'</b></p>',
      '#states' => array(
        'visible' => array(
          ':input[name="islandora_internet_archive_bookreader_imageserver"]' => array('value' => 'djatoka'),
        ),
      ),
      'islandora_internet_archive_bookreader_compression' => array(
      '#type' => 'textfield',
      '#title' => t('djatoka image compression level'),
      '#description' => t('The level of compression djatoka will use when creating images (usually set at 4 or 5).'),
      '#element_validate' => array('element_validate_number'),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_compression', '4'),
      ),
      'islandora_internet_archive_bookreader_use_backup_dsid' => array(
        '#type' => 'checkbox',
        '#title' => t('Use the JPG datastream as a backup'),
        '#description' => t('Djatoka will not return JP2s smaller than 4096 bytes; by checking this, the bookreader will run a check and use the JPG datastream instead. NOTE: applying this setting can slow the bookreader down, especially for busy sites or large books. Be sure only to use this if necessary.'),
        '#default_value' => variable_get('islandora_internet_archive_bookreader_use_backup_dsid', FALSE),
      ),
    ),

    'iiif' => array(
      '#type' => 'fieldset',
      '#title' => t('IIIF Image Server Settings'),
      '#description' => t('Settings for IIIF Image Server'),
      '#states' => array(
        'visible' => array(
          ':input[name="islandora_internet_archive_bookreader_imageserver"]' => array('value' => 'iiif'),
        ),
      ),
      'islandora_internet_archive_bookreader_iiif_url' => array(
        '#prefix' => '<div id="islandora-internet-archive-bookreader-iiif-path-wrapper">',
        '#suffix' => '</div>',
        '#type' => 'textfield',
        '#title' => t('IIIF Image Server Base URL'),
        '#default_value' => variable_get('islandora_internet_archive_bookreader_iiif_url', 'iiif/2'),
        '#description' => t('The location of the IIIF Image Server.'),
      ),

      'islandora_internet_archive_bookreader_image_max_width' => array(
      '#type' => 'textfield',
      '#title' => t('IIIF image max width'),
      '#description' => t('The max width in pixel IIIF will use when creating images (usually set at 800).'),
      '#element_validate' => array('element_validate_number'),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_image_max_width', '800'),
      ),

    ),

    'tilesource' => array(
      '#type' => 'fieldset',
      '#title' => t('Internet Archive BookReader Tile Source settings'),
      '#description' => t('<p>These settings will apply to all tile sources globally.</p>'),

     'islandora_internet_archive_bookreader_tile_url_prefix' => array(
       '#type' => 'textfield',
       '#title' => t('Tile source URL prefix'),
       '#description' => t('Prefix to compose tile source URL (prefix + PID + suffix).'),
       '#default_value' => variable_get('islandora_internet_archive_bookreader_tile_url_prefix', 'http://127.0.0.1:8080/fedora/objects/'),
     ),
     'islandora_internet_archive_bookreader_tile_url_suffix' => array(
       '#type' => 'textfield',
       '#title' => t('Tile source URL suffix'),
       '#description' => t('Suffix to compose tile source URL (prefix + PID + suffix).'),
       '#default_value' => variable_get('islandora_internet_archive_bookreader_tile_url_suffix', '/datastreams/JP2/content'),
     ),

     'islandora_internet_archive_bookreader_use_token' => array(
       '#type' => 'checkbox',
       '#title' => t('Enable token'),
       '#description' => t('If enabled add auth token to tile source.'),
       '#default_value' => variable_get('islandora_internet_archive_bookreader_use_token', FALSE),
     ),
    ),

    'islandora_internet_archive_bookreader_info_views' => array(
      '#type' => 'textfield',
      '#title' => t('Views to render into Info tab'),
      '#description' => t('Machine name of Views used to fill Info tab. Left empty to use standard metadata.'),
      '#default_value' => variable_get('islandora_internet_archive_bookreader_info_views', ''),
    ),


    'islandora_internet_archive_bookreader_toc_views' => array(
      '#type' => 'textfield',
      '#title' => t('Views to render Chapters'),
      '#description' => t('Machine name of Views used to fill Chapters. Left empty to disable.'),
      '#default_value' => variable_get('islandora_internet_archive_bookreader_toc_views', ''),
    ),

    'searchopt' => array(
      '#type' => 'fieldset',
      '#title' => t('Search settings'),
      '#description' => t('<p>These settings will apply to search .</p>'),

     'islandora_internet_archive_bookreader_search_gotofirst' => array(
       '#type' => 'checkbox',
       '#title' => t('Go to first result'),
       '#description' => t('If enabled go to first search result page.'),
       '#default_value' => variable_get('islandora_internet_archive_bookreader_search_gotofirst', TRUE),
     ),
     'islandora_internet_archive_bookreader_search_popup' => array(
       '#type' => 'checkbox',
       '#title' => t('Disable popup'),
       '#description' => t('If selected disable search progress bar.'),
       '#default_value' => variable_get('islandora_internet_archive_bookreader_search_popup', FALSE),
     ),

    ),

    'islandora_internet_archive_bookreader_ocr_filter_field' => array(
      '#access' => $solr_enabled,
      '#type' => 'textfield',
      '#title' => t('Solr field relating pages to book PIDs'),
      '#description' => t("BookReader needs to know the PID of any book it's searching in, because OCR datastreams are stored in individual pages and </br>not in the book as a whole. This should therefore be set to the page-object-based Solr field that relates it to its parent book's PID."),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_ocr_filter_field', 'RELS_EXT_isMemberOf_uri_ms'),
    ),
    'islandora_internet_archive_bookreader_overlay_opacity' => array(
      '#type' => 'textfield',
      '#title' => t('Overlay Opacity'),
      '#description' => t('The opacity of the overlay, when opening the info, fulltext and share dialogs (A number between 0 (fully transparent) and 1 (fully opaque)).'),
      '#element_validate' => array('element_validate_number'),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_overlay_opacity', '0.5'),
    ),
    'islandora_internet_archive_bookreader_content_type' => array(
      '#type' => 'textfield',
      '#title' => t('The content type being displayed within the IAV.'),
      '#description' => t("This is what will be displayed in the viewer in places such as the info and share dialogs."),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_content_type', 'book'),
    ),
    'islandora_internet_archive_bookreader_default_page_view' => array(
      '#type' => 'select',
      '#title' => t('Default page view'),
      '#description' => t('The number of pages to display by default'),
      '#default_value' => $get_default_value('islandora_internet_archive_bookreader_default_page_view', 1),
      '#options' => array(
        1 => 'Single page',
        2 => 'Side by side',
        3 => 'Thumbnails',
      ),
    ),
    'islandora_internet_archive_bookreader_mobile_full_screen' => array(
      '#type' => 'checkbox',
      '#title' => t('Force the Internet Archive Bookreader into full screen for mobile users?'),
      '#default_value' => variable_get('islandora_internet_archive_bookreader_mobile_full_screen', FALSE),
    ),
  );
  return system_settings_form($form);
}
