require('dotenv').config();
const StellarSdk = require('stellar-sdk');

// set receiver address and memo id
const receiverAddress = "GCFW3WDOYTJSKXDUXNV6QVRUP4WF7GAAOBZ3FI37K42OJW65VYSONKG6";
const memoId = "17";

// set source private key from env variables
const sourceSecretKey = process.env.PRIVATE_KEY;

// get sending keypair using private key
const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

// configure the stellar node to use (horizon instance hosted by stellar.org)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// set the testnet as the used network
StellarSdk.Network.useTestNetwork();

// main function
(async function main() {
	// load the sender account to be able to build transaction
	const account = await server.loadAccount(sourcePublicKey);

	// get the fee to pay for the transaction that is going to be sent
	const fee = await server.fetchBaseFee();

	// build of the transaction
	const transaction = new StellarSdk.TransactionBuilder(account, { fee })
	// add the payment operation to the transaction
	.addOperation(StellarSdk.Operation.payment({
		// set the receiver address as the destination of the payment
		destination: receiverAddress,
		// set the asset of the payment operation to lumens
		asset: StellarSdk.Asset.native(),
		// set the amount of the payment operation
		amount: '8.5',
	}))
	// set the validity timeout of the transaction
	.setTimeout(30)
	// add the memo id to the transaction
	.addMemo(StellarSdk.Memo.id('17'))
	.build();

	// sign the transaction with the sender keypair
	transaction.sign(sourceKeypair);

	try {
		// submit the transaction to the horizon network that will then submit the transaction into the network
		const transactionResult = await server.submitTransaction(transaction);
		console.log(JSON.stringify(transactionResult, null, 2));
		console.log('\nSuccess! View the transaction at: ');
		console.log(transactionResult._links.transaction.href);
	} catch (e) {
		console.log('An error has occured:');
		console.log(e);
	}
})();