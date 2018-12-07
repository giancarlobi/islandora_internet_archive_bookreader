/**
//§§ set BookReader
**/

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
		pages: settings.islandoraInternetArchiveBookReader.pages,
		textUri: settings.islandoraInternetArchiveBookReader.textUri,
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
			this.pages = options.pages;
			this.textUri = options.textUri;
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

/**
//§§ Info DIV
**/

// override buildInfoDiv
BookReader.prototype.buildInfoDiv = function(jInfoDiv) {
      	jInfoDiv.find('.BRfloatBody, .BRfloatCover, .BRfloatFoot').remove();
	jInfoDiv.append(this.IslandoraInfoDIV);
}

/**
//§§ Fullscreen
**/

// Extend buildToolbarElement: add fullscreen button
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

// Go Fullscreen regardless of current state.
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

/**
//§§ Search
**/

// override search
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
};

/**
//§§ Fulltext
**/

// Extend buildToolbarElement: add fulltext button 
BookReader.prototype.buildToolbarElement = (function (super_) {
    	return function () {
        	var $el = super_.call(this);
          	var readIcon = '';
          	$el.find('.BRtoolbarLeft').append("<span class='BRtoolbarSection tc ph20'>"
	  		+ "<button class='BRtext fulltext'><span class=\"hide-md\">Full text</span></button>"
          		+ "</span>");
        	return $el;
    	};
})(BookReader.prototype.buildToolbarElement);

// Extend initToolbar: add fulltext button click code
BookReader.prototype.initToolbar = (function (super_) {
    	return function (mode, ui) {
        	super_.apply(this, arguments);

		var self = this;

		this.refs.$BRtoolbar.find('.fulltext').colorbox({
			inline: true,
			opacity: "0.5",
			href: "#BRfulltext",
			onLoad: function() {
			    	self.trigger('stop');
				self.buildFulltextDiv($('#BRfulltext'));
				
			}
		});
		$('<div style="display: none;"></div>').append(
        		self.blankFulltextDiv()
		).appendTo($('body'));
   	};
})(BookReader.prototype.initToolbar);

//add blankFulltextDiv
BookReader.prototype.blankFulltextDiv = function() {
    	return $([
        	'<div class="BRfloat" id="BRfulltext">',
            	'<div class="BRfloatHead">',
                'Full text',
                '<button class="floatShut" href="javascript:;" onclick="$.fn.colorbox.close();"><span class="shift">Close</span></a>',
            	'</div>',
        	'</div>'].join('\n')
    	);
};

//add buildFulltextDiv
BookReader.prototype.buildFulltextDiv = function(jFulltextDiv) {

	// Remove these legacy elements
        jFulltextDiv.find('.BRfloatBody, .BRfloatCover, .BRfloatFoot').remove();
	// clear content
        jFulltextDiv.find('.BRfloatMeta').remove();
	jFulltextDiv.append($("<div class=\"BRfloatMeta\"></div>"));

    	jFulltextDiv.find('.BRfloatMeta').height(600);
    	jFulltextDiv.find('.BRfloatMeta').width(780);

   	if (1 == this.mode) {
	      	var hash_arr = this.oldLocationHash.split("/");
	      	var index = hash_arr[1];
		if (typeof this.options.pages[index-1] != 'undefined') {
			var pid = this.options.pages[index-1].pid;
		}
	      	$.get(this.options.textUri.replace('PID', pid),
		    	function(data) {
		        	jFulltextDiv.find('.BRfloatMeta').html("<a href=\"/islandora/object/" + pid + "\" target=\"_blank\"><img src=\"/islandora/object/" 
				+ pid + "/datastream/TN\" height=\"100\"></a><br><strong>Page " + index + "</strong><HR>" + data);
			}
		);
    	} else if (3 == this.mode) {
      		jFulltextDiv.find('.BRfloatMeta').html('<div><strong>' + Drupal.t('Full text not supported for this view.') + '</strong></div>');
    	} else {
	      	var twoPageText = $([
	      		'<div class="textTop" style="font-size: 1.1em">',
		 	'<div class="textLeft" style="padding: 10px"><p>Left page loading...</p></div>',
		 	'<div class="textRight" style="padding: 10px"><p>Right page loading...</p></div>',
	      		'</div>'].join('\n'));
	      	jFulltextDiv.find('.BRfloatMeta').html(twoPageText);
	      	var indices = this.getSpreadIndices(this.currentIndex());
		if (typeof this.options.pages[indices[0]] != 'undefined') {
			var left_pid = this.options.pages[indices[0]].pid;
		}
		if (typeof this.options.pages[indices[1]] != 'undefined') {
			var right_pid = this.options.pages[indices[1]].pid;
		}
	      	if(left_pid) {
			$.get(this.options.textUri.replace('PID', left_pid),
		      		function(data) {
		        		jFulltextDiv.find('.textLeft').html("<a href=\"/islandora/object/" + left_pid + "\" target=\"_blank\"><img src=\"/islandora/object/" 
					+ left_pid + "/datastream/TN\" height=\"100\"></a><br><strong>Page " + (indices[0]+1) + "</strong><HR>" + data);
		      		}
			);
	      	} else {
			jFulltextDiv.find('.textLeft').html("<HR>");
		}
	      	if(right_pid) {
			$.get(this.options.textUri.replace('PID', right_pid),
		      		function(data) {
		        		jFulltextDiv.find('.textRight').html("<a href=\"/islandora/object/" + right_pid + "\" target=\"_blank\"><img src=\"/islandora/object/" 
					+ right_pid + "/datastream/TN\" height=\"100\" ></a><br><strong>Page " + (indices[1]+1) + "</strong><HR>" + data);
		      		}
			);
	      	} else {
		        jFulltextDiv.find('.textRight').html("<HR>");
		}
	}
}


