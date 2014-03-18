(function(){
    'use strict';


    //ref
    //http://stackoverflow.com/questions/8111446/turning-json-strings-into-objects-with-methods
    describe('JSON serialization', function () {

        var simpleObject, simpleObjectExpectedJson;

        beforeEach(function(){
            simpleObject = {
                fieldOne: 'The special first value',
                fieldTwo: 'The special second value',
                numberField: 1874,
                boolField: false,
                lastString: 'The last string'
            };

            simpleObjectExpectedJson = '{'
                +'"fieldOne":"The special first value",'
                +'"fieldTwo":"The special second value",'
                    +'"numberField":1874,'
                    +'"boolField":false,'
                    +'"lastString":"The last string"'
                    +'}';
        });


        it('Should maintain the same fields and values when an object is JSON.stringify(ed)', function(){

            var jsonString;
            jsonString = JSON.stringify(simpleObject);
            expect(jsonString).toEqual(simpleObjectExpectedJson);

        });

        it('Should be an equatable object when an object JSON.stringify(ed) and revived', function(){

            var jsonString, revivedObject;
            jsonString = JSON.stringify(simpleObject);
            expect(jsonString).toEqual(simpleObjectExpectedJson);

            revivedObject = JSON.parse(jsonString);
            expect(revivedObject).toEqual(simpleObject);

        });



        it('Should not maintain object functions when an object is JSON.stringify(ed)', function(){

            var jsonString, revivedObject, logString;

            logString = 'WhooHoo!';
            simpleObject.someCoolFunction = function(){
                console.log(logString);
            }

            //verify it has the method
            spyOn(console, 'log');
            simpleObject.someCoolFunction();
            expect(console.log).toHaveBeenCalledWith(logString);

            jsonString = JSON.stringify(simpleObject);
            expect(jsonString).toEqual(simpleObjectExpectedJson);

            revivedObject =  JSON.parse(jsonString);
            expect(revivedObject.someCoolFunction).toBeUndefined();

        });


        it('Should maintain the same fields and values with a constructor created object is JSON.stringify(ed)', function(){

            var jsonString, specialObject;
            function CtorObject(fieldOne, fieldTwo, numberField, boolField, lastString){
                this.fieldOne =  fieldOne;
                this.fieldTwo = fieldTwo;
                this.numberField = numberField;
                this.boolField = boolField;
                this.lastString = lastString;
            };

            specialObject = new CtorObject('The special first value', 'The special second value', 1874, false, 'The last string');

            jsonString = JSON.stringify(specialObject);
            expect(jsonString).toBe(simpleObjectExpectedJson);

        });


        it('Should not maintain the same type when a constructor created object is JSON.stringify(ed) and revived', function(){

            var jsonString, specialObject, revivedObject;
            function CtorObject(fieldOne, fieldTwo, numberField, boolField, lastString){
                this.fieldOne =  fieldOne;
                this.fieldTwo = fieldTwo;
                this.numberField = numberField;
                this.boolField = boolField;
                this.lastString = lastString;
            };

            specialObject = new CtorObject('The special first value', 'The special second value', 1874, false, 'The last string');
            expect(specialObject instanceof CtorObject).toBeTruthy();

            jsonString = JSON.stringify(specialObject);
            expect(jsonString).toEqual(simpleObjectExpectedJson);

            revivedObject = JSON.parse(jsonString);
            expect(revivedObject instanceof CtorObject).toBeFalsy();

        });


        it('Should  maintain the same type a constructor created object with a special toJSON function is JSON.stringify(ed) and revived', function(){

            var jsonString, specialObject, revivedObject;
            function CtorObject(fieldOne, fieldTwo, numberField, boolField, lastString){
                this.fieldOne =  fieldOne;
                this.fieldTwo = fieldTwo;
                this.numberField = numberField;
                this.boolField = boolField;
                this.lastString = lastString;
            };

            CtorObject.prototype.toJSON = function(){
                return jsonExtensions.genericToJson('CtorObject', this);
            };

            CtorObject.fromJSON = function(value){
                return jsonExtensions.genericFromJson(CtorObject, value.data);
            };

            jsonExtensions.addRevivableCtor('CtorObject', CtorObject);

            specialObject = new CtorObject('The special first value', 'The special second value', 1874, false, 'The last string');

            expect(specialObject instanceof CtorObject).toBeTruthy();

            jsonString = JSON.stringify(specialObject);

            revivedObject = JSON.parse(jsonString, jsonExtensions.genericReviver);
            expect(revivedObject instanceof CtorObject).toBeTruthy();

            expect(revivedObject).toEqual(specialObject);

            jsonExtensions.removeRevivableCtor('CtorObject')
        });



        /*Generic Reviver/ToJSON/FromJSON functions
        * via http://stackoverflow.com/questions/8111446/turning-json-strings-into-objects-with-methods
        *
        * */

        var jsonExtensions = function(){
            'use strict';

            var constructorCache;

            constructorCache = {}

            return {
                genericReviver: function(key, value){

                    var _ctor, _revivedObj;

                    if (typeof value === "object" &&
                        typeof value.ctor === "string" &&
                        typeof value.data !== "undefined") {
                        _ctor = constructorCache[value.ctor];
                        if (typeof _ctor === "function" &&
                            typeof _ctor.fromJSON === "function") {
                            _revivedObj = _ctor.fromJSON(value);
                        }
                    }

                    return _revivedObj || value;
                },

                addRevivableCtor: function(ctorName, ctor){
                    constructorCache[ctorName] = ctor;
                },

                removeRevivableCtor: function(ctorName){
                    delete constructorCache[ctorName];
                },

                genericToJson: function(ctorName, obj, keys) {
                    var data, index;

                    keys = keys || Object.keys(obj);
                    data = {};

                    //move to forEach based on http://jsperf.com/object-keys-vs-hasownproperty/4
                    keys.forEach(function(key){
                        data[key] = obj[key];
                    });

                    return {ctor: ctorName, data: data};
                },

                genericFromJson: function(ctor, data){
                    var obj, keys;

                    obj = new ctor();
                    keys = Object.keys(data);
                    keys.forEach(function(key){
                        obj[key] = data[key];
                    });

                    return obj;
                }
            }
        }();
    });

}());