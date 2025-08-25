import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vote } from "../target/types/vote";
import { expect } from "chai";
import BN from "bn.js";

describe("vote", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.vote as Program<Vote>;
	const provider = anchor.getProvider();
	const firstName = "test poll";
	const FirstDescription = "test description";
	const badDescription =
		"qqqaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa88888888888888888888888888888888888888888888888888888888888888888888888888888888";

	const getPollAccount = (name: string) => {
		return anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("poll"), Buffer.from(name)],
			program.programId
		);
	};

	const [pollAccount] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("poll"), Buffer.from(firstName)],
		program.programId
	);

	it("Test 1: Create poll with bad description", async () => {
		try {
			await program.methods.createPoll(firstName, badDescription).rpc();
			expect.fail("Transaction should have failed - bad description");
		} catch (error) {
			console.log("Expected error caught:", error.message);
			expect(error).to.exist;
			expect(error.message).to.include("Poll description is too long");
		}
	});

	it("Test 2: Create poll", async () => {
		const tx = await program.methods.createPoll(firstName, FirstDescription).rpc();
		console.log("Your transaction signature", tx);

		const poll = await program.account.poll.fetch(pollAccount);
		expect(poll.pollName).to.equal(firstName);
		expect(poll.pollDescription).to.equal(FirstDescription);
		expect(poll.pollCreator.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
		expect(poll.pollCreatedAt.toNumber()).to.be.greaterThan(0);
		expect(poll.pollStatus).to.be.true;
		expect(poll.pollAgainst.toNumber()).to.equal(0);
		expect(poll.pollFor.toNumber()).to.equal(0);
	});

	it("Test 3: Vote for poll", async () => {
		const [voteAccount] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("vote"), pollAccount.toBuffer(), provider.wallet.publicKey.toBuffer()],
			program.programId
		);

		const tx = await program.methods
			.vote(true)
			.accounts({
				poll: pollAccount,
				voteAccount: voteAccount,
				signer: provider.wallet.publicKey,
			})
			.rpc();
		console.log("Your transaction signature", tx);

		const poll = await program.account.poll.fetch(pollAccount);
		expect(poll.pollFor.toNumber()).to.equal(1);
	});

	it("Test 4: Vote poll again", async () => {
		const [voteAccount] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("vote"), pollAccount.toBuffer(), provider.wallet.publicKey.toBuffer()],
			program.programId
		);

		try {
			await program.methods
				.vote(true)
				.accounts({
					poll: pollAccount,
					voteAccount: voteAccount,
					signer: provider.wallet.publicKey,
				})
				.rpc();
			expect.fail("Transaction should have failed - already voted");
		} catch (error) {
			console.log("Expected error caught:", error.message);
			expect(error).to.exist;
			expect(error.message).to.include("Already voted");
		}
	});

	it("Test 5: Vote against poll", async () => {
		const signer2 = anchor.web3.Keypair.generate();
		const airdropSignature1 = await provider.connection.requestAirdrop(
			signer2.publicKey,
			1000000000 // 1 SOL
		);
		await provider.connection.confirmTransaction(airdropSignature1);
		const [voteAccount] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("vote"), pollAccount.toBuffer(), signer2.publicKey.toBuffer()],
			program.programId
		);

		const tx = await program.methods
			.vote(false)
			.accounts({
				poll: pollAccount,
				voteAccount: voteAccount,
				signer: signer2.publicKey,
			})
			.signers([signer2])
			.rpc();
		console.log("Your transaction signature", tx);

		const poll = await program.account.poll.fetch(pollAccount);
		expect(poll.pollAgainst.toNumber()).to.equal(1);
	});
});
