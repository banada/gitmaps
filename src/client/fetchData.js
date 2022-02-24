import '@babel/polyfill';
import { API_PATH } from './routes';

export const uploadFile = async (route, obj) => {
    try {
        const jwt = localStorage.getItem('token');
        let auth;
        if (jwt) {
            auth = `Bearer ${jwt}`;
        }
        const headers = {}
        if (auth) {
            headers['Authorization'] = auth;
        }
        const res = await fetch(`${API_PATH}/${route}`, {
            method: 'POST',
            body: obj,
            headers: headers
        });
        let data;
        if ((res.status === 200) && (res.json)) {
            data = await res.json();
        }
        const result = {
            status: res.status,
            data: data
        }
        //console.log(result);

        return result;
    } catch (err) {
        console.log(err);
    }
}

const fetchData = async (method, route, obj) => {
    const jwt = localStorage.getItem('token');
    let auth;
    if (jwt) {
        auth = `Bearer ${jwt}`;
    }
    try {
        if (obj) {
            //console.log(method, route, obj);
        } else {
            //console.log(method, route);
        }
        const headers = {
            'Content-Type': 'application/json'
        }
        if (auth) {
            headers['Authorization'] = auth;
        }
        const res = await fetch(`${API_PATH}/${route}`, {
            method: method,
            headers: headers,
            body: obj ? JSON.stringify(obj) : undefined,
        });

        // Return json if possible
        try {
            const data = await res.json();

            return {
                status: res.status,
                data: data
            }
        } catch (e) {
            return {
                status: res.status
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export default fetchData;

