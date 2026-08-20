#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Title,
    Options,
    VoteCount(u32),
    Voted(Address),
    TotalVotes,
}

#[contract]
pub struct LivePollContract;

#[contractimpl]
impl LivePollContract {
    /// Initialize the poll with a title and options
    pub fn initialize(env: Env, title: String, options: Vec<String>) -> bool {
        if env.storage().instance().has(&DataKey::Title) {
            panic!("Poll already initialized");
        }

        if options.len() == 0 {
            panic!("Must provide at least one option");
        }

        env.storage().instance().set(&DataKey::Title, &title);
        env.storage().instance().set(&DataKey::Options, &options);
        env.storage().instance().set(&DataKey::TotalVotes, &0u32);

        for i in 0..options.len() {
            env.storage().instance().set(&DataKey::VoteCount(i), &0u32);
        }

        true
    }

    /// Cast a vote for a specific option index
    pub fn vote(env: Env, voter: Address, option_index: u32) -> u32 {
        voter.require_auth();

        let options: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::Options)
            .expect("Poll not initialized");

        if option_index >= options.len() {
            panic!("Invalid option index");
        }

        let voted_key = DataKey::Voted(voter.clone());
        if env.storage().instance().has(&voted_key) {
            panic!("Address has already voted");
        }

        // Record voter participation
        env.storage().instance().set(&voted_key, &true);

        // Increment option vote count
        let current_count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::VoteCount(option_index))
            .unwrap_or(0);
        let new_count = current_count + 1;
        env.storage().instance().set(&DataKey::VoteCount(option_index), &new_count);

        // Increment total votes
        let total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0);
        let new_total = total + 1;
        env.storage().instance().set(&DataKey::TotalVotes, &new_total);

        // Emit real-time Soroban event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("vote")),
            (voter, option_index, new_count),
        );

        new_count
    }

    /// Get poll title
    pub fn get_title(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Title)
            .expect("Poll not initialized")
    }

    /// Get all poll options
    pub fn get_options(env: Env) -> Vec<String> {
        env.storage()
            .instance()
            .get(&DataKey::Options)
            .expect("Poll not initialized")
    }

    /// Get vote count for a specific option index
    pub fn get_votes(env: Env, option_index: u32) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::VoteCount(option_index))
            .unwrap_or(0)
    }

    /// Get total votes cast
    pub fn get_total_votes(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0)
    }

    /// Check if a voter address has already voted
    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().instance().has(&DataKey::Voted(voter))
    }
}

mod test;
