/**
 * @file
 * Defines initializing/attaching the Book Reader to the
 * defined element.
 */


(function ($) {
  Drupal.behaviors.islandoraInternetArchiveBookReader = {
    attach: function(context, settings) {
      $('.islandora-internet-archive-bookreader', context).once('islandora-bookreader', function () {

	//§§ Set options
	var options = {

		getPageWidth: function(index) {
			if (index >= 0) {
				return parseInt(settings.islandoraInternetArchiveBookReader.pages[index].width);
			}
			else {
				return null;
			}
		},

  		getPageHeight: function(index) {
  			if (index >= 0) {
				return parseInt(settings.islandoraInternetArchiveBookReader.pages[index].height);
			}
			else {
				return null;
			}
		},

		getPageNum: function(index) {
    			return index + 1;
		},

  		leafNumToIndex: function(leafNum) {
  			return leafNum - 1;
		},


  		getPageURI: function(index, reduce, rotate) {
		    	if (typeof settings.islandoraInternetArchiveBookReader.pages[index] != 'undefined') {
		      		if ((settings.islandoraInternetArchiveBookReader.imageServer == 'djatoka') && (settings.islandoraInternetArchiveBookReader.useBackupUri == true)) {
					var callback_uri = null;
					$.ajax({
					  url: settings.islandoraInternetArchiveBookReader.tokenUri.replace('PID', settings.islandoraInternetArchiveBookReader.pages[index].pid),
					  async: false,
					  success: function(data, textStatus, jqXHR) {
					    callback_uri = data;
					  }
					});
					if (callback_uri.indexOf("datastream/JP2/view") != -1) {
			  			return this.getImageserverUri(callback_uri, reduce, rotate);
					}
					return callback_uri;
		      		}
		      		else {
					return this.getImageserverUri(settings.islandoraInternetArchiveBookReader.pages[index].uri, reduce, rotate);
		      		}
		    	}
  		},

		ui: 'full', // full, embed, responsive
		showLogo: false,
		bookTitle: settings.islandoraInternetArchiveBookReader.label.substring(0,97) + '...',
  		bookUrl: document.location.toString(),
		imagesBaseURL: settings.islandoraInternetArchiveBookReader.imagesFolderUri,
		el: '#BookReader',
		pageProgression: settings.islandoraInternetArchiveBookReader.pageProgression,
		//§§ToDO: also page i.e. "page/1/mode/2"
		defaults: "mode/" + settings.islandoraInternetArchiveBookReader.mode,
	};

	//§§ Extend options
	jQuery.extend(true, BookReader.defaultOptions, {
	    	IslandoraInfoDIV: settings.islandoraInternetArchiveBookReader.info,
		numLeafs: settings.islandoraInternetArchiveBookReader.pageCount,
		imageServer: settings.islandoraInternetArchiveBookReader.imageServer,
		iiifUri: settings.islandoraInternetArchiveBookReader.iiifUri,
		image_max_width: settings.islandoraInternetArchiveBookReader.image_max_width,
		djatokaUri: settings.islandoraInternetArchiveBookReader.djatokaUri,
		compression: settings.islandoraInternetArchiveBookReader.compression,
		searchUri: settings.islandoraInternetArchiveBookReader.searchUri,
	});
	BookReader.prototype.setup = (function (super_) {
    		return function (options) {
        		super_.call(this, options);
			this.IslandoraInfoDIV = options.IslandoraInfoDIV;
			this.numLeafs = options.numLeafs;
			this.imageServer = options.imageServer;
			this.iiifUri = options.iiifUri;
			this.image_max_width = options.image_max_width;
			this.djatokaUri = options.djatokaUri;
			this.compression = options.compression;
			this.fullscreen = false;
			this.searchUri = options.searchUri;
    		};
	})(BookReader.prototype.setup);

	//§§ Initialize and Render the BookReader.
        var bookReader = new BookReader(options);
        bookReader.init();

      	// to avoid overflow icon on the bottom right side
      	$('div#BRpage').css({
        	'width': '300'
      	});

	// If mobile device and mobilize the force fullscreen and mode 1
        if ($.browser.mobile && settings.islandoraInternetArchiveBookReader.mobilize) {
        	if ($.browser.mobile) {
          		bookReader.goFullScreen();
	  		bookReader.switchMode(1);
		}
        }
      });
    }
  };
})(jQuery);

  /**
   * Gets the IIIF/Djatoka URI.
   *
   * @param string resource_uri
   *   The uri to the image IIIF/Djatoka will use.
   *
   * @return string
   *   The IIIF/Djatoka URI for the given resource URI.
   */
BookReader.prototype.getImageserverUri = function(resource_uri, reduce, rotate) {

        if (this.imageServer == 'iiif') {
           var base_uri = this.iiifUri;
           if (base_uri.charAt(base_uri.length) != '/') {
                base_uri += '/';
           }
           // image_max_width > 0 => fixed width / thumb = 1/2
	   // image_max_width = 0 => automatic variable width depends on reduce parameter
           if (this.image_max_width > 0) {
                if (this.mode == 3) {
                        var tile_width = Math.ceil(this.image_max_width/2);
                }else {
                        var tile_width = Math.ceil(this.image_max_width);
                }
                var params = '/full/' + tile_width + ',/0/default.jpg';
           }
           else {
                var params = '/full/pct:' + (1.0 / reduce * 100).toFixed(0) + '/0/default.jpg';
           }
           return (base_uri + encodeURIComponent(resource_uri) + params);
        }
        else {
                var base_uri = this.djatokaUri;
                //Do some sanitation on that base uri.
                //Since it comes from an admin form, let's make sure there's a '/' at the
                //end of it.
                if (base_uri.charAt(base_uri.length) != '/') {
                        base_uri += '/';
                }
                var params = $.param({
                  'rft_id': resource_uri,
                  'url_ver': 'Z39.88-2004',
                  'svc_id': 'info:lanl-repo/svc/getRegion',
                  'svc_val_fmt': 'info:ofi/fmt:kev:mtx:jpeg2000',
                  'svc.format': 'image/jpeg',
                  'svc.level': this.compression,
                  'svc.rotate': 0
                });
                return (base_uri + 'resolver?' + params);
        }
};

