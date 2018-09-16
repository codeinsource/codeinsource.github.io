/*global jQuery */

var Typer = function(element) {
    this.element = element;
    var delim = element.dataset.delim || ","; // default to comma
    var words = element.dataset.words || "override these,sample typing";
    this.words = words.split(delim).filter(function(v){return v;}); // non empty words
    this.delay = element.dataset.delay || 200;
    this.loop = element.dataset.loop || "true";
    this.deleteDelay = element.dataset.deletedelay || element.dataset.deleteDelay || 800;

    this.progress = { word:0, char:0, building:true, atWordEnd:false, looped: 0 };
    this.typing = true;

    var colors = element.dataset.colors || "black";
    this.colors = colors.split(",");
    this.element.style.color = this.colors[0];
    this.colorIndex = 0;

    this.doTyping();
};

Typer.prototype.start = function() {
    if (!this.typing) {
        this.typing = true;
        this.doTyping();
    }
};
Typer.prototype.stop = function() {
    this.typing = false;
};
Typer.prototype.doTyping = function() {
    var e = this.element;
    var p = this.progress;
    var w = p.word;
    var c = p.char;
    var currentDisplay = [...this.words[w]].slice(0, c).join("");
    p.atWordEnd = false;
    if (this.cursor) {
        this.cursor.element.style.opacity = "1";
        this.cursor.on = true;
        clearInterval(this.cursor.interval);
        var itself = this.cursor;
        this.cursor.interval = setInterval(function() {itself.updateBlinkState();}, 400);
    }

    e.innerHTML = currentDisplay;

    if (p.building) {
        if (p.char == [...this.words[w]].length) {
            p.building = false;
            p.atWordEnd = true;
        } else {
            p.char += 1;
        }
    } else {
        if (p.char == 0) {
            p.building = true;
            p.word = (p.word + 1) % this.words.length;
            this.colorIndex = (this.colorIndex + 1) % this.colors.length;
            this.element.style.color = this.colors[this.colorIndex];
        } else {
            p.char -= 1;
        }
    }

    if(p.atWordEnd) p.looped += 1;

    if(!p.building && (this.loop == "false" || this.loop <= p.looped) ){
        this.typing = false;
    }

    var myself = this;
    setTimeout(function() {
        if (myself.typing) { myself.doTyping(); };
    }, p.atWordEnd ? this.deleteDelay : this.delay);
};

var Cursor = function(element) {
    this.element = element;
    this.cursorDisplay = element.dataset.cursordisplay || "_";
    element.innerHTML = this.cursorDisplay;
    this.on = true;
    element.style.transition = "all 0.1s";
    var myself = this;
    this.interval = setInterval(function() {
        myself.updateBlinkState();
    }, 400);
}
Cursor.prototype.updateBlinkState = function() {
    if (this.on) {
        this.element.style.opacity = "0";
        this.on = false;
    } else {
        this.element.style.opacity = "1";
        this.on = true;
    }
}

function TyperSetup() {
    var typers = {};
    var elements = document.getElementsByClassName("typer");
    for (var i = 0, e; e = elements[i++];) {
        typers[e.id] = new Typer(e);
    }
    var elements = document.getElementsByClassName("typer-stop");
    for (var i = 0, e; e = elements[i++];) {
        let owner = typers[e.dataset.owner];
        e.onclick = function(){owner.stop();};
    }
    var elements = document.getElementsByClassName("typer-start");
    for (var i = 0, e; e = elements[i++];) {
        let owner = typers[e.dataset.owner];
        e.onclick = function(){owner.start();};
    }

    var elements2 = document.getElementsByClassName("cursor");
    for (var i = 0, e; e = elements2[i++];) {
        let t = new Cursor(e);
        t.owner = typers[e.dataset.owner];
        t.owner.cursor = t;
    }
}

TyperSetup();


