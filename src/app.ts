
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import compression from "compression";
// import { getCurrentInvoke } from "@codegenie/serverless-express";
import { ethers } from "ethers";
import  fs from "fs";

// const ejs = require("ejs").__express;
const app = express();
const router = express.Router();

// app.set("view engine", "ejs");
// app.engine(".ejs", ejs);
// console.log(' process.env.RPC:',  process.env.CONTRACT_ADDRESS_ADD_REWARD);
router.use(compression());
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
// Environment or configuration data
const providerURL = process.env.RPC;
const privateKey = process.env.PRIVATE_KEY || '';

// const chainId = process.env.CHAIN_ID;
const publicAddress = process.env.PUBLIC_ADDRESS || '';
const contractABI = JSON.parse(
  fs.readFileSync("./abis/addAff.json", "utf8")
);
// console.log("contractABI",contractABI);
const providerWithFallback = new ethers.JsonRpcProvider(providerURL);
// Connect to the network using a wallet
const wallet = new ethers.Wallet(privateKey, providerWithFallback);

router.get("/", (req: Request, res: Response) => {
  return res.json("welcome to gateway PNC");
});


router.post("/add-aff-reward", async (req: any, res: any) => {
  const body = req.body;
  //check balance wallet
  // Fetch the balance (returns balance in Wei)

  const response = await addUserAff(body);
  res.status(200).json(response);
});

// router.get("/cookie", (req: Request, res: Response) => {
//   res.cookie("Foo", "bar");
//   res.cookie("Fizz", "buzz");
//   return res.json({});
// });

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use("/", router);
async function addUserAff(body: any) {
  const contractAddress = process.env.CONTRACT_ADDRESS_ADD_REWARD || ''
  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    wallet
  );
  const balance = await providerWithFallback.getBalance(publicAddress);
  // console.log(balance);
  // Convert balance from Wei to Ether
  // const balanceInEther = ethers.utils.formatEther(balance);
  let total = 0;
  for (let i = 0; i < body.amounts.length; i++) {
    total += body.amounts[i];
  }
  // console.log("total > balance",total > balance);
  if (total > balance) {
    return { status: "Failed" };
  }

  try {
    const depositeth = await contract.depositETH({ value: total });
    if (depositeth.hash) {
      // console.log("===result===",result);
      const result = await contract.addRewardForUsers(body.users, body.amounts); // Modify yourMethodName and args

      if (result.hash) {
        // console.log("===result===",result);
        return { status: "Success" }
      }
      return { status: "Failed" }

    } else {
      return { status: "Failed" }
    }
    // console.log("result", result);
  } catch (error) {
    return { status: "Failed" }

  }
}
export { app };
