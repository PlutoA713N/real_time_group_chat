import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer
export async function runTestDb() {

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        dbName: 'test-db',
    });

}
export async function closeTestDb() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop()
}