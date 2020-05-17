/* configure access to our .env */
require("dotenv").config();

/* include express.js & socket.io */
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/* include other packages */
const inquirer = require("inquirer");
const open = require("open");
const TextDecoder = require("text-encoding").TextDecoder;

/* hedera.js */
const {
    Client,
    ConsensusMessageSubmitTransaction,
    ConsensusTopicId,
    ConsensusTopicCreateTransaction,
    MirrorClient,
    MirrorConsensusTopicQuery
} = require("@hashgraph/sdk");

/* init variables */
const operatorAccount = process.env.OPERATOR_ID;
const operatorPrivateKey = process.env.OPERATOR_KEY;
const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;
const consensusClient = new MirrorClient(mirrorNodeAddress);

const specialChar = "ℏ";
const HederaClient = Client.forTestnet();
var topicId = "";
var logStatus = "Default";

// Utils //
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function UInt8ToString(array) {
    var str = "";
    for (var i = 0; i < array.length; i++) {
        str += array[i];
    }
    return str;
}
function secondsToDate(time) {
    var date = new Date(1970, 0, 1);
    date.setSeconds(time.seconds);
    return date;
}

/* configure our env based on prompted input */
async function init() {
    try {
        configureAccount();
        configureExistingTopic();
        /* run & serve the express app */
        runChat();
    } catch (error) {
        console.log("ERROR: init() failed", error);
        process.exit(1);
    }
}

function runChat() {
    app.use(express.static("public"));
    http.listen(0, function () {
        const randomInstancePort = http.address().port;
        open("http://localhost:" + randomInstancePort);
    });
    subscribeToMirror();
    io.on("connection", function (client) {
        io.emit(
            "connect message",
            operatorAccount + specialChar + client.id + specialChar + topicId
        );
        client.on("chat message", function (msg) {
            var formatMsg = String('{"Recorded Date":"'+ msg[0]  + '", "Card ID":"' + msg[1] + '", "Thrips":"' + msg[2] + '", "Whiteflies":"' + msg[3] + '", "Fungus Gnats":"' + msg[4] + '", "Aphids":"' + msg[5] + '", "Spider Mites":"' + msg[6] + '", "Shoreflies":"' + msg[7] + '", "Parasitic Wasps":"' + msg[8] +'", "Misc":"' + msg[9] + '"}');
            //console.log(formatMsg)
            sendHCSMessage(formatMsg);
        });
        client.on("disconnect", function () {
            io.emit("disconnect message", operatorAccount + specialChar + client.id);
        });
    });
}

init(); // process arguments & handoff to runChat()

/* helper hedera functions */
/* have feedback, questions, etc.? please feel free to file an issue! */
async function sendHCSMessage(msg) {
    try {
        console.log("TOPIC ID: ", topicId)
        await (await new ConsensusMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(String(msg))
            .execute(HederaClient))
            .getReceipt(HederaClient);
        console.log(JSON.stringify(msg));
    } catch (error) {
        console.log("ERROR: ConsensusSubmitMessageTransaction()", error);
        process.exit(1);
    }
}

function subscribeToMirror() {
    try {
        new MirrorConsensusTopicQuery()
            .setTopicId(topicId)
            .subscribe(consensusClient, res => {
                console.log("Response from MirrorConsensusTopicQuery()", res);
                const message = new TextDecoder("utf-8").decode(res["message"]);
                var runningHash = UInt8ToString(res["runningHash"]);
                var timestamp = secondsToDate(res["consensusTimestamp"]);
                io.emit(
                    "chat message",
                    message +
                    specialChar +
                    res.sequenceNumber +
                    specialChar +
                    runningHash +
                    specialChar +
                    timestamp
                );
            });
        console.log("MirrorConsensusTopicQuery()", topicId.toString());
    } catch (error) {
        console.log("ERROR: MirrorConsensusTopicQuery()", error);
        process.exit(1);
    }
}

async function createNewTopic() {
    try {
        const txId = await new ConsensusTopicCreateTransaction().execute(
            HederaClient
        );
        console.log("ConsensusTopicCreateTransaction()", `submitted tx ${txId}`);
        await sleep(3000); // wait until Hedera reaches consensus
        const receipt = await txId.getReceipt(HederaClient);
        const newTopicId = receipt.getTopicId();
        console.log(
            "ConsensusTopicCreateTransaction()",
            `success! new topic ${newTopicId}`,
            logStatus
        );
        return newTopicId;
    } catch (error) {
        console.log("ERROR: ConsensusTopicCreateTransaction()", error);
        process.exit(1);
    }
}

/* helper init functions */
function configureAccount() {
    try {
        HederaClient.setOperator(operatorAccount, operatorPrivateKey);
    } catch (error) {
        console.log("ERROR: configureAccount()", error);
        process.exit(1);
    }
}

async function configureNewTopic() {
    console.log("init()", "creating new topic");
    topicId = await createNewTopic();
    console.log(
        "ConsensusTopicCreateTransaction()",
        `waiting for new HCS Topic & mirror node (it may take a few seconds)`,
        logStatus
    );
    await sleep(9000);
    return;
}

async function configureExistingTopic() {
    console.log("init()", "connecting to existing topic");
    topicId = ConsensusTopicId.fromString(process.env.TOPIC_ID);
}