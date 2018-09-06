// Pull in my personal polyfills.
require('jsPolyfills');

// Read the args
const args = process.argv;
var fs = require('fs');
const configFile = args[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const twitterConfig = config.twitter_credentials;

const userNames = ["pandora_parrot"];

const twitter = require('./twitterApi');

twitter.connect(twitterConfig)
    .then(twitter.getUserIds(userNames))
    .then(twitter.listenToStream);