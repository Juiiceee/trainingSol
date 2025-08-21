import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Compteur } from "../target/types/compteur";
import { expect } from "chai";
import BN from "bn.js";

describe("compteur", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.compteur as Program<Compteur>;
	const provider = anchor.getProvider();
	const compteurAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accounts({
		compteur: compteurAccount.publicKey,
		signer: provider.wallet.publicKey,
	})
	.signers([compteurAccount])
	.rpc();
	const compteur = await program.account.compteur.fetch(compteurAccount.publicKey);
	expect(compteur.count.toNumber()).to.equal(0);
	console.log("Your transaction signature", tx);
  });

  it("Is incremented!", async () => {
	const tx = await program.methods.increment().accounts({
		compteur: compteurAccount.publicKey,
		signer: provider.wallet.publicKey,
	}).rpc();
	const compteur = await program.account.compteur.fetch(compteurAccount.publicKey);
	expect(compteur.count.toNumber()).to.equal(1);
	console.log("Your transaction signature", tx);
  });

  it("Is decremented!", async () => {
	const tx = await program.methods.decrement().accounts({
		compteur: compteurAccount.publicKey,
		signer: provider.wallet.publicKey,
	}).rpc();
	const compteur = await program.account.compteur.fetch(compteurAccount.publicKey);
	expect(compteur.count.toNumber()).to.equal(0);
	console.log("Your transaction signature", tx);
  });

});
