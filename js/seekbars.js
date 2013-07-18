
'use strict';

var utils = this.utils || {};

utils.seekbars = (function() {

  var vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
               (/firefox/i).test(navigator.userAgent) ? 'Moz' :
               'opera' in window ? 'O' : '';

  var transformProp = vendor + 'Transform';

  // The aria-valuemin attr is initialized to 0.0 if it is not defined
  var MIN_VALUE = 0.0;

  // The aria-valuemax attr is initialized to 1.0 if it is not defined
  var MAX_VALUE = 1.0;

  var sliders = [];

  // Supporting mouse or touch events depending on the delivery context
  var isTouch = 'ontouchstart' in window;
  var touchstart = isTouch ? 'touchstart' : 'mousedown';
  var touchmove = isTouch ? 'touchmove' : 'mousemove';
  var touchend = isTouch ? 'touchend' : 'mouseup';

  /*
   * Returns the pageX value depending on event type
   */
  var getX = (function getXWrapper() {
    return isTouch ? function(e) { return e.touches[0].pageX; } :
                     function(e) { return e.pageX; };
  })();

  /*
   * Returns the progress value from the slider valuenow attribute
   *
   * @param{Float} aria-valuenow
   *
   * @param{Float} aria-valuemin
   *
   * @param{Float} aria-valuemax
   */
  function getProgressValue(value, min, max) {
    var out = value;

    if (value >= max) {
      out = MAX_VALUE;
    } else if (value <= min) {
      out = MIN_VALUE;
    } else {
      out = (value - min) / (max - min);
    }

    return out;
  }

  /*
   * Returns the slider aria-valuenow from the progress value attribute
   *
   * @param{Float} Number between 0.0 .. 1.0
   *
   * @param{Float} aria-valuemin
   *
   * @param{Float} aria-valuemax
   */
  function getSliderValue(value, min, max) {
    var out = value;

    if (value >= MAX_VALUE) {
      out = max;
    } else if (value <= MIN_VALUE) {
      out = min;
    } else {
      out = ((max - min) * value) + min;
    }

    return out;
  }

  /*
   * Slider constructor
   */
  var Slider = function(slider) {
    this.slider = slider; // DOMElement with slider role
    var handler = this.handler = slider.querySelector('progress + button');
    var progress = this.progress = slider.querySelector('progress');

    this.calculateDimensions();

    var vmin = this.valuemin =
                  parseFloat(slider.getAttribute('aria-valuemin')) || MIN_VALUE;

    var vmax = this.valuemax =
                  parseFloat(slider.getAttribute('aria-valuemax')) || MAX_VALUE;

    // HTML authors are doing something wrong
    if (vmax < vmin) {
      vmax = MAX_VALUE;
    }

    var vnow = parseFloat(slider.getAttribute('aria-valuenow'));
    if (!vnow && vnow !== 0) {
      vnow = vmin;
      slider.setAttribute('aria-valuenow', vnow);
    }

    // We have to place the handler and set the correct value to progress bar
    var value = this.valuestart = getProgressValue(vnow, vmin, vmax);
    this.placeHandler(value);
    progress.value = value;
    progress.max = MAX_VALUE;

    // Waiting for events on the UI
    slider.addEventListener(touchstart, this);
  };

  Slider.prototype = {
    handleEvent: function slider_handleEvent(evt) {
      switch (evt.type) {
        case touchstart:
          // We cannot prevent the default behavior here in order to allow
          // active pseudo class
          this.slider.removeEventListener(touchstart, this);

          this.currentX = getX(evt);
          this.startX = this.handler.getBoundingClientRect().left +
                        this.halfHandlerWidth;

          if (this.progressLeft > this.currentX) {
            this.currentX = this.progressLeft;
          }
          if (this.progressRight < this.currentX) {
            this.currentX = this.progressRight;
          }
          this.updateUI();

          if (evt.target === this.handler) {
            window.addEventListener(touchmove, this);
          }

          window.addEventListener(touchend, this);

          break;

        case touchmove:
          evt.preventDefault();

          var x = getX(evt);
          if (x < this.progressLeft) {
            this.setValue(MIN_VALUE);
          } else if (x > this.progressRight) {
            this.setValue(MAX_VALUE);
          } else {
            this.currentX = x;
            this.updateUI();
          }

          break;

        case touchend:
          evt.preventDefault();
          this.deltaX = this.getDeltaX(); // Saving the last delta value
          this.slider.addEventListener(touchstart, this);
          window.removeEventListener(touchmove, this);
          window.removeEventListener(touchend, this);

          break;
      }
    },

    /*
     * Calculates the delta in x-coordinate
     */
    getDeltaX: function getDeltaX() {
      return this.deltaX + this.currentX - this.startX;
    },

    /*
     * Translates the handler and changes the value of the progress bar
     */
    updateUI: function updateUI() {
      var deltaX = this.getDeltaX();
      // Translates the handler button
      this.handler.style[transformProp] = 'translateX(' + deltaX + 'px)';

      // Changes the progress value
      this.setValue(this.valuestart + (deltaX / this.progressWidth));
    },

    setValue: function setValue(value) {
      this.progress.value = value;
      this.slider.setAttribute('aria-valuenow',
                          getSliderValue(value, this.valuemin, this.valuemax));

      this.slider.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    },

    calculateDimensions: function calculateDimensions() {
      this.progressWidth = this.progress.clientWidth;
      this.halfHandlerWidth = this.handler.clientWidth / 2;

      // We are going to calculate the limits to translate the handler
      this.progressLeft = this.progress.getBoundingClientRect().left;
      this.progressRight = this.progressLeft + this.progressWidth;

      this.deltaX = 0;
    },

    placeHandler: function placeHandler(value) {

      this.handler.style.left = ((this.progressWidth * value) + this.progressLeft -
                                 this.progress.parentNode.getBoundingClientRect().left) + 'px';
      this.handler.style[transformProp] = 'translateX(0)';
    },

    destroy: function destroy() {
      // Removing listeners
      this.slider.removeEventListener(touchstart, this);

      // Variables to null
      this.progress = this.slider = this.handler = this.valuemax =
      this.valuemin = this.valuestart = this.progressWidth =
      this.deltaX = this.currentX = this.progressLeft =
      this.progressRight = null;
    }
  };

  function initialize() {
    reset();
    // Looking for ALL sliders in the DOM
    var sliderElements = document.querySelectorAll('[role="slider"]');
    for (var i = 0; i < sliderElements.length; i++) {
      sliders.push(new Slider(sliderElements[i]));
    }
  }

  function reset() {
    sliders.forEach(function(slider) {
      slider.destroy();
    });
    sliders = [];
  }

  function reArrange() {
    sliders.forEach(function(slider) {
      slider.calculateDimensions();
      slider.valuestart = slider.progress.value;
      slider.placeHandler(slider.valuestart);
    });
  }

  window.addEventListener('resize', reArrange);

  try {
    screen.addEventListener('orientationchange', reArrange);
  } catch(ex) {
    window.addEventListener('orientationchange', reArrange);
  }

  // Initializing the library
  if (document.readyState === 'complete') {
    initialize();
  } else {
    document.addEventListener('DOMContentLoaded', function loaded() {
      document.removeEventListener('DOMContentLoaded', loaded);
      initialize();
    });
  }

  return {
    /*
     * This library is auto-executable although we need this public method
     * for unit testing
     */
    init: initialize,


    /*
     * Destroys all variables and removes event listeners running
     */
    destroy: reset,

    /*
     * Binds to an UI component
     *
     * @param{Object} DOMElement o selector that represents the slider
     */
    bind: function bind(elem) {
      elem = typeof elem === 'object' ? elem : document.querySelector(elem);
      sliders.push(new Slider(elem));
    },

    /*
     * Creates a new slider UI component
     *
     * @param{Object} Options
     */
    create: function create(options) {
      var slider = document.createElement('div');
      slider.setAttribute('role', 'slider');

      if (options) {
        Object.keys(options).forEach(function(key) {
          slider.setAttribute(key, options[key]);
        });
      }

      var wrapper = document.createElement('div');
      var progress = document.createElement('progress');
      progress.setAttribute('role', 'presentation');

      wrapper.appendChild(progress);
      wrapper.appendChild(document.createElement('button'));
      slider.appendChild(wrapper);

      return slider;
    }
  };

})();
