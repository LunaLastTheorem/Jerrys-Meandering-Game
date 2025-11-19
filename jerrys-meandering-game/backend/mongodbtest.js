import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config.js'

const uri = process.env.URI;

const client = new MongoClient(uri)
await client.connect();
const dbo = client.db("jerrys-meandering-game");
const result = await dbo.collection("maps").find({ index: 1 }).toArray();
console.log(result);
await client.close();