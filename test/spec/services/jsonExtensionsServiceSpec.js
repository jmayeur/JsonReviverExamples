(function () {
    'use strict';


    describe('Service: JsonExtensionSerivce', function () {

        var jsonExtensionsSerivceInstance;

        // load the controller's module
        beforeEach(function () {
            module('json-extensions');
            inject(function (JsonExtensionsService) {
                jsonExtensionsSerivceInstance = JsonExtensionsService;
            });
        });


        it('Should allow you to add a constructor to the cache', function () {

            var myFunc, ret;

            myFunc = function () {

            };

            jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', myFunc);
            ret = jsonExtensionsSerivceInstance.getRevivableCtor('myFunc');
            expect(ret).toEqual(myFunc);
        });

        it('Should allow you to delete a constructor to the cache', function () {

            var myFunc, ret;

            myFunc = function () {

            };

            jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', myFunc);
            ret = jsonExtensionsSerivceInstance.getRevivableCtor('myFunc');
            expect(ret).toEqual(myFunc);

            jsonExtensionsSerivceInstance.removeRevivableCtor('myFunc');
            ret = jsonExtensionsSerivceInstance.getRevivableCtor('myFunc');
            expect(ret).toBeUndefined();

        });


        it('Should throw an error if a non-ctor is provided to the cache', function () {

            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', 1)
            }).toThrow('Param [ctor] must be a Constructor function.');
            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', true)
            }).toThrow('Param [ctor] must be a Constructor function.');
            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', 'ssdfosdfsdf')
            }).toThrow('Param [ctor] must be a Constructor function.');
            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', {})
            }).toThrow('Param [ctor] must be a Constructor function.');
            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', [])
            }).toThrow('Param [ctor] must be a Constructor function.');
            expect(function () {
                jsonExtensionsSerivceInstance.addRevivableCtor('myFunc', function () {
                })
            }).not.toThrow('Param [ctor] must be a Constructor function.');

        });

        it('Should tag the object to JSON stringify with the provided ctor name when genericToJson is called', function () {

            var TestCtor, testObj, wrappedObj;

            TestCtor = function TestCtor(one) {
                this.one = one;
            };

            testObj = new TestCtor('One Value');
            wrappedObj = jsonExtensionsSerivceInstance.genericToJson('TestCtor', testObj);

            expect(wrappedObj.ctor).toEqual('TestCtor');
            expect(wrappedObj.data).toBeDefined();

            Object.keys(wrappedObj.data).forEach(function (key) {
                expect(wrappedObj.data[key]).toEqual(testObj[key]);
            });

        });

        it('Should revive an object with the provided data when genericFromJson is called', function () {

            var TestCtor, testWrappedObj, unWrappedObj, expectedObj;

            TestCtor = function TestCtor(one) {
                this.one = one;
            };

            expectedObj = new TestCtor('One Value');

            testWrappedObj = {
                ctor: 'testCtor',
                data: {
                    one: expectedObj.one
                }
            };

            unWrappedObj = jsonExtensionsSerivceInstance.genericFromJson(TestCtor, testWrappedObj.data);

            expect(unWrappedObj).toEqual(expectedObj);

        });

        it('Should use the genericReviver if it ctor is found', function () {
            var TestCtor, testWrappedObj, expectedObj, customFromJsonCalled;

            customFromJsonCalled = false;

            TestCtor = function TestCtor(one) {
                this.one = one;
            };

            TestCtor.fromJSON = function () {
                customFromJsonCalled = true;
                return null;
            };

            expectedObj = new TestCtor('One Value');

            testWrappedObj = {
                ctor: 'TestCtor',
                data: {
                    one: expectedObj.one
                }
            };

            //must add the handler in
            jsonExtensionsSerivceInstance.addRevivableCtor('TestCtor', TestCtor);
            var result = jsonExtensionsSerivceInstance.genericReviver(null, testWrappedObj);

            expect(customFromJsonCalled).toBeTruthy();
            expect(result).toBeNull();

        });
    });

}());