"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const ethers_1 = require("ethers");
const fs_1 = tslib_1.__importDefault(require("fs"));
const app = (0, express_1.default)();
exports.app = app;
const router = express_1.default.Router();
router.use((0, compression_1.default)());
router.use((0, cors_1.default)());
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
const providerURL = process.env.RPC;
const privateKey = process.env.PRIVATE_KEY || '';
const publicAddress = process.env.PUBLIC_ADDRESS || '';
const contractABI = JSON.parse(fs_1.default.readFileSync("./abis/addAff.json", "utf8"));
const providerWithFallback = new ethers_1.ethers.JsonRpcProvider(providerURL);
const wallet = new ethers_1.ethers.Wallet(privateKey, providerWithFallback);
router.get("/", (req, res) => {
    return res.json("welcome to gateway PNC");
});
router.post("/add-aff-reward", async (req, res) => {
    const body = req.body;
    const response = await addUserAff(body);
    res.status(200).json(response);
});
app.use("/", router);
async function addUserAff(body) {
    const contractAddress = process.env.CONTRACT_ADDRESS_ADD_REWARD || '';
    const contract = new ethers_1.ethers.Contract(contractAddress, contractABI, wallet);
    const balance = await providerWithFallback.getBalance(publicAddress);
    let total = 0;
    for (let i = 0; i < body.amounts.length; i++) {
        total += body.amounts[i];
    }
    if (total > balance) {
        return { status: "Failed" };
    }
    try {
        const depositeth = await contract.depositETH({ value: total });
        if (depositeth.hash) {
            const result = await contract.addRewardForUsers(body.users, body.amounts);
            if (result.hash) {
                return { status: "Success" };
            }
            return { status: "Failed" };
        }
        else {
            return { status: "Failed" };
        }
    }
    catch (error) {
        return { status: "Failed" };
    }
}
//# sourceMappingURL=app.js.map