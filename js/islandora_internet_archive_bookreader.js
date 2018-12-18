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
		IslandoraTOC: settings.islandoraInternetArchiveBookReader.toc,
		osdUri: settings.islandoraInternetArchiveBookReader.osdUri,
		goToFirstResult: settings.islandoraInternetArchiveBookReader.goToFirstResult,
		disSearchPopup: settings.islandoraInternetArchiveBookReader.disSearchPopup,

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
			this.IslandoraTOC = options.IslandoraTOC;
			this.osdUri = options.osdUri;
			this.goToFirstResult = options.goToFirstResult;
			this.disSearchPopup = options.disSearchPopup;
    		};
	})(BookReader.prototype.setup);

	//§§ Initialize and Render the BookReader.
        var bookReader = new BookReader(options);
        bookReader.init();

      	// to avoid overflow icon on the bottom right side
      	$('div#BRpage').css({
        	'width': 'auto'
      	});

	// to avoid overflow search button on the top right side
      	$('.textSrch').css({
        	'min-width': '10em'
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
		goToFirstResult: false,
		disablePopup: false,
		error: br.BRSearchCallbackErrorDesktop,
		success: br.BRSearchCallback,
    	};
	if (br.goToFirstResult >0) { defaultOptions['goToFirstResult']= true;};
	if (br.disSearchPopup >0) { defaultOptions['disablePopup']= true;};

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
				
				//§ makeup tooltip position
				$('div#BRnavline div.search').bt({
					contentSelector: '$(this).find(".query")',
					trigger: 'hover',
					closeWhenOthersOpen: true,
					cssStyles: {
					    	padding: '12px 14px',
					    	backgroundColor: '#fff',
					    	border: '4px solid rgb(216,216,216)',
					    	color: 'rgb(52,52,52)',
						fontSize: '13px',
						top: '-30px'
					},
					shrinkToFit: true,
					width: '230px',
					padding: 0,
					spikeGirth: 0,
					spikeLength: 0,
					overlap: '0px',
					overlay: false,
					killTitle: true,
					textzIndex: 9999,
					boxzIndex: 9998,
					wrapperzIndex: 9997,
					offsetParent: null,
					positions: ['right'],
					fill: 'white',
					windowMargin: 10,
					strokeWidth: 0,
					cornerRadius: 0,
					centerPointX: 0,
					centerPointY: 0,
					shadow: false
				});
				//§ makeup tooltip text
				$("div#BRnavline div.search div.query span").text(function(index, text) {
				    	return text.replace("Page", " Page");
				});
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
	  		+ "<button class='BRtext fulltext'><span class=\"hide-md\" style=\"font-weight: bolder;\">TEXT</span></button>"
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
	      	var onePageText = $([
	      		'<div class="textTop" style="font-size: 1.1em"><p>Page loading...</p>',
	      		'</div>'].join('\n'));
	      	jFulltextDiv.find('.BRfloatMeta').html(onePageText);

	      	var hash_arr = this.oldLocationHash.split("/");
	      	var index = hash_arr[1];
		if (typeof this.options.pages[index-1] != 'undefined') {
			var pid = this.options.pages[index-1].pid;
		}
	      	$.get(this.options.textUri.replace('PID', pid),
		    	function(data) {
		        	jFulltextDiv.find('.BRfloatMeta').html("<img src=\"/islandora/object/" 
				+ pid + "/datastream/TN\" height=\"100\"><br><strong>Page " + index + "</strong><HR>" + data);
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
		        		jFulltextDiv.find('.textLeft').html("<img src=\"/islandora/object/" 
					+ left_pid + "/datastream/TN\" height=\"100\"><br><strong>Page " + (indices[0]+1) + "</strong><HR>" + data);
		      		}
			);
	      	} else {
			jFulltextDiv.find('.textLeft').html("<HR>");
		}
	      	if(right_pid) {
			$.get(this.options.textUri.replace('PID', right_pid),
		      		function(data) {
		        		jFulltextDiv.find('.textRight').html("<img src=\"/islandora/object/" 
					+ right_pid + "/datastream/TN\" height=\"100\" ><br><strong>Page " + (indices[1]+1) + "</strong><HR>" + data);
		      		}
			);
	      	} else {
		        jFulltextDiv.find('.textRight').html("<HR>");
		}
	}
}


/**
//§§ ZoomPage
// IIIF required
**/

// Extend buildToolbarElement: add ZoomPage button and remove zoom buttons when IIIF server tile source
BookReader.prototype.buildToolbarElement = (function (super_) {
    	return function () {
        	var $el = super_.call(this);
          	var readIcon = '';
		if (this.imageServer == 'iiif') {
		  	$el.find('.BRtoolbarLeft').append("<span class='BRtoolbarSection tc ph20'>"
		  		+ "<button class='BRtext zoomPage'><span class=\"hide-md\" style=\"font-weight: bolder;\">ZOOM</span></button>"
		  		+ "</span>");
			//hide zoom controls
			$el.find('.BRtoolbarSectionZoom').remove();
			//set div class to render osd
			$('<div style="display: none;"></div>').append(
			'<div class="BRfloat" id="BRviewpage"  style="width: inherit; max-width: none; height: 99%; text-align: center; background-color: black;"></div>'
			).appendTo($('body'));
		};
        	return $el;
    	};
})(BookReader.prototype.buildToolbarElement);

