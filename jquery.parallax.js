;(function($) {
    'use strict';

    var $window = $(window),
        $elements = null,
        elementsArr,
        scrollTop,
        windowHeight,
        ticking = false,
        isTouchDevice = window.Modernizr && typeof(Modernizr.touchevents) != 'undefined' ? Modernizr.touchevents : testTouchEvents();

    function testTouchEvents() {
        return 'ontouchstart' in window // works on most browsers
            || 'onmsgesturechange' in window; // works on ie10
    }

    $.fn.parallax = function(method) {
        switch (method) {
            case 'reset':
                this.css('transform', '');
                break;
            case 'destroy':
                $elements.not(this);
                break;
            default:
                if (!isTouchDevice) {
                    if ($elements === null) {
                        $elements = this;
                        window.onscroll = onScroll;
                    }
                    else {
                        $elements.add(this);
                    }
                    updateElementsArray();
                }
        }
        return this;
    };

    function onScroll() {
        requestTick();
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(animateElements);
            ticking = true;
        }
    }

    function animateElements() {
        scrollTop = $window.scrollTop();
        windowHeight = $window.height();

        for (var i=0; i<elementsArr.length; i++) {
            animateElement.call(elementsArr[i].el, elementsArr[i].parallax);
        }

        ticking = false;
    }

    function animateElement(parallax){
        var transform = '';
        if (parallax.translateX) {
            transform += ' translate3d(' + parallax.translateX.call(this) + 'px,' + parallax.translateY.call(this)  + 'px,' + parallax.translateZ.call(this) + 'px)';
        }
        if (parallax.scale) {
            transform += ' scale(' + parallax.scale.call(this) + ')';
        }
        if (parallax.rotate) {
            transform += ' rotate(' + parallax.rotate.call(this) + ')'
        }
        this.style['-webkit-transform'] = transform;
        this.style['-moz-transform'] = transform;
        this.style['-ms-transform'] = transform;
        this.style['-o-transform'] = transform;
        this.style.transform = transform;
        if (parallax.opacity) {
            this.style.opacity = parallax.opacity.call(this);
        }
    }

    function updateElementsArray() {
        var arr = $elements.toArray();
        elementsArr = [];
        for (var i=0; i<arr.length; i++) {
            var el = arr[i],
                $el = $(el),
                parallax = {};
            if ($el.data('parallax-x') || $el.data('parallax-y') || $el.data('parallax-z')) {
                parallax = $.extend(parallax, {
                    translateX: getTranslateFunc.call(el, $el.data('parallax-x'), function() {
                        return getTranslateXYZ.call(this, 12, 4);
                    }),
                    translateY: getTranslateFunc.call(el, $el.data('parallax-y'), function() {
                        return getTranslateXYZ.call(this, 13, 5);
                    }),
                    translateZ: getTranslateFunc.call(el, $el.data('parallax-z'), function() {
                        return getTranslateXYZ.call(this, 14);
                    })
                });
            }
            elementsArr.push({
                el: arr[i],
                parallax: parallax
            });
        }
    }

    function getTranslateFunc(options, valueFunc) {
        switch (typeof(options)) {
            case "number":
                options = {
                    speed: options
                };
            case "object":
                var start = options.start || 0,
                    end = options.end || Number.MAX_SAFE_INTEGER,
                    speed = options.speed || 0.5;
                return function() {
                    if (scrollTop >= start && scrollTop <= end) {
                        return ((scrollTop - start) * speed).toFixed(2);
                    }
                };
            case "string":
                if (options == "dynamic") {
                    return function () {
                        valueFunc.call(this);
                    };
                }
            case "undefined":
                var value = valueFunc.call(this);
                return function() {
                    return value;
                };
        }
    }

    function getTranslateXYZ(mat3dIdx, matIdx) {
        if (!window.getComputedStyle) return;
        var style = getComputedStyle(this),
            transform = style.transform || style.webkitTransform || style.mozTransform;
        var mat = transform.match(/^matrix3d\((.+)\)$/);
        if(mat) return parseFloat(mat[1].split(', ')[mat3dIdx]);
        else if (arguments.length < 3) return 0;
        mat = transform.match(/^matrix\((.+)\)$/);
        return mat ? parseFloat(mat[1].split(', ')[matIdx]) : 0;
    }

    if (!isTouchDevice) {
        $(function() {

            $('[data-parallax-x],[data-parallax-y],[data-parallax-z]').parallax();

        });
    }

})(jQuery);
