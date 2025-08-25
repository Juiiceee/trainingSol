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
	const badName = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
	const badDescription = "qqqaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa88888888888888888888888888888888888888888888888888888888888888888888888888888888"
	
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

});
