import axios from 'axios';
import { isUn } from '../../../utils/utils';

const readFile = async (req, res, next) => {
    const url = req.params[0];
    if (isUn(url)) {
        res.status(400);
        return res.send();
    }

    try {
        const result = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (isUn(result)) {
            res.status(404);
            return res.send();
        }

        res.status(200);
        return res.json(result.data);

    } catch (err) {
        console.log(err);
        res.status(500);
        return res.send();
    }
}

const filesController = {
    readFile,
}

export default filesController;