// override buildInfoDiv
BookReader.prototype.buildInfoDiv = function(jInfoDiv) {
      	jInfoDiv.find('.BRfloatBody, .BRfloatCover, .BRfloatFoot').remove();
	jInfoDiv.append(this.IslandoraInfoDIV);
}

// Extend buildToolbarElement: add fullscreen button
// 
BookReader.prototype.buildToolbarElement = (function (super_) {
    	return function () {
        	var $el = super_.call(this);
          	var readIcon = '';
          	$el.find('.BRtoolbarRight').append("<span class='BRtoolbarSection BRtoolbarSectionFullscreen tc ph20 first'>"
	  		+ "<button class='BRicon full'></button>"
          		+ "</span>");
        	return $el;
    	};
})(BookReader.prototype.buildToolbarElement);

// Extend initToolbar: add fullscreen button click code
//
BookReader.prototype.initToolbar = (function (super_) {
    	return function (mode, ui) {
        	super_.apply(this, arguments);
		if (ui == 'embed') {
            		return;
        	}
		var self = this;
		this.refs.$BRtoolbar.find('.full').bind('click', function() {
    	   		self.fullscreen = (self.fullscreen ? false : true);
		    	if(self.fullscreen) {
		      		self.refs.$br.css({
					'position': 'fixed',
					'width': '100%',
					'height': '100%',
					'left': '0',
					'top': '0',
					'z-index': '700',
					'height': '100%'
		      		});
		  	}
		    	else {
		      		self.refs.$br.css({
					'position': 'relative',
					'z-index': '0',
					'height': ''
		      		});
			}
			self.resize();
  		});
   	};
})(BookReader.prototype.initToolbar);

/**
* Go Fullscreen regardless of current state.
*/
BookReader.prototype.goFullScreen = function() {
    	this.fullscreen = true;
      	this.refs.$br.css({
		'position': 'fixed',
		'width': '100%',
		'height': '100%',
		'left': '0',
		'top': '0',
		'margin': '0',
		'padding': '0',
		'z-index': '1',
		'height': '100%',
      	});
      	this.resize();
}

// override search
//
BookReader.prototype.search = function(term, options) {

//§
    br = this;

    options = options !== undefined ? options : {};
    var defaultOptions = {

//§ ToDo: goToFirstResult and disablePopup as options in admin panel

        // {bool} (default=false) goToFirstResult - jump to the first result
        goToFirstResult: true,
        // {bool} (default=false) disablePopup - don't show the modal progress
        disablePopup: false,
        error: br.BRSearchCallbackErrorDesktop,
        success: br.BRSearchCallback,
    };
    options = jQuery.extend({}, defaultOptions, options);

    $('.textSrch').blur(); //cause mobile safari to hide the keyboard

    this.removeSearchResults();

//§ No search/term in the url
/**    this.searchTerm = term;
    this.searchTerm = this.searchTerm.replace(/\//g, ' '); // strip slashes, since this goes in the url
    if (this.enableUrlPlugin) this.updateLocationHash(true);
**/

    // Add quotes to the term. This is to compenstate for the backends default OR query
    term = term.replace(/['"]+/g, '');
    term = '"' + term + '"';

//§ Islandora url callback
    var url = this.searchUri.replace('TERM', encodeURI(term));
/**    // Remove the port and userdir
    var url = 'https://' + this.server.replace(/:.+/, '') + this.searchInsideUrl + '?';


    // Remove subPrefix from end of path
    var path = this.bookPath;
    var subPrefixWithSlash = '/' + this.subPrefix;
    if (this.bookPath.length - this.bookPath.lastIndexOf(subPrefixWithSlash) == subPrefixWithSlash.length) {
      path = this.bookPath.substr(0, this.bookPath.length - subPrefixWithSlash.length);
    }

    var urlParams = {
      'item_id': this.bookId,
      'doc': this.subPrefix,
      'path': path,
      'q': term,
    };

    var paramStr = $.param(urlParams);

    // NOTE that the API does not expect / (slashes) to be encoded. (%2F) won't work
    paramStr = paramStr.replace(/%2F/g, '/');

    url += paramStr;
**/

    if (!options.disablePopup) {
        this.showProgressPopup('<img id="searchmarker" src="'+this.imagesBaseURL + 'marker_srch-on.png'+'"> Search results will appear below...');
    }

//§ Modified ajax call
    $.ajax({
    	url:url, 
	dataType:'json',
        success: function(data) {
            if (data.error || 0 == data.matches.length) {
                br.BRSearchCallbackErrorDesktop(data);
            } else {
                br.BRSearchCallback(data, options);
            }
        },
        error: function() {
              br.BRSearchCallbackErrorDesktop(data);
        }
    });
/**
    $.ajax({
        url:url,
        dataType:'jsonp',
        success: function(data) {
            if (data.error || 0 == data.matches.length) {
                options.error.call(br, data, options);
            } else {
                options.success.call(br, data, options);
            }
        },
    });
**/
};



