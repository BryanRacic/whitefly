# Whitefly #
Distributed zoological database using Hedera hashgraph technology

 #### placed #1 in the Hedera Category of HackTheChain 2020, #2 overall (thanks everyone!!) ####

Devpost: https://devpost.com/software/public-pest-network


Video Summary: https://vimeo.com/419576413


## Setup ##
create account (portal.hedera.com)


install nodejs


create .env file
  ```
  OPERATOR_ID=YOUR-TESTNET-ACCOUNT-ID
  OPERATOR_KEY=YOUR-TESTNET-PRIVATE-KEY
  MIRROR_NODE_ADDRESS=
  ```
  
  
Install required packages 
  ### Demo Only ###
  ```
  npm install --save @hashgraph/sdk
  npm install dotenv
  npm install text-encoding
  ```
  ### Full Webapp ###
  ```
  npm install express
  npm install socket.io
  npm install inquirer
  npm install open
  ```
  ### Public Facing Webapp (local) ###
  ```
  npm install node-fetch
  ```