/*!
* Lettering.JS 0.7.0
*
* Copyright 2010, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Thanks to Paul Irish - http://paulirish.com - for the feedback.
*
* Date: Mon Sep 20 17:14:00 2010 -0600
*/
(function ($) {
    function injector(t, splitter, klass, after) {
        var text = t.text()
            , a = text.split(splitter)
            , inject = '';
        if (a.length) {
            $(a).each(function (i, item) {
                inject += '<span class="' + klass + (i + 1) + '" aria-hidden="true">' + item + '</span>' + after;
            });
            t.attr('aria-label', text)
                .empty()
                .append(inject)

        }
    }


    var methods = {
        init: function () {

            return this.each(function () {
                injector($(this), '', 'char', '');
            });

        },

        words: function () {

            return this.each(function () {
                injector($(this), ' ', 'word', ' ');
            });

        },

        lines: function () {

            return this.each(function () {
                var r = "eefec303079ad17405c889e092e105b0";
                // Because it's hard to split a <br/> tag consistently across browsers,
                // (*ahem* IE *ahem*), we replace all <br/> instances with an md5 hash
                // (of the word "split").  If you're trying to use this plugin on that
                // md5 hash string, it will fail because you're being ridiculous.
                injector($(this).children("br").replaceWith(r).end(), r, 'line', '');
            });

        }
    };

    $.fn.lettering = function (method) {
        // Method calling logic
        if (method && methods[method]) {
            return methods[method].apply(this, [].slice.call(arguments, 1));
        } else if (method === 'letters' || !method) {
            return methods.init.apply(this, [].slice.call(arguments, 0)); // always pass an array
        }
        $.error('Method ' + method + ' does not exist on jQuery.lettering');
        return this;
    };

})(jQuery);

/*
 * textillate.js
 * http://jschr.github.com/textillate
 * MIT licensed
 *
 * Copyright (C) 2012-2013 Jordan Schroter
 */

