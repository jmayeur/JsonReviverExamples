(function (angular) {
    'use strict';

    angular.module('json-extensions', []).factory('JsonExtensionsService', function () {
        var jsonExtensionsInstance, constructorCache;

        constructorCache = {};

        jsonExtensionsInstance = {
            genericReviver: function (key, value) {

                var _ctor, _revivedObj, _revived;

                _revived = false;

                if (typeof value === "object" &&
                    typeof value.ctor === "string" &&
                    typeof value.data !== "undefined") {
                    _ctor = constructorCache[value.ctor];
                    if (typeof _ctor === "function" &&
                        typeof _ctor.fromJSON === "function") {
                        _revivedObj = _ctor.fromJSON(value);
                        _revived = true;
                    }
                }

                return (_revived) ? _revivedObj : value;
            },

            addRevivableCtor: function (ctorName, ctor) {
                if (typeof ctor === "function") {
                    try {
                        ctorName = ctorName || new ctor().constructor;
                        constructorCache[ctorName] = ctor;
                    }
                    catch (e) {
                        throw new Error('Param [ctor] must be a Constructor function.');
                    }
                }
                else {
                    throw new Error('Param [ctor] must be a Constructor function.');
                }
            },

            removeRevivableCtor: function (ctorName) {
                delete constructorCache[ctorName];
            },

            getRevivableCtor: function (ctorName) {
                return constructorCache[ctorName];
            },

            genericToJson: function (ctorName, obj, keys) {
                var data;

                keys = keys || Object.keys(obj);
                data = {};

                //move to forEach based on http://jsperf.com/object-keys-vs-hasownproperty/4
                keys.forEach(function (key) {
                    data[key] = obj[key];
                });

                return {ctor: ctorName, data: data};
            },

            genericFromJson: function (ctor, data) {
                var obj, keys;

                obj = new ctor();
                keys = Object.keys(data);
                keys.forEach(function (key) {
                    obj[key] = data[key];
                });

                return obj;
            }
        };

        return jsonExtensionsInstance;

    });

}(angular));