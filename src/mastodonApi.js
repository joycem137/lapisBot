/**
 *
 */
var Masto = require('mastodon');

function post(mirror, status) {
    console.log("Posting " + JSON.stringify(status) + " to " + mirror.mastodon.account_name);
    //var M = new Masto({
    //    access_token: mirror.mastodon.access_token,
    //    timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
    //    api_url: 'https://beach.city/api/v1/' // optional, defaults to https://mastodon.social/api/v1/
    //});
    //
    //M.post('statuses', status).then(status => {
    //    console.log('Published with result ' + JSON.stringify(status));
    //});
}

function buildMastodonPostFromTwitterPost(mirror, twitterPost) {
    const {options = {}} = mirror;
    let status;

    const isRetweet = !!twitterPost.retweeted_status;
    const isQuoteTweet = !!twitterPost.is_quote_status;
    const isReply = !!twitterPost.in_reply_to_status_id
        || !!twitterPost.in_reply_to_status_id_str
        || !!twitterPost.in_reply_to_user_id
        || !!twitterPost.in_reply_to_user_id_str
        || !!twitterPost.in_reply_to_screen_name;

    if (isRetweet) {
        if (!options.post_retweets) {
            return false;
        }
    } else if (isQuoteTweet) {
        // NO!
        return false;
    } else if (isReply) {
        if (!options.post_replies) {
            return false;
        }
    } else {
        status = twitterPost.text;
    }

    if (options.post_twitter_link) {
        const account_name = twitterPost.user.screen_name;
        const postId = twitterPost.id_str;
        status += "\n\n";
        status += "https://twitter.com/" + account_name + "/status/" + postId;
    }

    const mastoPost = {
        status,
        visibility: options.visibility || 'public'
    };

    if (options.cw_level === "always") {
        mastoPost.spoiler_text = "Twitter X-post";
    }

    return mastoPost;
}

module.exports = {
    post,
    buildMastodonPostFromTwitterPost
};