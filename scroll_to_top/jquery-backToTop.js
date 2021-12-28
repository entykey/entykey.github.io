/**
 * jquery-backToTop
 *
 * @license MIT
 * @author Pablo Pizarro @ppizarror.com
 */

;(function (factory) {
    /** @namespace define.amd */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module
        define(['jquery'], factory)
    } else {
        // Browser globals
        factory(jQuery)
    }
}(function ($) {
    "use scrict";

    /**
     * BackToTop class
     *
     * @class
     * @param {object=} options - Initial creation options
     * @private
     */
    let _BackToTop = function (options) {

        /**
         * Version
         * @type {string}
         * @private
         */
        this._version = '0.2.3';

        /**
         * Saves body selector
         * @type {jQuery | JQuery | HTMLElement}
         * @private
         */
        this._body = $('body');

        /**
         * Default options
         * @private
         * @since 0.0.1
         */
        let _defaults = {
            backgroundColor: '#5D5D5D',         // [theme] Background color of the backToTop
            bottom: 20,                         // Bottom position (px)
            color: '#FFFFFF',                   // [theme] Text color
            container: this._body,              // Container of the object
            divFloat: 'right',                  // Float left,right
            effect: 'spin',                     // Effect of the button
            enabled: true,                      // backToTop enabled when created
            height: 70,                         // Height of the button (px)
            icon: 'fas fa-chevron-up',          // [theme] Font-awesome icon
            left: 20,                           // Left fixed position (px)
            pxToTrigger: 600,                   // Scroll px to trigger the backToTop
            right: 20,                          // Right fixed position (px)
            scrollAnimation: 0,                 // Scroll animation
            theme: 'default',                   // Theme of the button
            width: 70,                          // Width of the button (px)
            zIndex: 999,                        // z-Index of the div
        };
        this._options = $.extend(_defaults, options);

        /**
         * backToTop main div
         * @type {jQuery | HTMLElement | JQuery | null}
         * @private
         * @since 0.0.1
         */
        this._obj = null;

        /**
         * Indicates the current status of the backToTop
         * @type {boolean}
         * @private
         * @since 0.0.1
         */
        this._opened = false;

        /**
         * Actual button theme
         * @type {string}
         * @private
         * @since 0.0.3
         */
        this._actualTheme = '';

        /**
         * Actual effect theme
         * @private
         * @since 0.0.3
         */
        this._actualEffect = {
            off: '',
            on: '',
        };

        /**
         * Indicates that position is fixed, used for 'body' container
         * @type {boolean}
         * @private
         */
        this._fixed = false;

        /**
         * Indicates that the container is $(window)
         * @type {boolean}
         * @private
         */
        this._isWindowContainer = false;

        /**
         * Saves pointer to object
         * @type {_BackToTop}
         * @private
         * @since 0.0.1
         */
        let self = this;

        /**
         * Generates safe random ID, https://stackoverflow.com/a/2117523
         * @function
         * @returns {string}
         */
        this._randomID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        /**
         * Converts to number
         * @function
         * @param {number | string} n - Number
         * @private
         * @since 0.2.0
         * @returns {number}
         */
        this._parseNumber = function (n) {
            return parseFloat(n.toString());
        };

        /**
         * Throw warn to console
         * @function
         * @param {string} msg - Console warning message
         * @private
         * @since 0.2.0
         */
        this._warn = function (msg) {
            console.warn('jquery-backToTop v' + this._version + ': ' + msg.toString());
        };

        /**
         * Apply a theme to the button
         * @function
         * @param {string} theme - Theme of the button
         * @private
         * @since 0.0.3
         */
        this._applyTheme = function (theme) {

            /**
             * If button is has not been built returns
             */
            if (this._obj === null) return;

            /**
             * If previous theme has been applied
             */
            if (this._actualTheme !== '') {
                this._obj.removeClass(this._actualTheme);
            }

            /**
             * Generates CSS theme name
             */
            this._actualTheme = 'jquery-back-to-top-theme-' + theme;

            /**
             * Apply theme class
             */
            this._obj.addClass(this._actualTheme);

            /**
             * Defines default styles (width,size,color,etc)
             */
            this._obj.css({
                'background-color': this._options.backgroundColor,
                'bottom': this._options.bottom + 'px',
                'color': this._options.color,
                'float': this._options.divFloat,
                'right': this._options.right + 'px',
                'width': this._options.width + 'px',
                'z-index': this._options.zIndex,
            });
            this.resize(this._options.width, this._options.height);

            /**
             * Apply lateral margin
             */
            if (this._options.divFloat === 'right') {
                this._obj.css('right', this._options.right + 'px')
            } else {
                this._obj.css('left', this._options.left + 'px')
            }

            /**
             * Set button position
             */
            if (!this._fixed) {
                this._obj.css('position', 'sticky');
            } else {
                this._obj.css('position', 'fixed');
            }

        };

        /**
         * Resize button
         * @function
         * @param {number} w - Width (px)
         * @param {number} h - Height(px)
         * @since 0.2.1
         */
        this.resize = function (w, h) {
            this._obj.css({
                'height': this._parseNumber(h) + 'px',
                'line-height': this._parseNumber(h) + 'px',
                'width': this._parseNumber(w) + 'px',
            });
        };

        /**
         * Public function that changes button theme
         * @function
         * @param {string} theme - Theme name
         * @since 0.0.6
         */
        this.changeTheme = function (theme) {
            this._options.theme = theme;
            this._applyTheme(theme);
            if (this._opened) this.show(true);
        };

        /**
         * Apply effect
         * @function
         * @param {string} effect - Effect name
         * @private
         * @since 0.0.5
         */
        this._applyEffect = function (effect) {

            /**
             * If button is has not been built returns
             */
            if (this._obj === null) return;

            /**
             * Remove classes if present
             */
            if (this._actualEffect.on !== '') this._obj.removeClass(this._actualEffect.on);
            if (this._actualEffect.off !== '') this._obj.removeClass(this._actualEffect.off);

            /**
             * Create class name
             */
            this._actualEffect.on = 'jquery-back-to-top-status-on jquery-back-to-top-effect-' + effect + '-on';
            this._actualEffect.off = 'jquery-back-to-top-status-off jquery-back-to-top-effect-' + effect + '-off';

        };

        /**
         * Public function that changes button effect
         * @function
         * @param {string} effect - Effect name
         * @since 0.0.6
         */
        this.changeEffect = function (effect) {
            this._options.effect = effect;
            this._applyEffect(effect);
            if (this._opened) this.show(true);
        };

        /**
         * Opens the button
         * @function
         * @param {boolean=} disableEffect - Open with no efect
         * @since 0.0.6
         */
        this.show = function (disableEffect) {
            if (self._options.container.scrollTop() > self._options.pxToTrigger) {
                this._obj.removeClass(this._actualEffect.off);
                if (disableEffect) {
                    this._obj.addClass('jquery-back-to-top-status-on');
                } else {
                    this._obj.addClass(this._actualEffect.on);
                }
                self._opened = true;
            }
        };

        /**
         * Hide the button
         * @function
         * @param {boolean=} disableEffect - Hide with no efect
         * @since 0.0.6
         */
        this.hide = function (disableEffect) {
            this._obj.removeClass(this._actualEffect.on);
            if (disableEffect) {
                this._obj.addClass('jquery-back-to-top-status-off');
            } else {
                this._obj.addClass(this._actualEffect.off);
            }
            self._opened = false;
        };

        /**
         * Toggles the button
         * @function
         * @param {boolean=} disableEffect - Disables the effect
         * @since 0.1.1
         */
        this.toggle = function (disableEffect) {
            if (self._opened) {
                this.hide(disableEffect);
            } else {
                this.show(disableEffect);
            }
        };

        /**
         * Enables/disables the button
         * @function
         * @param {boolean} status - true: enables, false: disables
         * @param {boolean=} disableEffect - Disables the effect
         * @since 0.1.1
         */
        this.enable = function (status, disableEffect) {
            this._options.enabled = status;
            if (!this._options.enabled && this._opened) this.hide(disableEffect);
            if (this._options.enabled && !this._options) this.show(disableEffect);
        };

        /**
         * Check window scroll, if scrolled px is greater than options then open, otherwise close
         * @function
         * @private
         * @since 0.0.4
         */
        this._checkScroll = function () {

            /**
             * Object is disabled
             */
            if (!self._options.enabled) return;

            /**
             * Open-Close depending of the scroll
             */
            if (self._options.container.scrollTop() > self._options.pxToTrigger) { // Open
                if (self._opened) return;
                self.show();
            } else { // Close
                if (!self._opened) return;
                self.hide();
            }

        };

        /**
         * Init main scroll event
         * @function
         * @private
         */
        this._initEvent = function () {

            /**
             * Generates event ID
             */
            let $id = this._randomID();

            /**
             * Apply window scroll event
             */
            self._options.container.on('scroll.' + $id, function () {
                self._checkScroll();
            });

            /**
             * Button click
             */
            this._obj.off('click.backToTop');
            this._obj.on('click.backToTop', function (e) {
                e.preventDefault();
                if (self._options.scrollAnimation === 0) {
                    self._options.container.scrollTop(0);
                } else {
                    if (self._isWindowContainer) { // If window container is used
                        $('html,body').stop().animate({scrollTop: 0}, self._options.scrollAnimation);
                    } else {
                        self._options.container.animate({
                            scrollTop: 0
                        }, self._options.scrollAnimation);
                    }
                }
            });

        };

        /**
         * Init
         */
        if ($(this._options.container).find('.back-to-top-container').length === 0) {

            /**
             * Parse input
             */
            this._options.bottom = this._parseNumber(this._options.bottom);
            this._options.left = this._parseNumber(this._options.left);
            this._options.pxToTrigger = Math.max(0, this._parseNumber(this._options.pxToTrigger));
            this._options.right = this._parseNumber(this._options.right);
            this._options.scrollAnimation = Math.max(0, this._parseNumber(this._options.scrollAnimation));
            this._options.zIndex = this._parseNumber(this._options.zIndex);

            /**
             * Check that parent exists, if not uses body
             */
            if (!(this._options.container instanceof jQuery) || this._options.container.length === 0) {
                this._warn('Container is not jQuery instance or it\'s empty, using container=body and enabled=false');
                this._options.container = this._body;
                this._options.enabled = false;
            }

            /**
             * Check that divFloat is correct
             */
            this._options.divFloat = this._options.divFloat.toLowerCase();
            if (['left', 'right'].indexOf(this._options.divFloat) === -1) {
                this._warn('divFloat=' + this._options.divFloat + ' parameter is not correct. Valid=left,right. Using default parameter=right');
                this._options.divFloat = 'right';
            }

            /**
             * Creates object
             */
            let $id = this._randomID();
            $(this._options.container).append('<div id="' + $id + '" class="jquery-back-to-top"><i class="' + this._options.icon + '"></i></div>');
            self._obj = $('#' + $id);

            /**
             * If container is body changes to window
             */
            if (this._options.container.get(0) === this._body.get(0)) {
                self._isWindowContainer = true;
                self._options.container = $(window);
                self._fixed = true; // fixed instead of sticky
            }

            /**
             * Apply theme and effect
             */
            this._applyTheme(this._options.theme);

            /**
             * Set effects
             */
            this._applyEffect(this._options.effect);

            /**
             * Init events
             */
            this._initEvent();

        }

    };

    /**
     * Create jQuery plugin
     */
    $.backToTop = function (options) {
        return new _BackToTop(options);
    };

}));