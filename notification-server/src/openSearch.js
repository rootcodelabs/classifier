const { Client } = require("@opensearch-project/opensearch");
const { openSearchConfig } = require("./config");

const client = new Client({
  node: openSearchConfig.getUrl(),
  ssl: openSearchConfig.ssl,
});

async function searchNotification({ sessionId, connectionId, sender }) {
  try {
    const response = await client.search({
      index: openSearchConfig.datasetGroupProgress,
      body: {
        query: {
          bool: {
            must: { match: { sessionId } },
            must_not: { match: { sentTo: connectionId } },
          },
        },
        sort: { timestamp: { order: "asc" } },
      },
    });

    for (const hit of response.body.hits.hits) {
      console.log(`hit: ${JSON.stringify(hit)}`);
      const jsonObject = {
        sessionId: hit._source.sessionId,
        progress: hit._source.progress,
      };
      await sender(jsonObject);
      await markAsSent(hit, connectionId);
    }
  } catch (e) {
    console.error(e);
    await sender({});
  }
}

async function markAsSent({ _index, _id }, connectionId) {
  await client.update({
    index: _index,
    id: _id,
    retry_on_conflict: openSearchConfig.retry_on_conflict,
    body: {
      script: {
        source: `if (ctx._source.sentTo == null) {
          ctx._source.sentTo = [params.connectionId];
        } else {
          ctx._source.sentTo.add(params.connectionId);
        }`,
        lang: "painless",
        params: { connectionId },
      },
    },
  });
}

async function updateProgress(sessionId, progress) {
  await client.index({
    index: "dataset_group_progress",
    body: {
      sessionId,
      progress,
      timestamp: new Date(),
    },
  });
}

module.exports = {
  searchNotification,
  updateProgress,
};
