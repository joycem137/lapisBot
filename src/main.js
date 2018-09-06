// Pull in my personal polyfills.
require('jsPolyfills');

// Read the args
const args = process.argv;
var fs = require('fs');
const configFile = args[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const {mirrors} = config;

const mastodonApi = require('./mastodonApi');
function handlePost(mirror, twitterPost) {
    const mastoPost = mastodonApi.buildMastodonPostFromTwitterPost(mirror, twitterPost);
    if (mastoPost) {
        mastodonApi.post(mirror, mastoPost);
    }
}

const twitter = require('./twitterApi');
twitter.connect(config.twitter_credentials)
    .then(twitter.getUserIds(mirrors))
    .then(twitter.listenToStream(handlePost));