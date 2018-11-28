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
BookReader.prototype.search = function(term, options) {
    options = options !== undefined ? options : {};
    var that = this;
	var defaultOptions = {
        // {bool} (default=false) goToFirstResult - jump to the first result
        goToFirstResult: true,
        // {bool} (default=false) disablePopup - don't show the modal progress
        disablePopup: false,
        error: that.BRSearchCallbackErrorDesktop,
        success: that.BRSearchCallback,
      };
    var url = this.searchUri.replace('TERM', encodeURI(term));
    term = term.replace(/\//g, ' '); // strip slashes, since this goes in the url
    this.searchTerm = term;
    this.removeSearchResults();
	this.updateLocationHash(true);
    this.showProgressPopup('<img id="searchmarker" src="'+ this.imagesBaseURL + 'marker_srch-on.png'+'">' + Drupal.t('Search results will appear below ...') + '</img>');
   
    $.ajax({url:url, dataType:'json',
            success: function(data, status, xhr) {
              that.BRSearchCallback(data);
            },
            error: function() {
              alert("Search call to " + url + " failed");
            }
           });
}



/**
// override BRSearchCallback (previous v2)
BookReader.prototype.BRSearchCallback = function(results, options) {
    this.removeSearchResults();
    this.searchResults = results;
    if (0 == results.matches.length) {
      var errStr  = Drupal.t('No matches were found.');
      var timeout = 1000;
      if (false === results.indexed) {
        errStr  = "<p>" + Drupal.t("This @content_type hasn't been indexed for searching yet. We've just started indexing it, so search should be available soon. Please try again later. Thanks!", {'@content_type': this.content_type}) + "</p>";
        timeout = 5000;
      }
      $(this.popup).html(errStr);
      var that = this;
      setTimeout(function(){
        $(that.popup).fadeOut('slow', function() {
          that.removeProgressPopup();
        })
      },timeout);
      return;
    }
    var i;
    for (i=0; i<results.matches.length; i++) {
      this.addSearchResult(results.matches[i].text, this.leafNumToIndex(results.matches[i].par[0].page));
    }
    this.updateSearchHilites();
    this.removeProgressPopup();
}
**/
// override BRSearchCallback (current v3):
// br. => this.
// ToDo pass options.goToFirstResult
BookReader.prototype.BRSearchCallback = function(results, options) {
    this.searchResults = results;
    $('#BRnavpos .search').remove();
    $('#mobileSearchResultWrapper').empty(); // Empty mobile results

    // Update Mobile count
    var mobileResultsText = results.matches.length == 1 ? "1 match" : results.matches.length + " matches";
    $('#mobileSearchResultWrapper').append("<div class='mobileNumResults'>"+mobileResultsText+" for &quot;"+this.searchTerm+"&quot;</div>");

    var i, firstResultIndex = null;
    for (i=0; i < results.matches.length; i++) {
        	this.addSearchResult(results.matches[i].text, this.leafNumToIndex(results.matches[i].par[0].page));

		// force jump to first result
		// if (i === 0 && this.options.goToFirstResult === true) {
       		if (i === 0) {
          		firstResultIndex = this.leafNumToIndex(results.matches[i].par[0].page);
        	}
    }
    this.updateSearchHilites();
    this.removeProgressPopup();
    if (firstResultIndex !== null) {
        	this.jumpToIndex(firstResultIndex);
    }
}
