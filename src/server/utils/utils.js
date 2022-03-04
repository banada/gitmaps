/**
 *  getAccessToken
 *
 *  Get and parse the access token from session cookies.
 *
 *  @param  {object} session Session object.
 *  @return {string}         GitHub API token or undefined.
 */
export const getAccessToken = (session) => {
    let result;
    const ghapi = session.ghapi;
    if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN)
    {
        console.log("Using .env");
        result = process.env.GITHUB_TOKEN;
    }
    else if (ghapi) {
        const queryToken = ghapi.split('access_token=')[1];
        if (queryToken) {
            const token = queryToken.split('&')[0];
            result = token;
        }
    }

    return result;
}

