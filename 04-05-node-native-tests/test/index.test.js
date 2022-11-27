import { describe, it } from 'node:test';
import { CallTracker, deepStrictEqual } from 'node:assert';

import Controller from '../src/controller.js';
import View from '../src/view.js';

const callTracker = new CallTracker();

process.on('exit', () => callTracker.verify());

const mockedData = [{
  name: 'any_name',
  image: 'any_image',
  age: 0,
  birthDay: new Date(),
}, {
  name: 'any_name_with_smith',
  image: 'any_image',
  age: 0,
  birthDay: new Date(),
}];

describe('Unit test for frontend', () => {
  it('should add a property if name contains smith and remove all other props', () => {
    const expected = [{
      name: 'any_name',
      image: 'any_image',
      isBold: false,
    }, {
      name: 'any_name_with_smith',
      image: 'any_image',
      isBold: true,
    }];

    const controller = new Controller({
      service: {},
      view: {},
    });

    const result = controller.prepareItems(mockedData);

    deepStrictEqual(result, expected);
  });

  it('should verify either all functions were called properly', async () => {
    let htmlResult = '';
    const globalObject = {
      document: {
        querySelector: callTracker.calls(() => {
          return {
            set innerHTML(value) {
              htmlResult = value;
            },
          };
        }),
      },
    };

    globalThis = {
      ...globalThis,
      ...globalObject,
    };

    const service = { getCharacters: callTracker.calls(() => mockedData) };

    const view = new View();
    view.updateTable = callTracker.calls(view.updateTable);

    await Controller.initialize({
      service,
      view,
    });

    const [{ arguments: serviceCall }] = callTracker.getCalls(service.getCharacters);
    const expectedServiceCall = [{ skip: 0, limit: 5 }];

    deepStrictEqual(serviceCall, expectedServiceCall);

    const [{ arguments: viewCall }] = callTracker.getCalls(view.updateTable);
    const expectedViewCall = [[{
      name: 'any_name',
      image: 'any_image',
      isBold: false,
    }, {
      name: 'any_name_with_smith',
      image: 'any_image',
      isBold: true,
    }]];

    deepStrictEqual(viewCall, expectedViewCall);

    const expectedHtmlResult = '<li><img width=50px src="any_image"/> any_name</li><br><li><img width=50px src="any_image"/> <strong>any_name_with_smith</strong></li>';

    deepStrictEqual(htmlResult, expectedHtmlResult);

  });
});
