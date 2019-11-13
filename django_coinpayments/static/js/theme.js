"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//
//
// background-images.js
//
// a javscript fallback for CSS 'object-fit' property for browsers that don't support it
if ('objectFit' in document.documentElement.style === false) {
  $('.bg-image').each(function attachBg() {
    var img = $(this);
    var src = img.attr('src');
    var classes = img.get(0).classList; // Replaces the default <img.bg-image> element with a <div.bg-image>
    // to attach background using legacy friendly CSS rules

    img.before($("<div class=\"" + classes + "\" style=\"background: url(" + src + "); background-size: cover; background-position: 50% 50%;\"></div>")); // Removes original <img.bg-image> as it is no longer required

    img.remove();
  });
} //
//
// countdown.js
//
// an initializer for the Final Countdown plugin
// http://hilios.github.io/jQuery.countdown/documentation.html#introduction
//


var mrCountdown = function ($) {
  /**
   * Check for countdown dependency
   * countdown - https://github.com/hilios/jQuery.countdown/
   */
  if (typeof $.fn.countdown !== 'function') {
    throw new Error('mrCountdown requires jquery.countdown.js (https://github.com/hilios/jQuery.countdown/)');
  }
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */


  var NAME = 'mrCountdown';
  var VERSION = '1.0.0';
  var DATA_KEY = 'mr.countdown';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Event = {
    LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY
  };
  var Default = {
    DAYS_TEXT: 'days',
    ELAPSED: 'Timer Done'
  };
  var Selector = {
    COUNTDOWN: '[data-countdown-date]',
    DATE_ATTR: 'data-countdown-date',
    DAYS_TEXT_ATTR: 'data-days-text',
    DATE_FORMAT_ATTR: 'data-date-format',
    DATE_FALLBACK_ATTR: 'data-date-fallback'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Countdown =
  /*#__PURE__*/
  function () {
    function Countdown(element) {
      // The current map element
      this.element = element;
      var $element = $(element);
      this.date = $element.attr(Selector.DATE_ATTR);
      this.daysText = $element.attr(Selector.DAYS_TEXT_ATTR) || Default.DAYS_TEXT;
      this.countdownText = "%D " + this.daysText + " %H:%M:%S";
      this.dateFormat = $element.attr(Selector.DATE_FORMAT_ATTR) || this.countdownText;
      this.fallback = $element.attr(Selector.DATE_FALLBACK_ATTR) || Default.ELAPSED;
      this.initCountdown();
    } // getters


    var _proto = Countdown.prototype;

    _proto.initCountdown = function initCountdown() {
      var _this = this;

      var element = $(this.element);
      $(this.element).countdown(this.date, function (event) {
        if (event.elapsed) {
          element.text(_this.fallback);
        } else {
          element.text(event.strftime(_this.dateFormat));
        }
      });
    };

    Countdown.jQueryInterface = function jQueryInterface() {
      return this.each(function jqEachCountdown() {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Countdown(this);
          $element.data(DATA_KEY, data);
        }
      });
    };

    _createClass(Countdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Countdown;
  }(); // END Class definition

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */


  $(window).on(Event.LOAD_DATA_API, function () {
    var cdownsOnPage = $.makeArray($(Selector.COUNTDOWN));
    /* eslint-disable no-plusplus */

    for (var i = cdownsOnPage.length; i--;) {
      var $countdown = $(cdownsOnPage[i]);
      Countdown.jQueryInterface.call($countdown, $countdown.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  /* eslint-disable no-param-reassign */

  $.fn[NAME] = Countdown.jQueryInterface;
  $.fn[NAME].Constructor = Countdown;

  $.fn[NAME].noConflict = function CountdownNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Countdown.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */


  return Countdown;
}(jQuery); //
//
// flickity.js
//
// Reset size of flickity sliders embedded in modals


$(document).on('shown.bs.modal layoutComplete', function (e) {
  var flickityInstance = $(e.target).find('[data-flickity]');
  flickityInstance.each(function (index, instance) {
    var $instance = $(instance);

    if ($instance.data().flickity.isInitActivated) {
      $instance.flickity('resize');
    }
  });
}); //
//
// isotope.js
//
// Initialize the isotope plugin and retrigger the layout when images load
// init Isotope

var $grid = $('.isotope').each(function (index, element) {
  $(element).isotope({
    itemSelector: '.grid-item',
    layoutMode: 'masonry',
    filter: $(element).attr('data-default-filter')
  });
}); // layout Isotope after each image loads

$grid.imagesLoaded().progress(function () {
  $grid.isotope('layout');
}); // filtering

$('[data-isotope-filter]').on('click', function (e) {
  e.preventDefault();
  var isotopeId = ".isotope[data-isotope-id=\"" + $(e.target).closest('[data-isotope-id]').attr('data-isotope-id') + "\"]";
  var filterValue = $(e.target).attr('data-isotope-filter');
  $(isotopeId).isotope({
    filter: filterValue
  }).find('[data-flickity]').each(function (index, instance) {
    var $instance = $(instance);

    if ($instance.data().flickity.isInitActivated) {
      $instance.flickity('resize');
    }
  }).end().isotope({
    filter: filterValue
  });
  $(e.target).siblings().removeClass('active');
  $(e.target).addClass('active');
}); //
//
// maps.js
//
// an initializer for the Google Maps js API
//

/* global google */

var mrMaps = function ($) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'mrMaps';
  var VERSION = '1.0.0';
  var DATA_KEY = 'mr.maps';
  var EVENT_KEY = "." + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Selector = {
    MAP: '[data-maps-api-key]',
    MARKER: 'div.map-marker',
    STYLE: 'div.map-style',
    MARKER_ADDRESS: 'data-address',
    MARKER_LATLNG: 'data-latlong',
    INFOWindow: 'div.info-window'
  };
  var String = {
    MARKER_TITLE: ''
  };
  var Event = {
    MAP_LOADED: "loaded" + EVENT_KEY
  };
  var Default = {
    MARKER_IMAGE_URL: 'assets/img/map-marker.png',
    MAP: {
      disableDefaultUI: true,
      draggable: true,
      scrollwheel: false,
      styles: [{
        featureType: 'administrative.country',
        elementType: 'labels.text',
        stylers: [{
          lightness: '29'
        }]
      }, {
        featureType: 'administrative.province',
        elementType: 'labels.text.fill',
        stylers: [{
          lightness: '-12'
        }, {
          color: '#796340'
        }]
      }, {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{
          lightness: '15'
        }, {
          saturation: '15'
        }]
      }, {
        featureType: 'landscape.man_made',
        elementType: 'geometry',
        stylers: [{
          visibility: 'on'
        }, {
          color: '#fbf5ed'
        }]
      }, {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{
          visibility: 'on'
        }, {
          color: '#fbf5ed'
        }]
      }, {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{
          visibility: 'off'
        }]
      }, {
        featureType: 'poi.attraction',
        elementType: 'all',
        stylers: [{
          visibility: 'on'
        }, {
          lightness: '30'
        }, {
          saturation: '-41'
        }, {
          gamma: '0.84'
        }]
      }, {
        featureType: 'poi.attraction',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }]
      }, {
        featureType: 'poi.business',
        elementType: 'all',
        stylers: [{
          visibility: 'off'
        }]
      }, {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{
          visibility: 'off'
        }]
      }, {
        featureType: 'poi.medical',
        elementType: 'geometry',
        stylers: [{
          color: '#fbd3da'
        }]
      }, {
        featureType: 'poi.medical',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }]
      }, {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{
          color: '#b0e9ac'
        }, {
          visibility: 'on'
        }]
      }, {
        featureType: 'poi.park',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }]
      }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
          hue: '#68ff00'
        }, {
          lightness: '-24'
        }, {
          gamma: '1.59'
        }]
      }, {
        featureType: 'poi.sports_complex',
        elementType: 'all',
        stylers: [{
          visibility: 'on'
        }]
      }, {
        featureType: 'poi.sports_complex',
        elementType: 'geometry',
        stylers: [{
          saturation: '10'
        }, {
          color: '#c3eb9a'
        }]
      }, {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{
          visibility: 'on'
        }, {
          lightness: '30'
        }, {
          color: '#e7ded6'
        }]
      }, {
        featureType: 'road',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }, {
          saturation: '-39'
        }, {
          lightness: '28'
        }, {
          gamma: '0.86'
        }]
      }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
          color: '#ffe523'
        }, {
          visibility: 'on'
        }]
      }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
          visibility: 'on'
        }, {
          saturation: '0'
        }, {
          gamma: '1.44'
        }, {
          color: '#fbc28b'
        }]
      }, {
        featureType: 'road.highway',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }, {
          saturation: '-40'
        }]
      }, {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{
          color: '#fed7a5'
        }]
      }, {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [{
          visibility: 'on'
        }, {
          gamma: '1.54'
        }, {
          color: '#fbe38b'
        }]
      }, {
        featureType: 'road.local',
        elementType: 'geometry.fill',
        stylers: [{
          color: '#ffffff'
        }, {
          visibility: 'on'
        }, {
          gamma: '2.62'
        }, {
          lightness: '10'
        }]
      }, {
        featureType: 'road.local',
        elementType: 'geometry.stroke',
        stylers: [{
          visibility: 'on'
        }, {
          weight: '0.50'
        }, {
          gamma: '1.04'
        }]
      }, {
        featureType: 'transit.station.airport',
        elementType: 'geometry.fill',
        stylers: [{
          color: '#dee3fb'
        }]
      }, {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{
          saturation: '46'
        }, {
          color: '#a4e1ff'
        }]
      }],
      zoom: 17,
      zoomControl: false
    }
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Map =
  /*#__PURE__*/
  function () {
    function Map(element) {
      // The current map element
      this.element = element;
      this.$element = $(element);
      this.markers = [];
      this.geocoder = new google.maps.Geocoder();
      this.markerElements = this.$element.find(Selector.MARKER);
      this.styleElement = this.$element.find(Selector.STYLE).first();
      this.initMap();
      this.createMarkers();
    } // version getter


    Map.init = function init() {
      var mapsOnPage = $.makeArray($(Selector.MAP));
      /* eslint-disable no-plusplus */

      for (var i = mapsOnPage.length; i--;) {
        var $map = $(mapsOnPage[i]);
        Map.jQueryInterface.call($map, $map.data());
      }
    };

    var _proto2 = Map.prototype;

    _proto2.initMap = function initMap() {
      var _this2 = this;

      var mapElement = this.element;
      var mapInstance = this.$element;

      var showZoomControl = _typeof(mapInstance.attr('data-zoom-controls')) !== _typeof(undefined);

      var zoomControlPos = _typeof(mapInstance.attr('data-zoom-controls')) !== _typeof(undefined) ? mapInstance.attr('data-zoom-controls') : false;
      var latlong = _typeof(mapInstance.attr('data-latlong')) !== _typeof(undefined) ? mapInstance.attr('data-latlong') : false;
      var latitude = latlong ? parseFloat(latlong.substr(0, latlong.indexOf(','))) : false;
      var longitude = latlong ? parseFloat(latlong.substr(latlong.indexOf(',') + 1)) : false;
      var address = mapInstance.attr('data-address') || '';
      var mapOptions = null; // let markerOptions = null;

      var mapAo = {}; // Attribute overrides - allows data attributes on the map to override global options

      try {
        mapAo.styles = this.styleElement.length ? JSON.parse(this.styleElement.html().trim()) : undefined;
      } catch (error) {
        throw new Error(error);
      }

      mapAo.zoom = mapInstance.attr('data-map-zoom') ? parseInt(mapInstance.attr('data-map-zoom'), 10) : undefined;
      mapAo.zoomControl = showZoomControl;
      mapAo.zoomControlOptions = zoomControlPos !== false ? {
        position: google.maps.ControlPosition[zoomControlPos]
      } : undefined;
      mapOptions = jQuery.extend({}, Default.MAP, mapAo);
      this.map = new google.maps.Map(mapElement, mapOptions);
      google.maps.event.addListenerOnce(this.map, 'center_changed', function () {
        // Map has been centered.
        var loadedEvent = $.Event(Event.MAP_LOADED, {
          map: _this2.map
        });
        mapInstance.trigger(loadedEvent);
      });

      if (_typeof(latitude) !== _typeof(undefined) && latitude !== '' && latitude !== false && _typeof(longitude) !== _typeof(undefined) && longitude !== '' && longitude !== false) {
        this.map.setCenter(new google.maps.LatLng(latitude, longitude));
      } else if (address !== '') {
        this.geocodeAddress(address, Map.centerMap, this, this.map);
      } else {
        throw new Error('No valid address or latitude/longitude pair provided for map.');
      }
    };

    _proto2.geocodeAddress = function geocodeAddress(address, callback, thisMap, args) {
      this.geocoder.geocode({
        address: address
      }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
          throw new Error("There was a problem geocoding the address \"" + address + "\".");
        } else {
          callback(results, thisMap, args);
        }
      });
    };

    Map.centerMap = function centerMap(geocodeResults, thisMap) {
      thisMap.map.setCenter(geocodeResults[0].geometry.location);
    };

    Map.moveMarker = function moveMarker(geocodeResults, thisMap, gMarker) {
      gMarker.setPosition(geocodeResults[0].geometry.location);
    };

    _proto2.createMarkers = function createMarkers() {
      var _this3 = this;

      Default.MARKER = {
        icon: {
          url: Default.MARKER_IMAGE_URL,
          scaledSize: new google.maps.Size(50, 50)
        },
        title: String.MARKER_TITLE,
        optimised: false
      };
      this.markerElements.each(function (index, marker) {
        var gMarker;
        var $marker = $(marker);
        var markerAddress = $marker.attr(Selector.MARKER_ADDRESS);
        var markerLatLng = $marker.attr(Selector.MARKER_LATLNG);
        var infoWindow = $marker.find(Selector.INFOWindow);
        var markerAo = {
          title: $marker.attr('data-marker-title')
        };
        markerAo.icon = _typeof($marker.attr('data-marker-image')) !== _typeof(undefined) ? {
          url: $marker.attr('data-marker-image'),
          scaledSize: new google.maps.Size(50, 50)
        } : undefined;
        var markerOptions = jQuery.extend({}, Default.MARKER, markerAo);
        gMarker = new google.maps.Marker(jQuery.extend({}, markerOptions, {
          map: _this3.map
        }));

        if (infoWindow.length) {
          var gInfoWindow = new google.maps.InfoWindow({
            content: infoWindow.first().html(),
            maxWidth: parseInt(infoWindow.attr('data-max-width') || '250', 10)
          });
          gMarker.addListener('click', function () {
            gInfoWindow.open(_this3.map, gMarker);
          });
        } // Set marker position


        if (markerLatLng) {
          if (/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.test(markerLatLng)) {
            gMarker.setPosition(new google.maps.LatLng(parseFloat(markerLatLng.substr(0, markerLatLng.indexOf(','))), parseFloat(markerLatLng.substr(markerLatLng.indexOf(',') + 1))));
            _this3.markers[index] = gMarker;
          }
        } else if (markerAddress) {
          _this3.geocodeAddress(markerAddress, Map.moveMarker, _this3, gMarker);

          _this3.markers[index] = gMarker;
        } else {
          gMarker = null;
          throw new Error("Invalid data-address or data-latlong provided for marker " + (index + 1));
        }
      });
    };

    Map.jQueryInterface = function jQueryInterface() {
      return this.each(function jqEachMap() {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Map(this);
          $element.data(DATA_KEY, data);
        }
      });
    };

    _createClass(Map, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Map;
  }(); // END Class definition

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */
  // Load Google MAP API JS with callback to initialise when fully loaded


  if (document.querySelector('[data-maps-api-key]') && !document.querySelector('.gMapsAPI')) {
    if ($('[data-maps-api-key]').length) {
      var apiKey = $('[data-maps-api-key]:first').attr('data-maps-api-key') || '';

      if (apiKey !== '') {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=mrMaps.init";
        script.className = 'gMapsAPI';
        document.body.appendChild(script);
      }
    }
  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  /* eslint-disable no-param-reassign */


  $.fn[NAME] = Map.jQueryInterface;
  $.fn[NAME].Constructor = Map;

  $.fn[NAME].noConflict = function MapNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Map.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */


  return Map;
}(jQuery); //
//
// prism.js
//
// Initialises the prism code highlighting plugin

