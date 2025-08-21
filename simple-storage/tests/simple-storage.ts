import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SimpleStorage } from "../target/types/simple_storage";
import { expect } from "chai";

describe("simple-storage", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.simpleStorage as Program<SimpleStorage>;
  const provider = anchor.getProvider();

  // Générer une nouvelle paire de clés pour le compte de données
  let dataAccount = anchor.web3.Keypair.generate();

  it("Initialize account with data", async () => {
    const initialData = "Salut";
    
    // Appeler la fonction initialize
    const tx = await program.methods
      .initialize(initialData)
      .accounts({
        newAccount: dataAccount.publicKey,
        signer: provider.wallet.publicKey,
      })
      .signers([dataAccount])
      .rpc();

    console.log("Initialize transaction signature:", tx);

    // Vérifier que le compte a été créé et contient les bonnes données
    const account = await program.account.data.fetch(dataAccount.publicKey);
    expect(account.data).to.equal(initialData);
    console.log("Data stored:", account.data);
  });

  it("Modify existing data", async () => {
    const newData = "Mod";
    
    // Appeler la fonction modifie
    const tx = await program.methods
      .modifie(newData)
      .accounts({
        newAccount: dataAccount.publicKey,
        signer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Modify transaction signature:", tx);

    // Vérifier que les données ont été modifiées
    const account = await program.account.data.fetch(dataAccount.publicKey);
    expect(account.data).to.equal(newData);
    console.log("Modified data:", account.data);
  });

  it("Handle empty string data", async () => {
    const emptyData = "";
    
    // Tester avec une chaîne vide
    const tx = await program.methods
      .modifie(emptyData)
      .accounts({
        newAccount: dataAccount.publicKey,
        signer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Empty data transaction signature:", tx);

    // Vérifier que les données vides sont acceptées
    const account = await program.account.data.fetch(dataAccount.publicKey);
    expect(account.data).to.equal(emptyData);
    console.log("Empty data stored successfully");
  });

  it("Multiple modifications work correctly", async () => {
    const testData = [
      "First",
      "Second", 
      "Final"
    ];

    for (let i = 0; i < testData.length; i++) {
      const tx = await program.methods
        .modifie(testData[i])
        .accounts({
          newAccount: dataAccount.publicKey,
          signer: provider.wallet.publicKey,
        })
        .rpc();

      console.log(`Modification ${i + 1} transaction:`, tx);

      // Vérifier que chaque modification est correctement enregistrée
      const account = await program.account.data.fetch(dataAccount.publicKey);
      expect(account.data).to.equal(testData[i]);
    }

    console.log("All modifications completed successfully");
  });
});
