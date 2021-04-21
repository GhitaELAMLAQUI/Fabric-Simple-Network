const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const fs = require('fs');
const path = require('path');


async function main() {
	try {
		// load the network configuration
		const ccpPath = path.resolve(_dirname, '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
		const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

		// create a new file system based wallet for managing identities
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);

		//create gateway
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

		//create network object
		const network = await gateway.getNetwork('channel1');

		//create contract object
		const contract = network.getContract('fabcar');

		//query
		const result = await contract.evaluateTransaction('queryAllCars');
		console.log(`Result: ${result.toString}`);

		//disconnect from gateway
		await gateway.disconnect();

		console.log('success');

	} catch (error) {
		console.log('error');
		process.exit(1);
	}
}
main();