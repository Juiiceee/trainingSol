use anchor_lang::prelude::*;

declare_id!("62dPU3FNV5a78JSv7dkcrjDRKackq1KhAJrFFYNEZAJr");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