/* global Prism */


Prism.highlightAll(); //
//
// smooth-scroll.js
//
// Initialises the prism code highlighting plugin

/* global SmoothScroll */

var mrSmoothScroll = new SmoothScroll('a[data-smooth-scroll]', {
  offset: $('body').attr('data-smooth-scroll-offset') || 0
}); //
//
// sticky.js
//
// Initialises the srollMonitor plugin and provides interface to watcher objects
// for sticking elements to the top of viewport while scrolling

/* global scrollMonitor */

var mrSticky = function ($) {
  /**
   * Check for scrollMonitor dependency
   * scrollMonitor - https://github.com/stutrek/scrollMonitor
   */
  if (typeof scrollMonitor === 'undefined') {
    throw new Error('mrSticky requires scrollMonitor.js (https://github.com/stutrek/scrollMonitor)');
  }
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */


  var NAME = 'mrSticky';
  var VERSION = '1.1.0';
  var DATA_KEY = 'mr.sticky';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var NO_OFFSET = 0;
  var ClassName = {
    FIXED_TOP: 'position-fixed',
    ABSOLUTE_BOTTOM: 'sticky-bottom',
    FIXED_BOTTOM: 'sticky-viewport-bottom'
  };
  var Css = {
    HEIGHT: 'min-height',
    WIDTH: 'max-width',
    SPACE_TOP: 'top',
    SPACE_BOTTOM: 'bottom'
  };
  var Event = {
    LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
    RESIZE: "resize" + EVENT_KEY
  };
  var Options = {
    BELOW_NAV: 'below-nav',
    TOP: 'top',
    BOTTOM: 'bottom'
  };
  var Selector = {
    DATA_ATTR: 'sticky',
    DATA_STICKY: '[data-sticky]',
    NAV_STICKY: 'body > div.nav-container > div[data-sticky="top"]'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Sticky =
  /*#__PURE__*/
  function () {
    function Sticky(element) {
      var $element = $(element);
      var stickyData = $element.data(Selector.DATA_ATTR);
      var stickyUntil = $element.closest('section') || null;
      this.element = element;
      this.stickBelowNav = stickyData === Options.BELOW_NAV;
      this.stickBottom = stickyData === Options.BOTTOM;
      this.stickyUntil = stickyUntil;
      this.updateNavProperties();
      this.isNavElement = $element.is(this.navElement);
      this.initWatcher(element);
      this.updateCss();
      this.setResizeEvent();
    } // getters


    var _proto3 = Sticky.prototype;

    _proto3.initWatcher = function initWatcher(element) {
      var _this4 = this;

      var $element = $(element);
      var notNavElement = !this.isNavElement;
      var offset = this.stickBelowNav && this.navIsSticky && notNavElement ? {
        top: this.navHeight
      } : NO_OFFSET;
      offset = this.stickBottom && notNavElement ? {
        bottom: -$element.outerHeight
      } : offset;
      var watcher = scrollMonitor.create(element, offset); // ensure that we're always watching the place the element originally was

      watcher.lock();
      var untilWatcher = this.stickyUntil !== null ? scrollMonitor.create(this.stickyUntil, {
        bottom: -(watcher.height + offset.top)
      }) : null;
      this.watcher = watcher;
      this.untilWatcher = untilWatcher;
      this.navHeight = this.navHeight; // For navs that start at top, stick them immediately to avoid a jump

      if (this.isNavElement && watcher.top === 0 && !this.navIsAbsolute) {
        $element.addClass(ClassName.FIXED_TOP);
      }

      watcher.stateChange(function () {
        // Add fixed when element leaves via top of viewport or if nav is sitting at top
        $element.toggleClass(ClassName.FIXED_TOP, watcher.isAboveViewport || !_this4.navIsAbsolute && !_this4.stickBottom && _this4.isNavElement && watcher.top === 0); // Fix to bottom when element enters via bottom of viewport and has data-sticky="bottom"

        $element.toggleClass(ClassName.FIXED_BOTTOM, (watcher.isFullyInViewport || watcher.isAboveViewport) && _this4.stickBottom);

        if (!_this4.stickBottom) {
          $element.css(Css.SPACE_TOP, watcher.isAboveViewport && _this4.navIsSticky && _this4.stickBelowNav ? _this4.navHeight : NO_OFFSET);
        }
      });

      if (untilWatcher !== null) {
        untilWatcher.exitViewport(function () {
          // If the element is in a section, it will scroll up with the section
          $element.addClass(ClassName.ABSOLUTE_BOTTOM);
        });
        untilWatcher.enterViewport(function () {
          $element.removeClass(ClassName.ABSOLUTE_BOTTOM);
        });
      }
    };

    _proto3.setResizeEvent = function setResizeEvent() {
      var _this5 = this;

      window.addEventListener('resize', function () {
        return _this5.updateCss();
      });
    };

    _proto3.updateCss = function updateCss() {
      var $element = $(this.element); // Fix width by getting parent's width to avoid element spilling out when pos-fixed

      $element.css(Css.WIDTH, $element.parent().width());
      this.updateNavProperties();
      var elemHeight = $element.outerHeight();
      var notNavElement = !this.isNavElement; // Set a min-height to prevent "jumping" when sticking to top
      // but not applied to the nav element itself unless it is overlay (absolute) nav

      if (!this.navIsAbsolute && this.isNavElement || notNavElement) {
        $element.parent().css(Css.HEIGHT, elemHeight);
      }

      if (this.navIsSticky && notNavElement) {
        $element.css(Css.HEIGHT, elemHeight);
      }
    };

    _proto3.updateNavProperties = function updateNavProperties() {
      var $navElement = this.navElement || $(Selector.NAV_STICKY).first();
      this.navElement = $navElement;
      this.navHeight = $navElement.outerHeight();
      this.navIsAbsolute = $navElement.css('position') === 'absolute';
      this.navIsSticky = $navElement.length;
    };

    Sticky.jQueryInterface = function jQueryInterface() {
      return this.each(function jqEachSticky() {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Sticky(this);
          $element.data(DATA_KEY, data);
        }
      });
    };

    _createClass(Sticky, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Sticky;
  }();
  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */


  $(window).on(Event.LOAD_DATA_API, function () {
    var stickyElements = $.makeArray($(Selector.DATA_STICKY));
    /* eslint-disable no-plusplus */

    for (var i = stickyElements.length; i--;) {
      var $sticky = $(stickyElements[i]);
      Sticky.jQueryInterface.call($sticky, $sticky.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  /* eslint-disable no-param-reassign */

  $.fn[NAME] = Sticky.jQueryInterface;
  $.fn[NAME].Constructor = Sticky;

  $.fn[NAME].noConflict = function StickyNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Sticky.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */


  return Sticky;
}(jQuery);

$(document).ready(function () {
  $('.video-cover .video-play-icon').on('click touchstart', function clickedPlay() {
    var $iframe = $(this).closest('.video-cover').find('iframe');
    mrUtil.activateIframeSrc($iframe);
    $(this).parent('.video-cover').addClass('video-cover-playing');
  }); // Disable video cover behaviour on mobile devices to avoid user having to press twice

  var isTouchDevice = 'ontouchstart' in document.documentElement;

  if (isTouchDevice === true) {
    $('.video-cover').each(function activeateMobileIframes() {
      $(this).addClass('video-cover-touch');
      var $iframe = $(this).closest('.video-cover').find('iframe');
      mrUtil.activateIframeSrc($iframe);
    });
  } // <iframe> in modals


  $('.modal').on('shown.bs.modal', function modalShown() {
    var $modal = $(this);

    if ($modal.find('iframe[data-src]').length) {
      var $iframe = $modal.find('iframe[data-src]');

      if (!$iframe.closest('.video-cover').length) {
        mrUtil.activateIframeSrc($iframe);
      }
    }
  });
  $('.modal').on('hidden.bs.modal', function modalHidden() {
    var $modal = $(this);

    if ($modal.find('iframe[src]').length) {
      var $iframe = $modal.find('iframe[data-src]');

      if ($iframe.closest('.video-cover').length) {
        $iframe.closest('.video-cover').removeClass('video-cover-playing');
      }

      mrUtil.idleIframeSrc($iframe);
    }
  });
  $('[data-toggle="tooltip"]').tooltip();
}); //
//
// wizard.js
//
// initialises the jQuery Smart Wizard plugin

$(document).ready(function () {
  $('.wizard').smartWizard({
    transitionEffect: 'fade',
    showStepURLhash: false,
    toolbarSettings: {
      toolbarPosition: 'none'
    }
  });
}); //
//
// Util
//
// Medium Rare utility functions
// v 1.1.0

var mrUtil = function ($) {
  // Activate tooltips
  $('body').tooltip({
    selector: '[data-toggle="tooltip"]',
    container: 'body'
  });
  var Util = {
    activateIframeSrc: function activateIframeSrc(iframe) {
      var $iframe = $(iframe);

      if ($iframe.attr('data-src')) {
        $iframe.attr('src', $iframe.attr('data-src'));
      }
    },
    idleIframeSrc: function idleIframeSrc(iframe) {
      var $iframe = $(iframe);
      $iframe.attr('data-src', $iframe.attr('src')).attr('src', '');
    },
    forEach: function forEach(array, callback, scope) {
      for (var i = 0; i < array.length; i += 1) {
        callback.call(scope, i, array[i]); // passes back stuff we need
      }
    },
    dedupArray: function dedupArray(arr) {
      return arr.reduce(function (p, c) {
        // create an identifying String from the object values
        var id = JSON.stringify(c); // if the JSON string is not found in the temp array
        // add the object to the output array
        // and add the key to the temp array

        if (p.temp.indexOf(id) === -1) {
          p.out.push(c);
          p.temp.push(id);
        }

        return p; // return the deduped array
      }, {
        temp: [],
        out: []
      }).out;
    }
  };
  return Util;
}(jQuery);