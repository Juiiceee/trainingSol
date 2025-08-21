use anchor_lang::prelude::*;

declare_id!("5cUi8qmcr6wtwyXCBskhSc8QnqDvtdLhct3W5hDay7ap");

#[program]
pub mod simple_storage {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
