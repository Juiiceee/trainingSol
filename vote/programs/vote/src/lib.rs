use anchor_lang::prelude::*;

declare_id!("FSZ5V7ZnVrYZizxebyouu52BonRPWVSSVaj7VsygL6AK");

#[program]
pub mod vote {
	use super::*;

	pub fn create_poll(ctx: Context<CreatePoll>, poll_name: String, poll_description: String) -> Result<()> {
		let poll = &mut ctx.accounts.poll;
		if poll_name.len() > 32 {
			return Err(ErrorCode::InvalidPollName.into());
		}
		if poll_description.len() > 280 {
			return Err(ErrorCode::InvalidPollDescription.into());
		}
		poll.poll_creator = ctx.accounts.signer.key();
		poll.poll_name = poll_name;
		poll.poll_description = poll_description;
		poll.poll_created_at = Clock::get()?.unix_timestamp;
		poll.poll_status = true;
		poll.poll_against = 0;
		poll.poll_for = 0;
		msg!("Poll created successfully");
		Ok(())
	}
}

#[derive(Accounts)]
#[instruction(poll_name: String)]
pub struct CreatePoll<'info> {
	#[account(init, payer = signer, space = 8 + Poll::INIT_SPACE, seeds = [b"poll", signer.key().as_ref(), poll_name.as_bytes()], bump)]
	pub poll: Account<'info, Poll>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
	pub poll_creator: Pubkey,
	#[max_len(32)]
	pub poll_name: String,
	#[max_len(280)]
	pub poll_description: String,
	pub poll_created_at: i64,
	pub poll_status: bool,
	pub poll_against: u64,
	pub poll_for: u64,
}

#[error_code]
pub enum ErrorCode {
	#[msg("Poll name is too long")]
	InvalidPollName,
	#[msg("Poll description is too long")]
	InvalidPollDescription,
}