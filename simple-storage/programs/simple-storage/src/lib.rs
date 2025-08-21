use anchor_lang::prelude::*;

declare_id!("9zcE5bJ6KXPRDuwmQmnZgpGcD25zWEXF3CRto2z1z9FA");

#[program]
pub mod simple_storage {
	use super::*;

	pub fn initialize(ctx: Context<Initialize>, data: String) -> Result<()> {
		ctx.accounts.new_account.data = data.clone();
		msg!("Changed data to: {}!", data); // Message will show up in the tx logs
		Ok(())
	}
	pub fn modifie(ctx: Context<Modifie>, data: String) -> Result<()> {
		ctx.accounts.new_account.data = data.clone();
		msg!("Changed data to: {}!", data); // Message will show up in the tx logs
		Ok(())
	}
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(init, payer = signer, space = 8 + 4 + 10)]
	pub new_account: Account<'info, Data>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Modifie<'info> {
	#[account(mut)]
	pub new_account: Account<'info, Data>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
pub struct Data {
	data: String,
}
