console.log("hello node.js!");

// Import the Hedera Hashgraph JS SDK
// Example uses Hedera JavaScript SDK v1.1.8
const { Client, ConsensusTopicCreateTransaction, MirrorConsensusTopicQuery, ConsensusSubmitMessageTransaction, MirrorClient } = require("@hashgraph/sdk");
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

// Grab your account ID, private key, and mirror node address from the .env file
const operatorAccountId = process.env.OPERATOR_ID;
const operatorPrivateKey = process.env.OPERATOR_KEY;
const mirrorNodeAddress = process.env.MIRROR_NODE_ADDRESS;

// If we weren't able to grab it, we should throw a new error
if (operatorPrivateKey == null ||
    operatorAccountId == null ) {
    throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this reallyyy easy!
const client = Client.forTestnet();
const consensusClient = new MirrorClient(mirrorNodeAddress);

// Set your client default account ID and private key used to pay for transaction fees and sign transactions
client.setOperator(operatorAccountId, operatorPrivateKey);



// Hedera is an asynchronous environment :)
(async function() {
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;

  if (operatorPrivateKey == null || operatorAccount == null) {
      throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
  }

  /// Create new topic ///
  try {
    const txId = await new ConsensusTopicCreateTransaction().execute(
      client
    );
    console.log("ConsensusTopicCreateTransaction()", `submitted tx ${txId}`);
    await sleep(3000); // wait until Hedera reaches consensus
    const receipt = await txId.getReceipt(client);
    newTopicId = receipt.getTopicId();
    console.log(
      "ConsensusTopicCreateTransaction()",
      `success! new topic ${newTopicId}`
    );
  } catch (error) {
    console.log("ERROR: ConsensusTopicCreateTransaction()", error);
    process.exit(1);
  }

  /// Configure new topic ///
  console.log("init()", "creating new topic");
  topicId = await newTopicId;
  console.log(
    "ConsensusTopicCreateTransaction()",
    `waiting for new HCS Topic & mirror node (it may take a few seconds)`
  );

  /// Subscribe to Mirror ///
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId("0.0.46863")
      .subscribe(
          consensusClient,
          (message) => console.log(message.toString()),
          (error) => console.log(`Error: ${error}`)
      );
    console.log("MirrorConsensusTopicQuery()", topicId.toString());
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }
  ///console.log("MirrorConsensusTopicQuery()", topicId.toString());


  
  /// Send Message ///
  const msg = "Goodbye world......";
  try {
    new ConsensusSubmitMessageTransaction()
      .setTopicId("0.0.46863")
      .setMessage(msg)
      .execute(client);
    console.log("ConsensusSubmitMessageTransaction()");
  } catch (error) {
    console.log("ERROR: ConsensusSubmitMessageTransaction()", error);
    process.exit(1);
  }
  
}());