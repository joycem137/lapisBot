/**
 *
 */
var Masto = require('mastodon');

function post(mirror, post) {
    const accountParts = mirror.mastodon.account_name.split('@');
    const instanceName = accountParts[1];
    var M = new Masto({
        access_token: mirror.mastodon.access_token,
        timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
        api_url: 'https://' + instanceName + '/api/v1/'
    });

    M.post('statuses', post).then(result => {
        console.log("Published " + post.status + " to " + mirror.mastodon.account_name);
    });
}

/*
 * cw_level can be the following:
 * always - Add twitter x-post to all posts
 * retweets - Add CW to retweets and quote tweets only
 * keyword - Add CW based on keywords
 */
function buildMastodonPostFromTwitterPost(mirror, twitterPost) {
    const {options} = mirror;
    const {extended_tweet} = twitterPost;
    let status = (extended_tweet && extended_tweet.full_text) || twitterPost.text;
    let cw_text;

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

        if (options.cw_level == "retweets") {
            cw_text = "Birdsite X-post: Retweet";
        }
    } else if (isQuoteTweet || isReply) {
        if (!options.post_quote_tweets) {
            return false;
        }

        if (options.cw_level == "retweets") {
            cw_text = "Birdsite X-post: Quote Tweet";
        }

        status = twitterPost.text;
    } else if (isReply) {
        // It doesn't make sense to forward replies.
        return false;
    }

    if (options.post_twitter_link) {
        const account_name = twitterPost.user.screen_name;
        const postId = twitterPost.id_str;
        status += "\n\n";
        if (extended_tweet) {
            const {entities} = twitterPost;
            const {urls} = entities || {};
            const firstUrl = urls && urls[0];
            status += firstUrl.url;
        } else {
            status += "https://twitter.com/" + account_name + "/status/" + postId;
        }
    }

    if (options.cw_level === "always") {
        cw_text = "Birdsite X-post";
    }

    const mastoPost = {
        status,
        visibility: options.visibility || 'public'
    };

    if (cw_text) {
        mastoPost.spoiler_text = cw_text;
    }

    return mastoPost;
}

module.exports = {
    post,
    buildMastodonPostFromTwitterPost
};