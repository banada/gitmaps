import mongo, { ObjectId } from 'mongodb';

// Open connection
const mongoClient = new mongo.MongoClient('mongodb://localhost:27017',
                                          {useUnifiedTopology: true});
mongoClient.connect();
console.log(`Connected to mongodb database: ${process.env.DB_NAME}`);
const mongoDatabase = mongoClient.db(process.env.DB_NAME);

/**
 *  CRUD
 */
const mongoQuery = {}


mongoQuery.create = async (collection, obj) => {
    try {
        const result = await mongoDatabase.collection(collection).insertOne(obj);

        if (result.insertCount < 1) {
            return undefined;
        } else {
            return result.ops[0]._id;
        }
    } catch (err) {
        throw err;
    }
}

mongoQuery.read = async (collection, obj) => {
    try {
        const result = await mongoDatabase.collection(collection).find(obj).toArray();

        return result;
    } catch (err) {
        throw err;
    }
}

mongoQuery.readOne = async (collection, query) => {
    try {
        const result = await mongoDatabase.collection(collection).findOne(query);
        return result;
    } catch (err) {
        throw err;
    }
} 

mongoQuery.update = async (collection, identify, obj) => {
    try {
        const result = await mongoDatabase.collection(collection).updateOne(identify,
                                                                            {$set: obj});

        if (!result.result.ok || !result.matchedCount) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        throw err;
    }
}

mongoQuery.findOneAndUpdate = async (collection, identify, obj) => {
    try {
        const result = await mongoDatabase.collection(collection).findOneAndUpdate(identify,
                                                                            {$set: obj});

        if (!result.ok || !result.value) {
            return undefined;
        } else {
            return result.value;
        }
    } catch (err) {
        throw err;
    }
}

mongoQuery.updateOne = async (collection, query, update) => {
    try {
        const result = await mongoDatabase.collection(collection).updateOne(query, update);
        return result.matchedCount > 0 && result.modifiedCount == 1; 
    } catch (err) {
       throw err; 
    }
}

mongoQuery.delete = async (collection, identify) => {
    try {
        const result = await mongoDatabase.collection(collection).deleteOne(identify);

        if (result.deletedCount < 1) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        throw err;
    }
}

process.on('SIGINT', () => {
    console.log('');
    console.log('Shutting down server');
    mongoClient.close();

    console.log('Goodbye');
    process.exit();
});

export default mongoQuery;
