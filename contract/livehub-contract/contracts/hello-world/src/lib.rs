#![no_std]

use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    symbol_short,
    Env,
    Symbol,
    String,
    Address,
    log,
};

#[contracttype]
#[derive(Clone)]
pub struct UserStats {
    pub bids: u32,
    pub votes: u32,
    pub payments: u32,
    pub score: u32,
}

#[contracttype]
pub enum DataKey {
    User(Address),
    HighestBid,
    HighestBidder,
    PollYes,
    PollNo,
}

#[contract]
pub struct LiveHubContract;

#[contractimpl]
impl LiveHubContract {

    /*
        PLACE BID
    */
    pub fn place_bid(
        env: Env,
        user: Address,
        amount: u32,
    ) {

        user.require_auth();

        let current_bid: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::HighestBid)
            .unwrap_or(0);

        if amount <= current_bid {
            panic!("Bid too low");
        }

        env.storage()
            .persistent()
            .set(&DataKey::HighestBid, &amount);

        env.storage()
            .persistent()
            .set(
                &DataKey::HighestBidder,
                &user,
            );

        update_user_score(
            &env,
            &user,
            true,
            false,
            false,
        );

        env.events().publish(
            (symbol_short!("NEW_BID"),),
            (user, amount),
        );
    }

    /*
        VOTE
    */
    pub fn vote(
        env: Env,
        user: Address,
        vote_yes: bool,
    ) {

        user.require_auth();

        let key = if vote_yes {
            DataKey::PollYes
        } else {
            DataKey::PollNo
        };

        let current: u32 = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&key, &(current + 1));

        update_user_score(
            &env,
            &user,
            false,
            true,
            false,
        );

        env.events().publish(
            (symbol_short!("NEW_VOTE"),),
            (user, vote_yes),
        );
    }

    /*
        TRACK PAYMENT
    */
    pub fn track_payment(
        env: Env,
        user: Address,
        amount: u32,
    ) {

        user.require_auth();

        update_user_score(
            &env,
            &user,
            false,
            false,
            true,
        );

        env.events().publish(
            (symbol_short!("PAYMENT"),),
            (user, amount),
        );
    }

    /*
        GET USER SCORE
    */
    pub fn get_user_score(
        env: Env,
        user: Address,
    ) -> UserStats {

        env.storage()
            .persistent()
            .get(&DataKey::User(user))
            .unwrap_or(UserStats {
                bids: 0,
                votes: 0,
                payments: 0,
                score: 0,
            })
    }

    /*
        GET HIGHEST BID
    */
    pub fn get_highest_bid(
        env: Env,
    ) -> u32 {

        env.storage()
            .persistent()
            .get(&DataKey::HighestBid)
            .unwrap_or(0)
    }

    /*
        GET POLL RESULTS
    */
    pub fn get_poll_results(
        env: Env,
    ) -> (u32, u32) {

        let yes: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::PollYes)
            .unwrap_or(0);

        let no: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::PollNo)
            .unwrap_or(0);

        (yes, no)
    }
}

/*
    UPDATE USER SCORE
*/
fn update_user_score(
    env: &Env,
    user: &Address,
    bid: bool,
    vote: bool,
    payment: bool,
) {

    let key = DataKey::User(user.clone());

    let mut stats = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(UserStats {
            bids: 0,
            votes: 0,
            payments: 0,
            score: 0,
        });

    if bid {
        stats.bids += 1;
        stats.score += 5;
    }

    if vote {
        stats.votes += 1;
        stats.score += 2;
    }

    if payment {
        stats.payments += 1;
        stats.score += 3;
    }

    env.storage()
        .persistent()
        .set(&key, &stats);

    log!(env, "User updated");
}