import { Octokit } from 'octokit';
import { isUn } from '../../../utils/utils';
import axios from 'axios';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

const GITHUB_URL = 'https://api.github.com';

/*
 * Mode for a file to be committed as a blob.
 */
const blobMode = '100644';

/*
 * Default path where gitmaps will be committed.
 */
const defaultGitmapPath = 'gitmap.json';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/*
 * Gets the authenticated user.
 */
const getAuthenticatedUser = async ({access_token}) => {
    let user;
    try {
        const userUrl = `${GITHUB_URL}/user`;
        const auth = access_token ? `token ${access_token}`: '';
        const user = await axios.get(userUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return user;
    } catch (err) {
        console.log('Error getting authenticated user data');
    }
    return user;
}

/*
 * Gets the authenticated username.
 */
const getUsernameForAuthenticatedUser = async () => {
    const user = getAuthenticatedUser();
    let username;
    if (user) {
        username = result.data.login;
        console.log(`${username} has authenticated.`);
    } 
    return username;
}

/*
 * Fork the repo under the authenticated user
 * 
 * @param {string} owner
 * @param {string} repo 
 * @param {string} access_token 
 * @return {object} The newly forked ref url.
 */
const forkRepo = async (owner, repo, access_token) => {
    try {
        const url = `${GITHUB_URL}/repos/${owner}/${repo}/forks`;
        const auth = access_token ? `token ${access_token}`: '';
        const forkData = await axios.post(url,
            {
            },
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': auth
                }
            }
        );
        console.log(forkData);
        return forkData?.data?.url;
    } catch (err) {
        console.log(`Error forking: ${err}`);
        throw err;
    }
}

/*
 * Checks whether a repository is public
 *
 * @param {string} repo 
 * @return {boolean} Returns true if the repository is public,
 * otherwise false.
 */
const isRepoPublic = async ({owner, repo, access_token}) => {
    let result = false;
    try {
        const url = `${GITHUB_URL}/repos/${owner}/${repo}`;
        const repoData = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${access_token}`
            }
        });

        if (!repoData) {
            result = false;
        }
        if (repoData.data.visibility === 'public') {
            result = true;
        }
    } catch (err) {
        console.log(`Error checking access rights: ${err}`);
        console.log(err);
    }

    return result;
}

/*
 * Checks whether authenticated user can access the repository 
 * 
 * @param {string} owner
 * @param {string} repo 
 * @return {boolean} Returns true if the user can access the repository, otherwise false.
 */
const canAccessRepo = async (repo, owner) => {
    let result = false;
    try {
        const repoData = await octokit.rest.repos.get({
            owner,
            repo
        });
        console.log(`Repo accessed: ${repo}`);
        console.log(repoData);
        result = true;
    } catch (err) {
        console.log(`Error checking access rights: ${err}`);
        console.log(err);
    }

    return result;
}

/*
 * Checks whether branch exists for a repository
 * 
 * @param {string} branch 
 * @param {string} owner
 * @param {string} repo 
 * @return {boolean} Returns true if the user can access the repository, otherwise false.
 */
const branchExists = async (branch, repo, owner) => {
    let result = false;
    try {
        const branch = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch,
        });
        console.log(`Branch get: ${branch}`);
        result = true;
    } catch (err) {
        console.log(`Error verifying whether branch exists: ${err}`);
    }

    return result;
}

/*
 * Creates a branch off of master
 * 
 * @param {string} branch 
 * @param {string} owner
 * @param {string} repo 
 * @return {string} Returns SHA1 of the newly created branch.
 */
const createBranch = async (branch, repo, owner) => {
    let branchSHA;
    try {
        console.log('===== CREATING BRANCH =====');
        const username = await getUsernameForAuthenticatedUser();

        // Get master branch
        const master = await octokit.rest.git.getRef({
            owner: owner,
            repo: repo,
            ref: 'heads/master'
        });
        console.log(`Master branch: ${master}`);
        const masterSHA = master.data.object.sha

        // Branch off of master
        await octokit.rest.git.createRef({
            owner: username,
            repo: repo ,
            ref: `refs/heads/${branch}`,
            sha: masterSHA
        });

        // Get branch info
        const newBranch = await octokit.rest.git.getRef({
            owner: username,
            repo: repo,
            ref: `heads/${branch}`
        });
        console.log(`New branch: ${newBranch}`);
        branchSHA = newBranch.data.object.sha;
    } catch (err) {
        console.log(`Error creating new branch: ${err}`);
    }

    return branchSHA;
}

/*
 * Create and send the commit
 * 
 * @param {string} branch 
 * @param {string} owner
 * @param {string} repo 
 * @return {string} Returns SHA1 of the newly created branch.
 */
const commitBranch = async ({owner, repo, branch, path, message, content, access_token}) => {
    try {
        // Get user
        const user = await getAuthenticatedUser({access_token});

        // Get branch ref
        const branchData = await getBranch({owner, repo, branch, access_token});
        const branchSHA = branchData.data.commit.sha;

        // Create the file to commit
        const files = [
            {
                path,
                mode: blobMode,
                type: 'blob',
                content
            }
        ]
        // Create tree
        const treeUrl = `${GITHUB_URL}/repos/${owner}/${repo}/git/trees`;
        const auth = access_token ? `token ${access_token}`: '';
        const treeData = await axios.post(treeUrl,
            {
                tree: files,
                base_tree: branchSHA
            },
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': auth
                }
            }
        );
        // Commit the changes
        const commitUrl = `${GITHUB_URL}/repos/${owner}/${repo}/git/commits`;
        const commitData = await axios.post(commitUrl,
            {
                message,
                tree: treeData?.data?.sha,
                parents: [branchSHA],
                author: {
                    name: user?.data?.name,
                    email: user?.data?.email, 
                }
            },
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': auth
                }
            }
        );
        const newCommitSHA = commitData?.data?.sha;

        // Push the commit
        const ref = `heads/${branch}`;
        const pushUrl = `${GITHUB_URL}/repos/${owner}/${repo}/git/refs/${ref}`;
        const push = await axios.patch(pushUrl,
            {
                ref,
                sha: newCommitSHA
            },
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': auth
                }
            }
        );

        return push?.data?.url;
    } catch (err) {
        console.log(err);
        console.log(`Error: ${err}`);
        throw err;
    }
}

const readFileBlob = async ({owner, repo, path, ref, access_token}) => {
    try {
        const repoUrl = `${GITHUB_URL}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
        const auth = access_token ? `token ${access_token}`: '';
        const file = await axios.get(repoUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });
        if (!file?.data?.sha) {
            return undefined;
        }
        const blobUrl = `${GITHUB_URL}/repos/${owner}/${repo}/git/blobs/${file.data.sha}`;
        const blob = await axios.get(blobUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return blob;
    } catch (err) {
        throw err;
    }
}

