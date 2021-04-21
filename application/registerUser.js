const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

const fs = require('fs');
const path = require('path');


async function main() {
	try {
		// load the network configuration
		const ccpPath = path.resolve(_dirname, '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
		const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

		//create the CA client for interacting with CA
		const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
		const ca = new FabricCAServices(caInfo.url);

		// create a new wallet
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);

		//build the admin for CA
		const adminIdentity = await wallet.get('admin');
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, 'admin');

		//register, enroll and import the identity
		const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'appUser', role: 'client' }, adminUser);
		const enrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });
		const x509Identity = { credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() }, mspId: 'Org1MSP', type: 'X.509' };

		await wallet.put('appUser', x509Identity);
		console.log('success');

	} catch (error) {
		console.log(`error: ${error}`);
		process.exit(1);
	}
}
main();