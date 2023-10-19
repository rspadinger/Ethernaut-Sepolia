# Ethernaut CTF Challenges - Sepolia

The various challenges can be found at: https://ethernaut.openzeppelin.com

You can solve the puzzles in the debug console of your browser using MetaMask. However, it is easier and quicker doing it locally using a fork of the Sepolia testnet.

Also, that way, you won't need any Sepolia test Ether. To do so, add a "forking" section to the hardhat network section in your hardhat.config.js file.

In that section, you need to provide the url of your third party node provider (for example, Alchemy) and a blocknumber. Most tests work with the blocknumber 2500000, but a few challenges require a higher blocknumber, as they have been created more recently.

## Dependencies

Install the following tools:

-   Node.js & NPM: https://nodejs.org
-   Hardhat: https://hardhat.org/hardhat-runner/docs/getting-started

## Step 1. Clone the project

`git clone https://github.com/rspadinger/Ethernaut-Sepolia.git`

## Step 2. Install dependencies

```
`$ cd project_folder` => (replace project_folder with the name of the project directory you want to execute)
`$ npm install`
```

## Step 3. Create a .env file

Every project requires a .env file with various environment variables (not all of them are required for every project).
The environment variables are the same for a React project and a project that contains a simple script file.

Here are the required environment variables:

ALCHEMY_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/REPLACE_WITH_YOUR_API_KEY

## Step 4. Run the tests for each challenge

In a terminal window, execute the following command: npx hardhat test test/TEST-FILE

For example: npx hardhat test test/1-fallback.js
