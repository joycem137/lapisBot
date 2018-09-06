/**
 *
 */
// Read from twitter
var Twitter = require('twitter');

let twitterClient;

function connect(config) {
    twitterClient = new Twitter(config);
    return Promise.resolve(twitterClient);
}

function getUserIds(userNames) {
    const request = {screen_name: userNames.join(",")};
    return function() {
        return twitterClient.get('users/lookup', request)
            .then(function (rawUsers) {
                return rawUsers.map(user => (user.id_str));
            })
            .catch(function (error) {
                throw error;
            });
    }
}

function listenToStream(userIds) {
    const filter = {follow: userIds.join(',')};
    var stream = twitterClient.stream('statuses/filter', filter);
    stream.on('data', function (event) {
        console.log(event && event.text);
    });

    stream.on('error', function (error) {
        throw error;
    });
    console.log("Now listening");
}

module.exports = {
    connect,
    listenToStream,
    getUserIds
};