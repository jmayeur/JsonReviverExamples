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
                return Generic_toJSON('CtorObject', this);
            };

            CtorObject.fromJSON = function(value){
                return Generic_fromJSON(CtorObject, value.data);
            };

            Reviver.constructors.CtorObject = CtorObject;

            specialObject = new CtorObject('The special first value', 'The special second value', 1874, false, 'The last string');

            expect(specialObject instanceof CtorObject).toBeTruthy();

            jsonString = JSON.stringify(specialObject);

            revivedObject = JSON.parse(jsonString, Reviver);
            expect(revivedObject instanceof CtorObject).toBeTruthy();

            expect(revivedObject).toEqual(specialObject);
        });



        /*Generic Reviver/ToJSON/FromJSON functions
        * via http://stackoverflow.com/questions/8111446/turning-json-strings-into-objects-with-methods
        *
        * */

        function Reviver(key, value) {
            var ctor;


            if (typeof value === "object" &&
                typeof value.ctor === "string" &&
                typeof value.data !== "undefined") {
                ctor = Reviver.constructors[value.ctor] || window[value.ctor];
                if (typeof ctor === "function" &&
                    typeof ctor.fromJSON === "function") {
                        return ctor.fromJSON(value);
                }
            }
            return value;
        }

        Reviver.constructors = {};

        function Generic_toJSON(ctorName, obj, keys) {
            var data, index, key;

            if (!keys) {
                keys = Object.keys(obj); // Only "own" properties are included
            }

            data = {};
            for (index = 0; index < keys.length; ++index) {
                key = keys[index];
                data[key] = obj[key];
            }
            return {ctor: ctorName, data: data};
        }

        function Generic_fromJSON(ctor, data) {
            var obj, name;

            obj = new ctor();
            for (name in data) {
                obj[name] = data[name];
            }
            return obj;
        }

    });

}());