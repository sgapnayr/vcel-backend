import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../middleware/rateLimiter";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const rateLimiter = rateLimit(100, 60 * 60 * 1000);

const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.vcel.dating");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  await rateLimiter(req, res, async () => {
    switch (req.method) {
      case "POST":
        return await postUserEmailAddress(req, res);
      default:
        res.status(405).end();
        break;
    }
  });
}

async function postUserEmailAddress(req: NextApiRequest, res: NextApiResponse) {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  try {
    // Step 1: Check if email already exists in DynamoDB
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        email: { S: email },
      },
    };

    const existingItem = await dynamoDbClient.send(
      new GetItemCommand(getItemParams)
    );
    if (existingItem.Item) {
      // Email already exists
      return res.status(409).json({ error: "Email already exists" });
    }

    // Step 2: If email does not exist, proceed to add new item
    const userId = randomUUID();
    const putItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        id: { S: userId },
        email: { S: email },
        name: { S: name },
      },
    };

    await dynamoDbClient.send(new PutItemCommand(putItemParams));
    res.status(201).json({ id: userId, email, name });
  } catch (error) {
    console.error("Error creating item in DynamoDB:", error);
    res
      .status(500)
      .json({ error: (error as Error).message || "Internal server error" });
  }
}
