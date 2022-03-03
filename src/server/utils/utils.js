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
    if (ghapi) {
        const queryToken = ghapi.split('access_token=')[1];
        if (queryToken) {
            const token = queryToken.split('&')[0];
            result = token;
        }
    }

    return result;
}

