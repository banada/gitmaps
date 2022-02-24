/**
 *  isUn
 *
 *  Check if something is undefined or null
 *
 *  Returns a Boolean
 */
export const isUn = (object) => {
    if ((typeof object === 'undefined') || (object === null)) {
        return true;
    } else {
        return false;
    }
}