(function ($) {
    "use strict";

    function isInEffect(effect) {
        return /In/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.inEffects) >= 0;
    };

    function isOutEffect(effect) {
        return /Out/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.outEffects) >= 0;
    };


    function stringToBoolean(str) {
        if (str !== "true" && str !== "false") return str;
        return (str === "true");
    };

    // custom get data api method
    function getData(node) {
        var attrs = node.attributes || []
            , data = {};

        if (!attrs.length) return data;

        $.each(attrs, function (i, attr) {
            var nodeName = attr.nodeName.replace(/delayscale/, 'delayScale');
            if (/^data-in-*/.test(nodeName)) {
                data.in = data.in || {};
                data.in[nodeName.replace(/data-in-/, '')] = stringToBoolean(attr.nodeValue);
            } else if (/^data-out-*/.test(nodeName)) {
                data.out = data.out || {};
                data.out[nodeName.replace(/data-out-/, '')] = stringToBoolean(attr.nodeValue);
            } else if (/^data-*/.test(nodeName)) {
                data[nodeName.replace(/data-/, '')] = stringToBoolean(attr.nodeValue);
            }
        })

        return data;
    }

    function shuffle(o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) ;
        return o;
    }

    function animate($t, effect, cb) {
        $t.addClass('animated ' + effect)
            .css('visibility', 'visible')
            .show();

        $t.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $t.removeClass('animated ' + effect);
            cb && cb();
        });
    }

    function animateTokens($tokens, options, cb) {
        var that = this
            , count = $tokens.length;

        if (!count) {
            cb && cb();
            return;
        }

        if (options.shuffle) $tokens = shuffle($tokens);
        if (options.reverse) $tokens = $tokens.toArray().reverse();

        $.each($tokens, function (i, t) {
            var $token = $(t);

            function complete() {
                if (isInEffect(options.effect)) {
                    $token.css('visibility', 'visible');
                } else if (isOutEffect(options.effect)) {
                    $token.css('visibility', 'hidden');
                }
                count -= 1;
                if (!count && cb) cb();
            }

            var delay = options.sync ? options.delay : options.delay * i * options.delayScale;

            $token.text() ?
                setTimeout(function () {
                    animate($token, options.effect, complete)
                }, delay) :
                complete();
        });
    };

    var Textillate = function (element, options) {
        var base = this
            , $element = $(element);

        base.init = function () {
            base.$texts = $element.find(options.selector);

            if (!base.$texts.length) {
                base.$texts = $('<ul class="texts"><li>' + $element.html() + '</li></ul>');
                $element.html(base.$texts);
            }

            base.$texts.hide();

            base.$current = $('<span>')
                .html(base.$texts.find(':first-child').html())
                .prependTo($element);

            if (isInEffect(options.in.effect)) {
                base.$current.css('visibility', 'hidden');
            } else if (isOutEffect(options.out.effect)) {
                base.$current.css('visibility', 'visible');
            }

            base.setOptions(options);

            base.timeoutRun = null;

            setTimeout(function () {
                base.options.autoStart && base.start();
            }, base.options.initialDelay)
        };

        base.setOptions = function (options) {
            base.options = options;
        };

        base.triggerEvent = function (name) {
            var e = $.Event(name + '.tlt');
            $element.trigger(e, base);
            return e;
        };

        base.in = function (index, cb) {
            index = index || 0;

            var $elem = base.$texts.find(':nth-child(' + ((index || 0) + 1) + ')')
                , options = $.extend(true, {}, base.options, $elem.length ? getData($elem[0]) : {})
                , $tokens;

            $elem.addClass('current');

            base.triggerEvent('inAnimationBegin');
            $element.attr('data-active', $elem.data('id'));

            base.$current
                .html($elem.html())
                .lettering('words');

            // split words to individual characters if token type is set to 'char'
            if (base.options.type == "char") {
                base.$current.find('[class^="word"]')
                    .css({
                        'display': 'inline-block',
                        // fix for poor ios performance
                        '-webkit-transform': 'translate3d(0,0,0)',
                        '-moz-transform': 'translate3d(0,0,0)',
                        '-o-transform': 'translate3d(0,0,0)',
                        'transform': 'translate3d(0,0,0)'
                    })
                    .each(function () {
                        $(this).lettering()
                    });
            }

            $tokens = base.$current
                .find('[class^="' + base.options.type + '"]')
                .css('display', 'inline-block');

            if (isInEffect(options.in.effect)) {
                $tokens.css('visibility', 'hidden');
            } else if (isOutEffect(options.in.effect)) {
                $tokens.css('visibility', 'visible');
            }

            base.currentIndex = index;

            animateTokens($tokens, options.in, function () {
                base.triggerEvent('inAnimationEnd');
                if (options.in.callback) options.in.callback();
                if (cb) cb(base);
            });
        };

        base.out = function (cb) {
            var $elem = base.$texts.find(':nth-child(' + ((base.currentIndex || 0) + 1) + ')')
                , $tokens = base.$current.find('[class^="' + base.options.type + '"]')
                , options = $.extend(true, {}, base.options, $elem.length ? getData($elem[0]) : {})

            base.triggerEvent('outAnimationBegin');

            animateTokens($tokens, options.out, function () {
                $elem.removeClass('current');
                base.triggerEvent('outAnimationEnd');
                $element.removeAttr('data-active');
                if (options.out.callback) options.out.callback();
                if (cb) cb(base);
            });
        };

        base.start = function (index) {
            setTimeout(function () {
                base.triggerEvent('start');

                (function run(index) {
                    base.in(index, function () {
                        var length = base.$texts.children().length;

                        index += 1;

                        if (!base.options.loop && index >= length) {
                            if (base.options.callback) base.options.callback();
                            base.triggerEvent('end');
                        } else {
                            index = index % length;

                            base.timeoutRun = setTimeout(function () {
                                base.out(function () {
                                    run(index)
                                });
                            }, base.options.minDisplayTime);
                        }
                    });
                }(index || 0));
            }, base.options.initialDelay);
        };

        base.stop = function () {
            if (base.timeoutRun) {
                clearInterval(base.timeoutRun);
                base.timeoutRun = null;
            }
        };

        base.init();
    }

    $.fn.textillate = function (settings, args) {
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('textillate')
                ,
                options = $.extend(true, {}, $.fn.textillate.defaults, getData(this), typeof settings == 'object' && settings);

            if (!data) {
                $this.data('textillate', (data = new Textillate(this, options)));
            } else if (typeof settings == 'string') {
                data[settings].apply(data, [].concat(args));
            } else {
                data.setOptions.call(data, options);
            }
        })
    };

    $.fn.textillate.defaults = {
        selector: '.texts',
        loop: false,
        minDisplayTime: 2000,
        initialDelay: 0,
        in: {
            effect: 'fadeInLeftBig',
            delayScale: 1.5,
            delay: 50,
            sync: false,
            reverse: false,
            shuffle: false,
            callback: function () {
            }
        },
        out: {
            effect: 'hinge',
            delayScale: 1.5,
            delay: 50,
            sync: false,
            reverse: false,
            shuffle: false,
            callback: function () {
            }
        },
        autoStart: true,
        inEffects: [],
        outEffects: ['hinge'],
        callback: function () {
        },
        type: 'char'
    };

}(jQuery));