const getPullRequest = async ({owner, repo, pull_number, access_token}) => {
    try {
        const prUrl = `${GITHUB_URL}/repos/${owner}/${repo}/pulls/${pull_number}`;
        const auth = access_token ? `token ${access_token}`: '';
        const pullRequest = await axios.get(prUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return pullRequest;
    } catch (err) {
        throw err;
    }
}

const getPullRequestFiles = async ({owner, repo, pull_number, access_token}) => {
    try {
        const prFilesUrl = `${GITHUB_URL}/repos/${owner}/${repo}/pulls/${pull_number}/files`;
        const auth = access_token ? `token ${access_token}`: '';
        const pullRequestFiles = await axios.get(prFilesUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return pullRequestFiles;
    } catch (err) {
        throw err;
    }
}

const getBranch = async ({owner, repo, branch, access_token}) => {
    try {
        const branchUrl = `${GITHUB_URL}/repos/${owner}/${repo}/branches/${branch}`;
        const auth = access_token ? `token ${access_token}`: '';
        const branchData = await axios.get(branchUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return branchData;
    } catch (err) {
        throw err;
    }
}

const getBranches = async ({owner, repo, access_token}) => {
    try {
        const branchesUrl = `${GITHUB_URL}/repos/${owner}/${repo}/branches`;
        const auth = access_token ? `token ${access_token}`: '';
        const branches = await axios.get(branchesUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return branches;
    } catch (err) {
        throw err;
    }
}

const getRef = async ({owner, repo, branch, access_token}) => {
    try {
        const refUrl = `${GITHUB_URL}/repos/${owner}/${repo}/git/ref/heads/${branch}`;
        const auth = access_token ? `token ${access_token}`: '';
        const refData = await axios.get(refUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': auth
            }
        });

        return refData;
    } catch (err) {
        throw err;
    }
}

const gitService = {
    getAuthenticatedUser,
    forkRepo,
    canAccessRepo,
    isRepoPublic,
    commitBranch,
    readFileBlob,
    getPullRequest,
    getPullRequestFiles,
    getBranch,
    getBranches
}

export default gitService;