/**
//§§ Viewpage
**/

// Extend buildToolbarElement: add viewpage button 
BookReader.prototype.buildToolbarElement = (function (super_) {
    	return function () {
        	var $el = super_.call(this);
          	var readIcon = '';
          	$el.find('.BRtoolbarLeft').append("<span class='BRtoolbarSection tc ph20'>"
	  		+ "<button class='BRtext viewpage'><span class=\"hide-md\">View page</span></button>"
          		+ "</span>");
        	return $el;
    	};
})(BookReader.prototype.buildToolbarElement);

// Extend initToolbar: add viewpage button click code
BookReader.prototype.initToolbar = (function (super_) {
    	return function (mode, ui) {
        	super_.apply(this, arguments);

		var self = this;

		this.refs.$BRtoolbar.find('.viewpage').colorbox({
			inline: true,
			opacity: "0.5",
			href: "#BRviewpage",

			width: "70%",

			onLoad: function() {
			    	self.trigger('stop');
				self.buildViewpageDiv($('#BRviewpage'));
				
			}
		});
		$('<div style="display: none;"></div>').append(
        		self.blankViewpageDiv()
		).appendTo($('body'));
   	};
})(BookReader.prototype.initToolbar);

//add blankViewpageDiv
BookReader.prototype.blankViewpageDiv = function() {
    	return $([
        	'<div class="BRfloat" id="BRviewpage"  style="width: inherit; max-width: none">',
            	'<div class="BRfloatHead">',
                'View page',
                '<button class="floatShut" href="javascript:;" onclick="$.fn.colorbox.close();"><span class="shift">Close</span></a>',
            	'</div>',
        	'</div>'].join('\n')
    	);
};

