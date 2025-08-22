import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";
import BN from "bn.js";

describe("vault", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.vault as Program<Vault>;
	const provider = anchor.getProvider();
	const [vaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("vault")],
		program.programId
	);

	it("Is initialized!", async () => {
		// Add your test here.
		const tx = await program.methods
			.initialize()
			.accounts({
				vault: vaultAccount,
				signer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.rpc();
		const vault = await program.account.vault.fetch(vaultAccount);
		expect(vault.amount.toNumber()).to.equal(0);
		console.log("amount: ", vault.amount.toString());
		expect(vault.owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
		console.log("owner: ", vault.owner.toBase58());
		console.log("Your transaction signature", tx);
	});
});
