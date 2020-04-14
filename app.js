const readline = require("readline");
const ethers = require("ethers");
const { Bytes } = require("@cryptoeconomicslab/primitives");
const { LevelKeyValueStore } = require("@cryptoeconomicslab/level-kvs");
const initializeLightClient = require("@cryptoeconomicslab/eth-plasma-light-client")
  .default;

// TODO: enter your private key
const PRIVATE_KEY = "ENTER YOUR PRIVATE KEY";
const config = require("./config.local.json");
const DEPOSIT_CONTRACT_ADDRESS = config.payoutContracts.DepositContract;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function deposit(client, amount) {
  console.log("deposit:", amount);
  await client.deposit(amount, DEPOSIT_CONTRACT_ADDRESS);
}

async function getBalance(client) {
  const balance = await client.getBalance();
  console.log(`${client.address}:`, balance);
}

async function getL1Balance(client) {
  const balance = await client.wallet.getL1Balance();
  console.log(`${client.address}:`, balance.value.raw, balance.symbol);
}

async function transfer(client, amount, to) {
  console.log("transfer:", to, amount);
  await client.transfer(amount, DEPOSIT_CONTRACT_ADDRESS, to);
}

async function exit(client, amount) {
  console.log("exit:", DEPOSIT_CONTRACT_ADDRESS, amount);
  await client.exit(amount, DEPOSIT_CONTRACT_ADDRESS);
  await getExitList(client);
}

async function getExitList(client) {
  const exitList = await client.getExitList();
  console.log("exit list:", exitList);
}

async function finalizeExit(client, index) {
  const exitList = await getExitList(client);
  if (exitList[index]) {
    await client.finalizeExit(exitList[index]);
  }
}

async function startLightClient() {
  const kvs = new LevelKeyValueStore(Bytes.fromString("plasma_light_client"));
  const wallet = new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
  );
  const lightClient = await initializeLightClient({
    wallet,
    kvs,
    config,
    aggregatorEndpoint: "http://127.0.0.1:3000",
  });
  await lightClient.start();
  return lightClient;
}

function cuiWalletReadLine(client) {
  rl.question(">> ", async (input) => {
    const args = input.split(/\s+/);
    const command = args.shift();
    switch (command) {
      case "help":
        console.log(`
Commands:
  getbalance: get your balance
  deposit [amount]: deposit token to plasma
  transfer [amount] [to]: transfer token
  exit [amount]: submit exit claim
  getexitlist: show your exit list
  finalizeexit [index]: withdraw token from exit list
  quit: quit this process
          `);
        cuiWalletReadLine(client);
        break;
      case "getbalance":
        await getBalance(client);
        cuiWalletReadLine(client);
        break;
      case "getl1balance":
        await getL1Balance(client);
        cuiWalletReadLine(client);
        break;
      case "deposit":
        await deposit(client, args[0]);
        cuiWalletReadLine(client);
        break;
      case "transfer":
        await transfer(client, args[0], args[1]);
        cuiWalletReadLine(client);
        break;
      case "getexitlist":
        await getExitList(client);
        cuiWalletReadLine(client);
        break;
      case "exit":
        await exit(client, args[0]);
        cuiWalletReadLine(client);
        break;
      case "finalizeexit":
        await finalizeExit(client, args[0]);
        cuiWalletReadLine(client);
        break;
      case "quit":
        console.log("Bye.");
        rl.close();
        process.exit();
      default:
        console.log(`${command} is not found`);
        cuiWalletReadLine(client);
    }
  });
}

async function main() {
  const client = await startLightClient();
  cuiWalletReadLine(client);
}

main();
