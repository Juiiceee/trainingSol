use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{ Mint, TokenAccount, TokenInterface, MintTo };

declare_id!("AirEN8AVoFtVCbbdJwq8fx7SeH1kvzeCP5PeGwpLU66");

#[program]
pub mod airdrop {
	use super::*;

	pub fn create_mint(ctx: Context<CreateMint>) -> Result<()> {
		msg!("Mint account: {:?}", ctx.accounts.mint.key());
		Ok(())
	}

	pub fn create_token_account(ctx: Context<CreateTokenAccount>) -> Result<()> {
		msg!("Token account: {:?}", ctx.accounts.token_account.key());
		Ok(())
	}

	pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::mint_to(cpi_context, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMint<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,
	#[account(init, payer = signer, mint::decimals = 6, mint::authority = mint.key())]
	pub mint: InterfaceAccount<'info, Mint>,
	pub token_program: Interface<'info, TokenInterface>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTokenAccount<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,
	#[account(
		init,
		payer = signer,
		associated_token::mint = mint,
		associated_token::authority = signer,
		associated_token::token_program = token_program
	)]
	pub token_account: InterfaceAccount<'info, TokenAccount>,
	pub mint: InterfaceAccount<'info, Mint>,
	pub token_program: Interface<'info, TokenInterface>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub system_program: Program<'info, System>,
}
