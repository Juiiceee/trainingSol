import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";
import BN from "bn.js";

describe("vault", () => {
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.vault as Program<Vault>;
	const provider = anchor.getProvider();

	const [vaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("vault")],
		program.programId
	);

	const wallet1 = anchor.web3.Keypair.generate();
	const wallet2 = anchor.web3.Keypair.generate();

	// Test 1: Initialization + Deposit by owner
	it("Test 1: Initialize vault and deposit 1 SOL by owner", async () => {
		const initTx = await program.methods
			.initialize()
			.accounts({
				vault: vaultAccount,
				signer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			} as any)
			.rpc();

		console.log("Initialization transaction signature:", initTx);

		let vault = await program.account.vault.fetch(vaultAccount);
		expect(vault.amount.toNumber()).to.equal(0);
		expect(vault.owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
		console.log("Vault initialized - Owner:", vault.owner.toBase58());
		console.log("Initial amount:", vault.amount.toString());

		const depositAmount = new BN(1000000000); // 1 SOL = 1,000,000,000 lamports
		const depositTx = await program.methods
			.deposit(depositAmount)
			.accounts({
				vault: vaultAccount,
				signer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			} as any)
			.rpc();

		console.log("Owner deposit transaction signature:", depositTx);

		vault = await program.account.vault.fetch(vaultAccount);
		expect(vault.amount.toNumber()).to.equal(1000000000);
		console.log("Amount after owner deposit:", vault.amount.toString());

		const vaultBalance = await provider.connection.getBalance(vaultAccount);
		expect(vaultBalance).to.be.greaterThanOrEqual(1000000000);
		console.log("Vault balance:", vaultBalance);
	});

	// Test 2: Deposit by first different wallet
	it("Test 2: Deposit 1 SOL by first different wallet", async () => {
		const airdropSignature1 = await provider.connection.requestAirdrop(
			wallet1.publicKey,
			2000000000 // 2 SOL
		);
		await provider.connection.confirmTransaction(airdropSignature1);
		console.log("Airdropped 2 SOL to wallet1:", wallet1.publicKey.toBase58());

		let vault = await program.account.vault.fetch(vaultAccount);
		const amountBefore = vault.amount.toNumber();
		console.log("Amount before wallet1 deposit:", amountBefore);

		const depositAmount = new BN(1000000000); // 1 SOL
		const depositTx = await program.methods
			.deposit(depositAmount)
			.accounts({
				vault: vaultAccount,
				signer: wallet1.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			} as any)
			.signers([wallet1])
			.rpc();

		console.log("Wallet1 deposit transaction signature:", depositTx);

		vault = await program.account.vault.fetch(vaultAccount);
		const expectedAmount = amountBefore + 1000000000;
		expect(vault.amount.toNumber()).to.equal(expectedAmount);
		console.log("Amount after wallet1 deposit:", vault.amount.toString());

		const vaultBalance = await provider.connection.getBalance(vaultAccount);
		expect(vaultBalance).to.be.greaterThanOrEqual(expectedAmount);
		console.log("Vault balance after wallet1 deposit:", vaultBalance);
	});

	// Test 3: Deposit by second different wallet
	it("Test 3: Deposit 1 SOL by second different wallet", async () => {
		const airdropSignature2 = await provider.connection.requestAirdrop(
			wallet2.publicKey,
			2000000000 // 2 SOL
		);
		await provider.connection.confirmTransaction(airdropSignature2);
		console.log("Airdropped 2 SOL to wallet2:", wallet2.publicKey.toBase58());

		let vault = await program.account.vault.fetch(vaultAccount);
		const amountBefore = vault.amount.toNumber();
		console.log("Amount before wallet2 deposit:", amountBefore);

		const depositAmount = new BN(1000000000); // 1 SOL
		const depositTx = await program.methods
			.deposit(depositAmount)
			.accounts({
				vault: vaultAccount,
				signer: wallet2.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			} as any)
			.signers([wallet2])
			.rpc();

		console.log("Wallet2 deposit transaction signature:", depositTx);

		vault = await program.account.vault.fetch(vaultAccount);
		const expectedAmount = amountBefore + 1000000000;
		expect(vault.amount.toNumber()).to.equal(expectedAmount);
		console.log("Amount after wallet2 deposit:", vault.amount.toString());

		const vaultBalance = await provider.connection.getBalance(vaultAccount);
		expect(vaultBalance).to.be.greaterThanOrEqual(expectedAmount);
		console.log("Final vault balance:", vaultBalance);

		console.log("\n=== SUMMARY ===");
		console.log("Total deposits: 3 SOL (3,000,000,000 lamports)");
		console.log("Final vault amount:", vault.amount.toString());
		console.log("Vault owner:", vault.owner.toBase58());
		console.log("Vault address:", vaultAccount.toBase58());
	});

	// Test 4: Withdraw by vault owner
	it("Test 4: Withdraw 1 SOL by vault owner", async () => {
		let vault = await program.account.vault.fetch(vaultAccount);
		const amountBefore = vault.amount.toNumber();
		console.log("Amount before withdraw:", amountBefore);

		const ownerBalanceBefore = await provider.connection.getBalance(provider.wallet.publicKey);
		console.log("Owner balance before withdraw:", ownerBalanceBefore);

		const withdrawAmount = new BN(1000000000); // 1 SOL
		const withdrawTx = await program.methods
			.withdraw(withdrawAmount)
			.accounts({
				vault: vaultAccount,
				signer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			} as any)
			.signers([provider.wallet.payer])
			.rpc();

		console.log("Withdraw transaction signature:", withdrawTx);

		vault = await program.account.vault.fetch(vaultAccount);
		const expectedAmount = amountBefore - 1000000000;
		expect(vault.amount.toNumber()).to.equal(expectedAmount);
		console.log("Amount after withdraw:", vault.amount.toString());

		const vaultBalance = await provider.connection.getBalance(vaultAccount);
		console.log("Vault balance after withdraw:", vaultBalance);

		const ownerBalanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);
		console.log("Owner balance after withdraw:", ownerBalanceAfter);
		expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);

		console.log("\n=== WITHDRAW TEST SUMMARY ===");
		console.log("Withdrew: 1 SOL (1,000,000,000 lamports)");
		console.log("Remaining vault amount:", vault.amount.toString());
		console.log("Final vault balance:", vaultBalance);
	});
	it("Test 5: Withdraw 1 SOL by second different wallet", async () => {

		const withdrawAmount = new BN(1000000000); // 1 SOL
		try {
			await program.methods
				.withdraw(withdrawAmount)
				.accounts({
					vault: vaultAccount,
					signer: wallet1.publicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				} as any)
				.signers([wallet1])
				.rpc();
			
			expect.fail("Transaction should have failed - wallet1 is not the vault owner");
		} catch (error) {
			console.log("Expected error caught:", error.message);
			expect(error).to.exist;
			expect(error.message).to.include("Unauthorized");
		}
	});
});
