require('dotenv').config();
const { client } = require('./src/openSearch');

(async () => {
  try {
    await client.indices.putSettings({
      index: 'dataset_group_progress',
      body: {
        refresh_interval: '5s',
      },
    });
    require('./src/server');
  } catch (error) {
    console.error('Error:', error);
  }
})();