//add buildViewpageDiv
BookReader.prototype.buildViewpageDiv = function(jViewpageDiv) {

	// Remove these legacy elements
        jViewpageDiv.find('.BRfloatBody, .BRfloatCover, .BRfloatFoot').remove();
	// clear content
        jViewpageDiv.find('.BRfloatMeta').remove();
	jViewpageDiv.append($("<div class=\"BRfloatMeta\"></div>"));

    	jViewpageDiv.find('.BRfloatMeta').height(600);
//    	jViewpageDiv.find('.BRfloatMeta').width(780);



   	if (1 == this.mode) {
	      	var hash_arr = this.oldLocationHash.split("/");
	      	var index = hash_arr[1];
		if (typeof this.options.pages[index-1] != 'undefined') {
			var pid = this.options.pages[index-1].pid;


	      	var osd = $([
	      		'<div id="openseadragon_info" allowfullscreen style="height: 100%"></div>',
		 	'<script src="http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon/openseadragon.js"></script>',
	'<script type="text/javascript">',
    	'var viewer = OpenSeadragon({',
		'element: document.getElementById("openseadragon_info"),',
		'prefixUrl: "http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon//images/",',
            	'homeFillsViewer: false,',
            	'showZoomControl: false,',
		'showNavigator:  false,',
		'showHomeControl: false,',
		'showFullPageControl: true,',
		'showRotationControl: true,',
		'navigatorPosition:   "TOP_RIGHT",',
   	 	'sequenceMode: false,',
		'preserveViewport: true,',
		'defaultZoomLevel: 0,',
            	'constrainDuringPan: false,',
            	'visibilityRatio: 1,',
            	'minZoomImageRatio: 1,',
		'tileSources: "http://v2p2arch.to.cnr.it/iiif-server/iiif/2/http%3A%2F%2F150.145.48.37%3A8080%2Ffedora%2Fobjects%2F' + pid + '%2Fdatastreams%2FJP2%2Fcontent/info.json",',
		'});',
		'</script>'].join('\n'));
	
		jViewpageDiv.find('.BRfloatMeta').html(osd);

		}
    	} else if (3 == this.mode) {
      		var osd = $('<div><strong>' + Drupal.t('View page not supported for this view.') + '</strong></div>');
		jViewpageDiv.find('.BRfloatMeta').html(osd);
    	} else {

/**
	      	var twoPageText = $([
	      		'<div class="textTop" style="font-size: 1.1em">',
		 	'<div class="textLeft" style="padding: 10px"><p>Left page loading...</p></div>',
		 	'<div class="textRight" style="padding: 10px"><p>Right page loading...</p></div>',
	      		'</div>'].join('\n'));
	      	jViewpageDiv.find('.BRfloatMeta').html(twoPageText);
**/
	      	var indices = this.getSpreadIndices(this.currentIndex());
		if (typeof this.options.pages[indices[0]] != 'undefined') {
			var left_pid = this.options.pages[indices[0]].pid;
		}
		if (typeof this.options.pages[indices[1]] != 'undefined') {
			var right_pid = this.options.pages[indices[1]].pid;
		}
	      	if(left_pid) {
		      	var osd_l = $([
		      		'<div id="openseadragon_info_l" allowfullscreen style="height: 100%; width: 40%"></div>',
			 	'<script src="http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon/openseadragon.js"></script>',
				'<script type="text/javascript">',
	    			'var viewer = OpenSeadragon({',
				'element: document.getElementById("openseadragon_info_l"),',
				'prefixUrl: "http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon//images/",',
			    	'homeFillsViewer: false,',
			    	'showZoomControl: false,',
				'showNavigator:  false,',
				'showHomeControl: false,',
				'showFullPageControl: true,',
				'showRotationControl: true,',
				'navigatorPosition:   "TOP_RIGHT",',
		   	 	'sequenceMode: false,',
				'preserveViewport: true,',
				'defaultZoomLevel: 0,',
			    	'constrainDuringPan: false,',
			    	'visibilityRatio: 1,',
			    	'minZoomImageRatio: 1,',
				'tileSources: "http://v2p2arch.to.cnr.it/iiif-server/iiif/2/http%3A%2F%2F150.145.48.37%3A8080%2Ffedora%2Fobjects%2F' + left_pid + '%2Fdatastreams%2FJP2%2Fcontent/info.json",',
				'});',
				'</script>'].join('\n'));
		
			jViewpageDiv.find('.BRfloatMeta').html(osd_l);
	      	} else {
		        jViewpageDiv.find('.BRfloatMeta').html("<HR>");
		}
	      	if(right_pid) {

		      	var osd_r = $([
		      		'<div id="openseadragon_info_r" allowfullscreen style="height: 100%; width: 40%"></div>',
			 	'<script src="http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon/openseadragon.js"></script>',
				'<script type="text/javascript">',
	    			'var viewer = OpenSeadragon({',
				'element: document.getElementById("openseadragon_info_r"),',
				'prefixUrl: "http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon//images/",',
			    	'homeFillsViewer: false,',
			    	'showZoomControl: false,',
				'showNavigator:  false,',
				'showHomeControl: false,',
				'showFullPageControl: true,',
				'showRotationControl: true,',
				'navigatorPosition:   "TOP_RIGHT",',
		   	 	'sequenceMode: false,',
				'preserveViewport: true,',
				'defaultZoomLevel: 0,',
			    	'constrainDuringPan: false,',
			    	'visibilityRatio: 1,',
			    	'minZoomImageRatio: 1,',
				'tileSources: "http://v2p2arch.to.cnr.it/iiif-server/iiif/2/http%3A%2F%2F150.145.48.37%3A8080%2Ffedora%2Fobjects%2F' + right_pid + '%2Fdatastreams%2FJP2%2Fcontent/info.json",',
				'});',
				'</script>'].join('\n'));
		
			jViewpageDiv.find('.BRfloatMeta').append(osd_r);
	      	} else {
		        jViewpageDiv.find('.BRfloatMeta').append("<HR>");
		}

	}

	      	



/**
<div id="openseadragon_info" allowfullscreen style="height: 200px"></div>
<script src="http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon/openseadragon.js"></script>
<script type="text/javascript">
    var viewer = OpenSeadragon({
element: document.getElementById("openseadragon_info"),
prefixUrl: "http://v2p2arch.to.cnr.it/sites/all/libraries/openseadragon//images/",

            homeFillsViewer: true,
            showZoomControl: false,
            constrainDuringPan: true,
            visibilityRatio: 1,
            minZoomImageRatio: 1,


tileSources: "http://v2p2arch.to.cnr.it/iiif-server/iiif/2/http%3A%2F%2F150.145.48.37%3A8080%2Ffedora%2Fobjects%2Fv2p2text%253A107%2Fdatastreams%2FJP2%2Fcontent/info.json",


	});
</script>

**/



}
