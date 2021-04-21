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
		const caTLSCerts = caInfo.tlsCACerts.pem;
		const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

		// create a new file system based wallet for managing identities
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);

		//enroll the admin user and import the new identity into the wallet
		const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes()
			},
			mspId: 'Org1MSP',
			type: 'X.509'

		};
		await wallet.put('admin', x509Identity);
		console.log('success');
	} catch (error) {
		console.log(`error: ${error}`);
		process.exit(1);
	}
}
main();