'use strict';

exports.__esModule = true;

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaTemplating = require('aurelia-templating');

var _aureliaTaskQueue = require('aurelia-task-queue');

var _aureliaFramework = require('aurelia-framework');

var _configure = require('./configure');

var GoogleMaps = (function () {
    var _instanceInitializers = {};

    _createDecoratedClass(GoogleMaps, [{
        key: 'address',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return null;
        },
        enumerable: true
    }, {
        key: 'longitude',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 0;
        },
        enumerable: true
    }, {
        key: 'latitude',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 0;
        },
        enumerable: true
    }, {
        key: 'zoom',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 8;
        },
        enumerable: true
    }, {
        key: 'disableDefaultUI',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return false;
        },
        enumerable: true
    }, {
        key: 'markers',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return [];
        },
        enumerable: true
    }], null, _instanceInitializers);

    function GoogleMaps(element, taskQueue, config, bindingEngine) {
        _classCallCheck(this, _GoogleMaps);

        _defineDecoratedPropertyDescriptor(this, 'address', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'longitude', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'latitude', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'zoom', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'disableDefaultUI', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'markers', _instanceInitializers);

        this.map = null;
        this._renderedMarkers = [];
        this._scriptPromise = null;
        this._markersSubscription = null;

        this.element = element;
        this.taskQueue = taskQueue;
        this.config = config;
        this.bindingEngine = bindingEngine;

        if (!config.get('apiScript')) {
            console.error('No API script is defined.');
        }

        if (!config.get('apiKey')) {
            console.error('No API key has been specified.');
        }

        this.loadApiScript();
    }

    GoogleMaps.prototype.attached = function attached() {
        var _this = this;

        this.element.addEventListener('dragstart', function (evt) {
            evt.preventDefault();
        });

        this._scriptPromise.then(function () {
            var latLng = new google.maps.LatLng(parseFloat(_this.latitude), parseFloat(_this.longitude));

            var options = {
                center: latLng,
                zoom: parseInt(_this.zoom, 10),
                disableDefaultUI: _this.disableDefaultUI
            };

            _this.map = new google.maps.Map(_this.element, options);

            _this.map.addListener('click', function (e) {
                var changeEvent = undefined;
                if (window.CustomEvent) {
                    changeEvent = new CustomEvent('map-click', {
                        detail: e,
                        bubbles: true
                    });
                } else {
                    changeEvent = document.createEvent('CustomEvent');
                    changeEvent.initCustomEvent('map-click', true, true, { data: e });
                }

                _this.element.dispatchEvent(changeEvent);
            });
        });
    };

    GoogleMaps.prototype.renderMarker = function renderMarker(latitude, longitude) {
        var _this2 = this;

        var markerLatLng = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));

        this._scriptPromise.then(function () {
            _this2.createMarker({
                map: _this2.map,
                position: markerLatLng
            }).then(function (marker) {
                _this2._renderedMarkers.push(marker);
            });
        });
    };

    GoogleMaps.prototype.geocodeAddress = function geocodeAddress(address, geocoder) {
        var _this3 = this;

        this._scriptPromise.then(function () {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    _this3.setCenter(results[0].geometry.location);

                    _this3.createMarker({
                        map: _this3.map,
                        position: results[0].geometry.location
                    });
                }
            });
        });
    };

    GoogleMaps.prototype.getCurrentPosition = function getCurrentPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                return Promise.resolve(position);
            }, function (evt) {
                return Promise.reject(evt);
            });
        } else {
            return Promise.reject('Browser Geolocation not supported or found.');
        }
    };

    GoogleMaps.prototype.loadApiScript = function loadApiScript() {
        var _this4 = this;

        if (this._scriptPromise) {
            return this._scriptPromise;
        }

        if (window.google === undefined || window.google.maps === undefined) {
            var _ret = (function () {
                var script = document.createElement('script');

                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.src = _this4.config.get('apiScript') + '?key=' + _this4.config.get('apiKey') + '&callback=myGoogleMapsCallback';
                document.body.appendChild(script);

                _this4._scriptPromise = new Promise(function (resolve, reject) {
                    window.myGoogleMapsCallback = function () {
                        resolve();
                    };

                    script.onerror = function (error) {
                        reject(error);
                    };
                });

                return {
                    v: _this4._scriptPromise
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
    };

    GoogleMaps.prototype.setOptions = function setOptions(options) {
        if (!this.map) {
            return;
        }

        this.map.setOptions(options);
    };

    GoogleMaps.prototype.createMarker = function createMarker(options) {
        return this._scriptPromise.then(function () {
            return Promise.resolve(new google.maps.Marker(options));
        });
    };

    GoogleMaps.prototype.getCenter = function getCenter() {
        var _this5 = this;

        this._scriptPromise.then(function () {
            return Promise.resolve(_this5.map.getCenter());
        });
    };

    GoogleMaps.prototype.setCenter = function setCenter(latLong) {
        var _this6 = this;

        this._scriptPromise.then(function () {
            _this6.map.setCenter(latLong);
        });
    };

    GoogleMaps.prototype.updateCenter = function updateCenter() {
        var _this7 = this;

        this._scriptPromise.then(function () {
            var latLng = new google.maps.LatLng(parseFloat(_this7.latitude), parseFloat(_this7.longitude));
            _this7.setCenter(latLng);
        });
    };

    GoogleMaps.prototype.addressChanged = function addressChanged(newValue) {
        var _this8 = this;

        this._scriptPromise.then(function () {
            var geocoder = new google.maps.Geocoder();

            _this8.taskQueue.queueMicroTask(function () {
                _this8.geocodeAddress(newValue, geocoder);
            });
        });
    };

    GoogleMaps.prototype.latitudeChanged = function latitudeChanged(newValue) {
        var _this9 = this;

        this._scriptPromise.then(function () {
            _this9.taskQueue.queueMicroTask(function () {
                _this9.updateCenter();
            });
        });
    };

    GoogleMaps.prototype.longitudeChanged = function longitudeChanged(newValue) {
        var _this10 = this;

        this._scriptPromise.then(function () {
            _this10.taskQueue.queueMicroTask(function () {
                _this10.updateCenter();
            });
        });
    };

    GoogleMaps.prototype.zoomChanged = function zoomChanged(newValue) {
        var _this11 = this;

        this._scriptPromise.then(function () {
            _this11.taskQueue.queueMicroTask(function () {
                var zoomValue = parseInt(newValue, 10);
                _this11.map.setZoom(zoomValue);
            });
        });
    };

    GoogleMaps.prototype.markersChanged = function markersChanged(newValue) {
        var _this12 = this;

        if (null !== this._markersSubscription) {
            this._markersSubscription.dispose();

            for (var _iterator = this._renderedMarkers, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var marker = _ref;

                marker.setMap(null);
            }

            this._renderedMarkers = [];
        }

        this._markersSubscription = this.bindingEngine.collectionObserver(this.markers).subscribe(function (splices) {
            _this12.markerCollectionChange(splices);
        });

        this._scriptPromise.then(function () {
            for (var _iterator2 = newValue, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                var marker = _ref2;

                _this12.renderMarker(marker.latitude, marker.longitude);
            }
        });
    };

    GoogleMaps.prototype.markerCollectionChange = function markerCollectionChange(splices) {
        for (var _iterator3 = splices, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                _ref3 = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                _ref3 = _i3.value;
            }

            var splice = _ref3;

            if (splice.removed.length) {
                for (var _iterator4 = splice.removed, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                    var _ref4;

                    if (_isArray4) {
                        if (_i4 >= _iterator4.length) break;
                        _ref4 = _iterator4[_i4++];
                    } else {
                        _i4 = _iterator4.next();
                        if (_i4.done) break;
                        _ref4 = _i4.value;
                    }

                    var removedObj = _ref4;

                    for (var markerIndex in this._renderedMarkers) {
                        if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                            var renderedMarker = this._renderedMarkers[markerIndex];

                            if (renderedMarker.position.lat() == removedObj.latitude && renderedMarker.position.lng() == removedObj.longitude) {
                                renderedMarker.setMap(null);

                                this._renderedMarkers.splice(markerIndex, 1);
                                break;
                            }
                        }
                    }
                }
            }

            if (splice.addedCount) {
                var addedMarker = this.markers[splice.index];

                this.renderMarker(addedMarker.latitude, addedMarker.longitude);
            }
        }
    };

    GoogleMaps.prototype.error = function error() {
        console.log.apply(console, arguments);
    };

    var _GoogleMaps = GoogleMaps;
    GoogleMaps = _aureliaDependencyInjection.inject(Element, _aureliaTaskQueue.TaskQueue, _configure.Configure, _aureliaFramework.BindingEngine)(GoogleMaps) || GoogleMaps;
    GoogleMaps = _aureliaTemplating.customElement('google-map')(GoogleMaps) || GoogleMaps;
    return GoogleMaps;
})();

exports.GoogleMaps = GoogleMaps;