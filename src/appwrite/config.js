import { Client, Account, Databases, Storage, TablesDB } from "appwrite";

const client = new Client();

client
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT);

export const account = new Account(client);
export const db = new Databases(client);
export const storage = new Storage(client);
export const appwriteClient = client;
export const tablesDB = new TablesDB(client);
