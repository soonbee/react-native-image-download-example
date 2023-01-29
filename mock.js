import {createServer as _createServer} from 'miragejs';
import data from './data.json';

const createServer = () => {
  return _createServer({
    routes() {
      this.get('/api/image', () => {
        return {
          ext: 'jpg',
          data: data.image,
        };
      });
    },
  });
};

export {createServer};
