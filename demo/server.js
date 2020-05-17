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
  ConsensusSubmitMessageTransaction,
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
var HederaClient = Client.forTestnet();
var topicId = "";
var logStatus = "Default";

var questions = [
    {
      type: "list",
      name: "status",
      message: "What mode do you want to run in?",
      choices: ["Default", "Minimal", "Debug"],
      filter: function(val) {
        return val.toLowerCase();
      }
    },
    {
      type: "input",
      name: "account",
      message:
        "What's your account ID? [empty will default to the value at process.env.ACCOUNT_ID]\n"
    },
    {
      type: "password",
      name: "key",
      message:
        "What's your private key? \n[empty will default to the value at process.env.PRIVATE_KEY]\n"
    },
    {
      type: "list",
      name: "topic",
      message: "Should we create a new topic, or connect to an existing one?",
      choices: ["Create a new topic", "Connect to an existing topic"],
      filter: function(val) {
        return val.toLowerCase();
      }
    },
    {
      type: "input",
      name: "existingTopicId",
      message: "What's the topic ID?\n[empty will default to the value at process.env.TOPIC_ID]\n",
      when: (answers) => !answers.topic.includes("create")
    }
  ];

/* configure our env based on prompted input */
async function init() {
    try {
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
  http.listen(0, function() {
    const randomInstancePort = http.address().port;
    open("http://localhost:" + randomInstancePort);
  });
  subscribeToMirror();
  io.on("connection", function(client) {
    io.emit(
      "connect message",
      operatorAccount + specialChar + client.id + specialChar + topicId
    );
    client.on("chat message", function(msg) {
      const formattedMessage =
        operatorAccount + specialChar + client.id + specialChar + msg;
      console.log("formattedMessage: ", msg)
      /// Jacob ////
    });
    client.on("disconnect", function() {
      io.emit("disconnect message", operatorAccount + specialChar + client.id);
    });
  });
}

init(); // process arguments & handoff to runChat()

/* helper hedera functions */
/* have feedback, questions, etc.? please feel free to file an issue! */
function sendHCSMessage(msg) {
  try {
    new ConsensusSubmitMessageTransaction()
      .setTopicId(topicId)
      .setMessage(msg)
      .execute(HederaClient);
    console.log("ConsensusSubmitMessageTransaction()", msg);
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
function configureAccount(account, key) {
  try {
    // If either values in our init() process were empty
    // we should try and fallback to the .env configuration
    if (account === "" || key === "") {
        console.log("init()", "using default .env config");
      operatorAccount = process.env.ACCOUNT_ID;
      HederaClient.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);
    }
    // Otherwise, let's use the initalization parameters
    else {
      operatorAccount = account;
      HederaClient.setOperator(account, key);
    }
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