// Extend initToolbar: add ZoomPage button click code if IIIF server tile source
BookReader.prototype.initToolbar = (function (super_) {
    	return function (mode, ui) {
        	super_.apply(this, arguments);
		var self = this;
		if (this.imageServer == 'iiif') {
			this.refs.$BRtoolbar.find('.zoomPage').colorbox({
				inline: true,
				opacity: "0.5",
				href: "#BRviewpage",
				width: "80%",
				height: "80%",
				fastIframe: false,
				onOpen: function() {
					if (1 == self.mode) {
					      	var osd_single_loading = $([
					      		'<div class="textTop loader" style="font-size: 1.1em; color: white; height: 100%; width: 100%; display: inline-block;"><p>LOADING...</p>',
					      		'</div>'].join('\n'));
					      	$('#BRviewpage').html(osd_single_loading);
					} else if (2 == self.mode) {
					      	var osd_double_loading = $([
						 	'<div class="viewpLeft loader" style="font-size: 1.1em; color: white; height: 100%; width: 49%; display: inline-block;">',
							'LOADING...</div>',
						 	'<div class="viewpRight loader" style="font-size: 1.1em; color: white; height: 100%; width: 49%; display: inline-block;">',
							'LOADING...</div>'].join('\n'));
					      	$('#BRviewpage').html(osd_double_loading);
					};
				},
				onLoad: function() {
				    	self.trigger('stop');
				},
				onComplete: function() {
					self.buildViewpageDiv($('#BRviewpage'));
					self.modeBeforePageview = self.mode;
					if (1 == self.mode) {
						self.indexBeforePageview = self.currentIndex();
						self.switchMode(2);
					};
				},
				onClosed: function() {
					self.resize()
					if (1 == self.modeBeforePageview) {
						self.switchMode(1);
						self.jumpToIndex(self.indexBeforePageview);
					};
				},
			});

		};
   	};
})(BookReader.prototype.initToolbar);

//add buildViewpageDiv
BookReader.prototype.buildViewpageDiv = function(jViewpageDiv) {

   	if (1 == this.mode) {
	      	var hash_arr = this.oldLocationHash.split("/");
	      	var index = hash_arr[1];
		if (typeof this.options.pages[index-1] != 'undefined') {
			var pid = this.options.pages[index-1].pid;
			var tilesourceUri = this.getPageURI(index-1, 1, 0).replace(/full.*/, "info.json");
			var callbackUri = this.options.osdUri.replace('PID', pid)+'/osd_s';
			$.get(callbackUri,
		    		function(data) {
					osd_single = data.replace('[TS]', tilesourceUri);
					jViewpageDiv.html(osd_single);
				}
			);
		}
    	} else if (3 == this.mode) {
      		var osd = $('<div style="color: white;"><strong>' + Drupal.t('View page not supported for this view.') + '</strong></div>');
		jViewpageDiv.html(osd);
    	} else {
	      	var indices = this.getSpreadIndices(this.currentIndex());
		if (typeof this.options.pages[indices[0]] != 'undefined') {
			var osd_id_l = '/osd_l';
			var left_pid = this.options.pages[indices[0]].pid;
			var tilesourceUri_left = this.getPageURI(indices[0], 1, 0).replace(/full.*/, "info.json");
		} else {
			
			var osd_id_l = '/0';
			var left_pid = '';
			var tilesourceUri_left = '';
		}
		var callbackUri_left = this.options.osdUri.replace('PID', left_pid) + osd_id_l;

		if (typeof this.options.pages[indices[1]] != 'undefined') {
			var osd_id_r = '/osd_r';
			var right_pid = this.options.pages[indices[1]].pid;
			var tilesourceUri_right = this.getPageURI(indices[1], 1, 0).replace(/full.*/, "info.json");
		} else {
			var osd_id_r = '/0';
			var right_pid = '';
			var tilesourceUri_right = '';
		}
		var callbackUri_right = this.options.osdUri.replace('PID', right_pid) + osd_id_r;

		$.get(callbackUri_left,
	    		function(data) {
				osd_left = data.replace('[TS]', tilesourceUri_left);
				jViewpageDiv.find('.viewpLeft').html(osd_left);
				jViewpageDiv.find('.viewpLeft').removeClass('loader');
			}
		);

		$.get(callbackUri_right,
	    		function(data) {
				osd_right = data.replace('[TS]', tilesourceUri_right);
				jViewpageDiv.find('.viewpRight').html(osd_right);
				jViewpageDiv.find('.viewpRight').removeClass('loader');
			}
		);
	}
};

/**
//§§ Chapters
//
**/

// Override getOpenLibraryRecord
// function 'callback' not used
BookReader.prototype.getOpenLibraryRecord = function(callback) {
	itoc = JSON.parse(this.IslandoraTOC.replace(/<(.|\n)*?>/g, '').trim());
  	this.updateTOC(itoc);

	//§ makeup tooltip position
	$('div#BRnavline div.chapter').bt({
		contentSelector: '$(this).find(".title")',
		trigger: 'hover',
		closeWhenOthersOpen: true,
		cssStyles: {
		    	padding: '12px 14px',
		    	backgroundColor: '#fff',
		    	border: '4px solid rgb(216,216,216)',
		    	fontSize: '13px',
		    	color: 'rgb(52,52,52)',
			//§
			top: '-20px'
			//§
		},
		shrinkToFit: true,
		width: '200px',
		padding: 0,
		spikeGirth: 0,
		spikeLength: 0,
		overlap: '0',
		overlay: false,
		killTitle: true,
		textzIndex: 9999,
		boxzIndex: 9998,
		wrapperzIndex: 9997,
		offsetParent: null,
		//§
		positions: ['right'],
		//§
		fill: 'white',
		windowMargin: 10,
		strokeWidth: 0,
		cornerRadius: 0,
		centerPointX: 0,
		centerPointY: 0,
		shadow: false
	});
};
