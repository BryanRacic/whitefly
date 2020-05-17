// <<<<<<< HEAD
console.log("hello node.js!");

// Import the Hedera Hashgraph JS SDK
// Example uses Hedera JavaScript SDK v1.1.8
const { Client, ConsensusTopicCreateTransaction, MirrorConsensusTopicQuery, ConsensusMessageSubmitTransaction, ConsensusTopicInfoQuery, MirrorClient, ConsensusTopicUpdateTransaction } = require("@hashgraph/sdk");
// Allow access to our .env file variables
require("dotenv").config();
// Gen Utils //
const TextDecoder = require("text-encoding").TextDecoder;
// Util Functions //
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
function UInt8ToString(array){
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



async function main() {
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;

  if (operatorPrivateKey == null ||
      operatorAccount == null ||
      mirrorNodeAddress == null) {
      throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, MIRROR_NODE_ADDRESS, NODE_ADDRESS must be present");
  }
  console.log(operatorAccount)
  const consensusClient = new MirrorClient(mirrorNodeAddress);

  const client = Client.forTestnet();
  client.setOperator(operatorAccount, operatorPrivateKey);

  const transactionId = await new ConsensusTopicCreateTransaction()
      .setTopicMemo("sdk example create_pub_sub.js")
      .setMaxTransactionFee(100000000000)
      .execute(client);

  const transactionReceipt = await transactionId.getReceipt(client);
  const newtopicId = transactionReceipt.getConsensusTopicId();
  const topicId = "0.0.46939"
  console.log(`topicId = ${topicId}`);

  const updateTopicTx = await new ConsensusTopicUpdateTransaction()
    .setTopicId(topicId)
    .setTopicMemo("Update topic memo")
    .execute(client);
  
  
  new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(
          consensusClient,
          (message) => console.log(message.toString()),
          (error) => console.log(`Error: ${error}`)
      );
  
  for (let i = 0; ; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await (await new ConsensusMessageSubmitTransaction()
          .setTopicId(topicId)
          .setMessage(`Hello, HCS! Message ${i}`)
          .execute(client))
          .getReceipt(client);

      console.log(`Sent message ${i}`);

      const topicInfo = await new ConsensusTopicInfoQuery()
        .setTopicId(topicId)
        .execute(client);
      console.log(`${topicInfo.sequenceNumber}`)

      await sleep(2500);
  }
  
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
/*
// Hedera is an asynchronous environment :)
(async function main() {
  // Grab your account ID, private key, and mirror node address from the .env file
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;

  // If we weren't able to grab it, we should throw a new error
  if (operatorPrivateKey == null ||
      operatorAccount == null ) {
      throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
  }

  // Create our connection to the Hedera network
  const consensusClient = new MirrorClient(mirrorNodeAddress);

  const client = Client.forTestnet();
  client.setOperator(operatorAccount, operatorPrivateKey);

  /// Create new topic ///
  const transactionId = await new ConsensusTopicCreateTransaction()
      .setTopicMemo("sdk example create_pub_sub.js")
      .setMaxTransactionFee(100000000000)
      .execute(client);

  const transactionReceipt = await transactionId.getReceipt(client);
  const topicId = transactionReceipt.getConsensusTopicId();

  console.log(`topicId = ${topicId}`);
  if (operatorPrivateKey == null || operatorAccount == null) {
      throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
  }

  /// Subscribe to Mirror ///
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(
          consensusClient,
          (message) => console.log("Message Recieved: ", message.toString()),
          (error) => console.log(`Error: ${error}`)
      );
    console.log("MirrorConsensusTopicQuery()", topicId.toString());
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }
  ///console.log("MirrorConsensusTopicQuery()", topicId.toString());

  /// Send Message ///
  const msg = "Greetings ......";
  try {
    new ConsensusMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(msg)
      .execute(client);
    console.log("ConsensusSubmitMessageTransaction()");
  } catch (error) {
    console.log("ERROR: ConsensusSubmitMessageTransaction()", error);
    process.exit(1);
  }
  
}());
=======
console.log("hello node.js!");

// Import the Hedera Hashgraph JS SDK
// Example uses Hedera JavaScript SDK v1.1.8
const { Client, ConsensusTopicCreateTransaction, MirrorConsensusTopicQuery, ConsensusMessageSubmitTransaction, ConsensusTopicInfoQuery, MirrorClient, ConsensusTopicUpdateTransaction } = require("@hashgraph/sdk");
// Allow access to our .env file variables
require("dotenv").config();
// Gen Utils //
const TextDecoder = require("text-encoding").TextDecoder;
// Util Functions //
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
function UInt8ToString(array){
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



async function main() {
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;
  const topicId = process.env.TOPIC_ID;
  if (operatorPrivateKey == null ||
      operatorAccount == null ||
      mirrorNodeAddress == null) {
      throw new Error("environment variables OPERATOR_KEY, OPERATOR_ID, MIRROR_NODE_ADDRESS, NODE_ADDRESS must be present");
  }
  console.log(operatorAccount)
  const consensusClient = new MirrorClient(mirrorNodeAddress);

  const client = Client.forTestnet();
  client.setOperator(operatorAccount, operatorPrivateKey);

  const transactionId = await new ConsensusTopicCreateTransaction()
      .setTopicMemo("sdk example create_pub_sub.js")
      .setMaxTransactionFee(100000000000)
      .execute(client);

  const transactionReceipt = await transactionId.getReceipt(client);
  const newtopicId = transactionReceipt.getConsensusTopicId();
  console.log(newtopicId)
  console.log(`topicId = ${topicId}`);

  const updateTopicTx = await new ConsensusTopicUpdateTransaction()
    .setTopicId(topicId)
    .setTopicMemo("Update topic memo")
    .execute(client);
  
  new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(
          consensusClient,
          (message) => console.log(message.toString()),
          (error) => console.log(`Error: ${error}`)
      );
  
  for (let i = 0; ; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await (await new ConsensusMessageSubmitTransaction()
          .setTopicId(topicId)
          .setMessage(`Hello, HCS! Message ${i}`)
          .execute(client))
          .getReceipt(client);

      console.log(`Sent message ${i}`);

      const topicInfo = await new ConsensusTopicInfoQuery()
        .setTopicId(topicId)
        .execute(client);
      console.log(`${topicInfo.sequenceNumber}`)

      await sleep(2500);
  }
  
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
/*
// Hedera is an asynchronous environment :)
(async function main() {
  // Grab your account ID, private key, and mirror node address from the .env file
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;

  // If we weren't able to grab it, we should throw a new error
  if (operatorPrivateKey == null ||
      operatorAccount == null ) {
      throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
  }

  // Create our connection to the Hedera network
  const consensusClient = new MirrorClient(mirrorNodeAddress);

  const client = Client.forTestnet();
  client.setOperator(operatorAccount, operatorPrivateKey);

  /// Create new topic ///
  const transactionId = await new ConsensusTopicCreateTransaction()
      .setTopicMemo("sdk example create_pub_sub.js")
      .setMaxTransactionFee(100000000000)
      .execute(client);

  const transactionReceipt = await transactionId.getReceipt(client);
  const topicId = transactionReceipt.getConsensusTopicId();

  console.log(`topicId = ${topicId}`);
  if (operatorPrivateKey == null || operatorAccount == null) {
      throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
  }

  /// Subscribe to Mirror ///
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(
          consensusClient,
          (message) => console.log("Message Recieved: ", message.toString()),
          (error) => console.log(`Error: ${error}`)
      );
    console.log("MirrorConsensusTopicQuery()", topicId.toString());
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }
  ///console.log("MirrorConsensusTopicQuery()", topicId.toString());

  /// Send Message ///
  const msg = "Greetings ......";
  try {
    new ConsensusMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(msg)
      .execute(client);
    console.log("ConsensusSubmitMessageTransaction()");
  } catch (error) {
    console.log("ERROR: ConsensusSubmitMessageTransaction()", error);
    process.exit(1);
  }
  
}());
>>>>>>> 9bb77e261e3ff9382980042bbdf5684b3bb88187
*/