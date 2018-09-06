/**
 *
 */
// Read from twitter
var Twitter = require('twitter');

let twitterClient;
const idToMirrorMap = {};

function connect(config) {
    twitterClient = new Twitter(config);
    return Promise.resolve(twitterClient);
}

function buildMap(rawUsers, mirrors) {
    rawUsers.forEach((user) => {
        const lowercaseScreenName = user.screen_name.toLowerCase();
        const matchingMirror = mirrors.find(mirror => (mirror.twitter.account_name.toLowerCase() == lowercaseScreenName));
        idToMirrorMap[user.id_str] = matchingMirror;
    });
}

function getUserIds(mirrors) {
    const userNames = mirrors.map(mirror => (mirror.twitter.account_name));
    const request = {screen_name: userNames.join(",")};
    return function() {
        return twitterClient.get('users/lookup', request)
            .then(function (rawUsers) {
                buildMap(rawUsers, mirrors);
                return rawUsers.map(user => (user.id_str));
            })
            .catch(function (error) {
                throw error;
            });
    }
}

function listenToStream(handlePost) {
    return function() {
        const userIds = Object.keys(idToMirrorMap);
        const filter = {follow: userIds.join(',')};
        var stream = twitterClient.stream('statuses/filter', filter);
        stream.on('data', function (event) {
            const user = event && event.user;
            if (user) {
                const matchingMirror = idToMirrorMap[user.id_str];
                if (matchingMirror) {
                    handlePost(matchingMirror, event);
                }
            }
        });

        stream.on('error', function (error) {
            throw error;
        });
        console.log("Now listening");
    }
}

module.exports = {
    connect,
    listenToStream,
    getUserIds
};