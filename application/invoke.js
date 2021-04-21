const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const fs = require('fs');
const path = require('path');


async function main() {
	try {
		// load the network configuration 
		const ccpPath = path.resolve(_dirname, '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connect-org1.json');
		const ccp = JSON.parse(fs.readFilesSync(ccpPath, 'utf8'));

		// create a new file system based wallet for managing identities
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = await Wallets.newFilesSystemWallet(walletPath);

		//create gateway
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

		//create network object
		const network = await gateway.getNetwork('channel1');

		//create contract object
		const contract = network.getContract('fabcar');

		//invoke
		await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');

		//disconnect from gateway
		await gateway.disconnect();

		console.log('success');

	} catch (error) {
		console.log('error');
		process.exit(1);
	}
}
main();