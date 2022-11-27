import config from './config.json' assert { type: 'json' };

import Controller from './controller';
import Service from './service.js';
import View from './view';

await Controller.initialize({
  service: new Service({ url: config.url }),
  view: new View(),
});


