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

	pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
		require!(ctx.accounts.signer.key() == ctx.accounts.vault.owner, ErrorCode::Unauthorized);

		require!(ctx.accounts.vault.amount >= amount, ErrorCode::InsufficientFunds);

		ctx.accounts.vault.amount = ctx.accounts.vault.amount.checked_sub(amount).unwrap();

		let vault_account_info = ctx.accounts.vault.to_account_info();
		let signer_account_info = ctx.accounts.signer.to_account_info();

		let rent = Rent::get()?;
		let min_rent = rent.minimum_balance(vault_account_info.data_len());

		require!(
			vault_account_info.lamports().checked_sub(amount).unwrap() >= min_rent,
			ErrorCode::InsufficientFundsForRent
		);

		**vault_account_info.try_borrow_mut_lamports()? = vault_account_info
			.lamports()
			.checked_sub(amount)
			.unwrap();
		
		**signer_account_info.try_borrow_mut_lamports()? = signer_account_info
			.lamports()
			.checked_add(amount)
			.unwrap();
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

#[derive(Accounts)]
pub struct Withdraw<'info> {
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

#[error_code]
pub enum ErrorCode {
	#[msg("Unauthorized access")]
	Unauthorized,
	#[msg("Insufficient funds")]
	InsufficientFunds,
	#[msg("Insufficient funds for rent")]
	InsufficientFundsForRent,
}