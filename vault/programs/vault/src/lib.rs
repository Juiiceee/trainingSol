use anchor_lang::prelude::*;
use anchor_lang::system_program::{ transfer, Transfer };

declare_id!("62dPU3FNV5a78JSv7dkcrjDRKackq1KhAJrFFYNEZAJr");

#[program]
pub mod vault {
	use super::*;

	pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
		ctx.accounts.vault.owner = ctx.accounts.signer.key();
		ctx.accounts.vault.amount = 0;
		ctx.accounts.vault.bump = ctx.bumps.vault;
		Ok(())
	}

	pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
		ctx.accounts.vault.amount = amount.checked_add(ctx.accounts.vault.amount).unwrap();
		let cpi_context = CpiContext::new(ctx.accounts.system_program.to_account_info(), Transfer {
			from: ctx.accounts.signer.to_account_info(),
			to: ctx.accounts.vault.to_account_info(),
		});
		transfer(cpi_context, amount)?;
		Ok(())
	}
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(init, payer = signer, space = 8 + 32 + 8 + 1, seeds = [b"vault"], bump)]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
	#[account(mut)]
	pub vault: Account<'info, Vault>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
	pub owner: Pubkey,
	pub amount: u64,
	pub bump: u8,
}
