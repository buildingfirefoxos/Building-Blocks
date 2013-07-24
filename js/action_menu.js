
'use strict';

var utils = this.utils || {};

utils.ActionMenu = (function() {

  // This constant is essential to resolve what is the path of the CSS file
  // that defines the animations
  var FILE_NAME = 'action_menu';

  function getPath() {
    var path = document.querySelector('[src*="' + FILE_NAME + '.js"]').src;
    return path.substring(0, path.lastIndexOf('/') + 1);
  }

  var actionMenus = Object.create(null);
  var counter = 0;

  /*
   * ActionMenu constructor
   *
   * @param{Object} DOMElement with data type action
   *
   */
  var Action = function(container) {
    this.container = container;
    container.dataset.id = ++counter;

    this.callbacks = Object.create(null);

    container.addEventListener('click', this);
    container.addEventListener('animationend', this);
  };

  Action.prototype = {
    /*
     * Returns the identifier
     */
    get id() {
      return this.container.id;
    },

    /*
     * Shows the action menu
     */
    show: function am_show() {
      this.container.classList.remove('hidden');
      this.container.classList.add('onviewport');
    },

    /*
     * Hides the action menu
     */
    hide: function am_hide() {
      this.container.classList.remove('onviewport');
    },

    /*
     * Authors can add an event listener to handle clicks over the component.
     * An onclick event handler is also supported.
     *
     * @param{String} Event type (only implemented "click" event)
     *
     * @param{Function} Callback that will be invoked when the event occurs
     *
     */
    addEventListener: function am_addEventListener(type, callback) {
      if (type !== 'click' || typeof callback !== 'function') {
        return;
      }

      this.callbacks[callback] = callback;
    },

    /*
     * Authors can remove event listeners
     *
     * @param{String} Event type (only implemented "click" event)
     *
     * @param{Function} Callback that will be removed
     *
     */
    removeEventListener: function am_removeEventListener(type, callback) {
      if (type === 'click' && typeof callback === 'function') {
        delete this.callbacks[callback];
      }
    },

    /*
     * This method is called when a "click" or "animationend" event occurs
     *
     * @param{Object} The DOM Event to register
     */
    handleEvent: function am_handleEvent(evt) {
      switch (evt.type) {
        case 'click':
          evt.stopPropagation();
          evt.preventDefault();

          if (evt.target.tagName !== 'BUTTON') {
            return;
          }

          // The component is auto-closed
          window.setTimeout(this.hide.bind(this));

          typeof this.onclick === 'function' && this.onclick(evt);
          var callbacks = this.callbacks;
          Object.keys(callbacks).forEach(function(callback) {
            setTimeout(function() {
              callbacks[callback](evt);
            });
          });

        break;

        case 'animationend':
          var eventName = 'actionmenu-showed';

          if (evt.animationName === 'hide') {
            this.container.classList.add('hidden');
            eventName = 'actionmenu-hidden';
          }

          window.dispatchEvent(new CustomEvent(eventName));

        break;
      }
    },

    /*
     * Variables are deleted and listeners unregistered
     */
    destroy: function am_destroy() {
      if (!this.container) {
        return;
      }

      this.container.removeEventListener('click', this);
      this.container.removeEventListener('animationend', this);
      this.container.parentNode.removeChild(this.container);
      this.container = this.callbacks = this.onclick = null;
    }
  };

  function addStyleSheet() {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = getPath() + 'action_menu_behavior.css';
    document.head.appendChild(link);
  }

  function initialize() {
    addStyleSheet();

    // Looking for all actions in the DOM
    var elements =
              document.querySelectorAll('[role="dialog"][data-type="action"]');
    Array.prototype.forEach.call(elements, function(element) {
      utils.ActionMenu.bind(element);
    });
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

  function destroy() {
    Object.keys(actionMenus).forEach(function destroying(id) {
      actionMenus[id].destroy();
    });
    actionMenus = Object.create(null);
    counter = 0;
  }

  function build(descriptor) {
    var form = document.createElement('form');
    form.setAttribute('role', 'dialog');
    form.dataset.type = 'action';
    form.classList.add('hidden');
    if (descriptor.id) {
      form.id = descriptor.id;
    }

    var section = document.createElement('section');
    var h1 = document.createElement('h1');
    h1.textContent = descriptor.title || '';
    section.appendChild(h1);
    form.appendChild(section);

    var actions = descriptor.actions;
    if (actions) {
      var menu = document.createElement('menu');
      menu.classList.add('actions');

      actions.forEach(function(action) {
        var button = document.createElement('button');
        button.id = action.id;
        button.textContent = action.title;
        menu.appendChild(button);
        var classes = action.classList;
        if (classes) {
          // Populating class list
          classes.trim().split(/\s+/g).forEach(function(clazz) {
            button.classList.add(clazz);
          });
        }
      });

      form.appendChild(menu);
    }

    return form;
  }

  return {
    /*
     * Returns an action menu object.
     */
    get: function get(id) {
      var elem = document.getElementById(id);

      if (!elem) {
        return;
      }

      return actionMenus[elem.dataset.id];
    },

    /*
     * Binds a DOM Element to the behaviour supported by action menus and
     * implemented by this library.
     *
     * @param{Object} DOMElement or selector that represents the action menu form
     */
    bind: function bind(elem) {
      elem = typeof elem === 'object' ? elem : document.querySelector(elem);

      var out = actionMenus[elem.dataset.id];
      if (out) {
        return out;
      }

      out = new Action(elem);
      actionMenus[elem.dataset.id] = out;

      return out;
    },

    /*
     * Creates a new action menu UI component.
     *
     * @param{Object} {
     *                  id: "action menu identifier",
     *                  title: "action menu title",
     *                  actions: [
     *                    { id: "button identifier", title: "button text",
     *                      classList: "whitespace-separated lists of classes"}
     *                  ]
     *                }
     */
    create: function create(descriptor) {
      return build(descriptor || {});
    },

    /*
     * Releases memory removing listeners and deleting variables.
     */
    destroy: destroy
  };

})();
