use anchor_lang::prelude::*;

declare_id!("jqdcw2Fpx52KLAwMjZ24aWQtJ8J6sFXLnJ7fGfauxA6");

#[program]
pub mod compteur {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
