use anchor_lang::prelude::*;

declare_id!("jqdcw2Fpx52KLAwMjZ24aWQtJ8J6sFXLnJ7fGfauxA6");

#[program]
pub mod compteur {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
		ctx.accounts.compteur.count = 0;
		Ok(())
    }

	pub fn increment(ctx: Context<Increment>) -> Result<()> {
		ctx.accounts.compteur.count = ctx.accounts.compteur.count.checked_add(1).unwrap();
		Ok(())
    }

	pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
		ctx.accounts.compteur.count = ctx.accounts.compteur.count.checked_sub(1).unwrap();
		Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(init, payer = signer, space = 8 + 8)]
	pub compteur: Account<'info, Compteur>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
	#[account(mut)]
	pub compteur: Account<'info, Compteur>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
	#[account(mut)]
	pub compteur: Account<'info, Compteur>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
pub struct Compteur {
	pub count: u64,
}