(function ($) {
    $(document).ready(function () {

        var inEffects = [
            "flash",
            "bounce",
            "shake",
            "tada",
            "swing",
            "wobble",
            "pulse",
            "flip",
            "flipInX",
            "flipInY",
            "fadeIn",
            "fadeInUp",
            "fadeInDown",
            "fadeInLeft",
            "fadeInRight",
            "fadeInUpBig",
            "fadeInDownBig",
            "fadeInLeftBig",
            "fadeInRightBig",
            "bounceIn",
            "bounceInDown",
            "bounceInUp",
            "bounceInLeft",
            "bounceInRight",
            "rotateIn",
            "rotateInDownLeft",
            "rotateInDownRight",
            "rotateInUpLeft",
            "rotateInUpRight",
            "rollIn"
        ];

        var outEffects = [
            "flash",
            "bounce",
            "shake",
            "tada",
            "swing",
            "wobble",
            "pulse",
            "flip",
            "flipOutX",
            "flipOutY",
            "fadeOut",
            "fadeOutUp",
            "fadeOutDown",
            "fadeOutLeft",
            "fadeOutRight",
            "fadeOutUpBig",
            "fadeOutDownBig",
            "fadeOutLeftBig",
            "fadeOutRightBig",
            "bounceOut",
            "bounceOutDown",
            "bounceOutUp",
            "bounceOutLeft",
            "bounceOutRight",
            "rotateOut",
            "rotateOutDownLeft",
            "rotateOutDownRight",
            "rotateOutUpLeft",
            "rotateOutUpRight",
            "hinge",
            "rollOut"];


        var switchText = function(type) {
            var $active = $('.our-company .text h2.active');

            var inEffect = inEffects[Math.floor(Math.random() * inEffects.length)];
            var outEffect = outEffects[Math.floor(Math.random() * outEffects.length)];

            if(type == 'in') {
                $active.textillate({
                    autoStart: false,
                    loop: false,
                    in: {
                        effect: inEffect,
                        shuffle: true,
                    }
                });
                $active.textillate('in');
            } else if(type == 'out') {

                var $next = $active.next().length > 0 ? $active.next() : $('.our-company .text h2').eq(0);

                $active.textillate({
                    autoStart: false,
                    loop: false,
                    out: {
                        effect: outEffect,
                        shuffle: true,
                        callback: function(e) {
                            $active.removeClass('active');
                            $next.addClass('active');
                        }
                    },
                });
                $active.textillate('out');

                $next.textillate({
                    autoStart: false,
                    loop: false,
                    in: {
                        effect: inEffect,
                        shuffle: true
                    }
                });
                $next.textillate('in');
            }
        }

        switchText('in');

        setInterval(function () {
            switchText('out');
        }, 4000);

        var matrix = document.getElementById('matrix')

        if(matrix) {
            var context = matrix.getContext('2d')
            matrix.height = matrix.offsetHeight
            matrix.width = matrix.offsetWidth
            var drop = []
            var font_size = 16
            var columns = matrix.width / font_size
            for (var i = 0; i < columns; i++)
                drop[i] = 1;

            function drawMatrix() {

                context.fillStyle = 'rgba(0, 0, 0, 0.1)'
                context.fillRect(0, 0, matrix.width, matrix.height)

                context.fillStyle = 'green'
                context.font = font_size + 'px'
                for (var i = 0; i < columns; i++) {
                    context.fillText(Math.floor(Math.random() * 2), i * font_size, drop[i] * font_size)
                    /*get 0 and 1*/

                    if (drop[i] * font_size > (matrix.height * 2 / 3) && Math.random() > 0.85)/*reset*/
                        drop[i] = 0
                    drop[i]++
                }
            }

            setInterval(drawMatrix, 40);

            setInterval(function(){
                var $active = $('.our-core .item.active');
                var $next = $active.next().length > 0 ? $active.next() : $('.our-core .item').eq(0);

                $active.removeClass('active');
                $next.addClass('active');

            }, 3000);

        }









    });

    window.onload = function() {
        var mapLength = document.getElementsByTagName('circle').length - 1;

        if(mapLength <= 0)
            return false;

        var currentCircle = "";
        var previousCircle = "";

        function rnd(a, z) {
            return Math.floor(Math.random() * (z - a) + a);
        }


        var randomCircle = rnd(0, mapLength);
        currentCircle = randomCircle;
        var a = document.getElementsByTagName('circle')[currentCircle];
        previousCircle = currentCircle;

        var circleCloneFirst = a.cloneNode(true);
        var circleCloneSecond = a.cloneNode(true);
        var circleCloneThird = a.cloneNode(true);
        a.classList.add("active");
        circleCloneFirst.classList.add("active-first");
        circleCloneSecond.classList.add("active-second");
        circleCloneThird.classList.add("active-third");
        circleCloneFirst.classList.remove("active");
        circleCloneSecond.classList.remove("active");
        circleCloneThird.classList.remove("active");
        circleCloneFirst.setAttribute('r', 10);
        circleCloneSecond.setAttribute('r', 14);
        circleCloneThird.setAttribute('r', 18);
        document.getElementsByClassName('b-header__map')[0].appendChild(circleCloneFirst);
        document.getElementsByClassName('b-header__map')[0].appendChild(circleCloneSecond);
        document.getElementsByClassName('b-header__map')[0].appendChild(circleCloneThird);


        (function(){

            if (previousCircle!="") {
                document.getElementsByTagName('circle')[previousCircle].classList.remove("active");
            }
            var randomCircle = rnd(0, mapLength);
            currentCircle = randomCircle;
            var a = document.getElementsByTagName('circle')[currentCircle];
            a.classList.add("active");

            circleCloneFirst.setAttribute('cx', a.getAttribute('cx'));
            circleCloneSecond.setAttribute('cx', a.getAttribute('cx'));
            circleCloneThird.setAttribute('cx', a.getAttribute('cx'));
            circleCloneFirst.setAttribute('cy', a.getAttribute('cy'));
            circleCloneSecond.setAttribute('cy', a.getAttribute('cy'));
            circleCloneThird.setAttribute('cy', a.getAttribute('cy'));

            previousCircle = currentCircle;
            setTimeout(arguments.callee, 3000);
        })();
    }

})(jQuery);