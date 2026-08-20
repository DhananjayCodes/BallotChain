#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct CandidateStruct {
    pub id: u32,
    pub name: String,
    pub party: String,
    pub bio: String,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Title,
    CandidateCount,
    Candidate(u32),
    VoteCount(u32),
    Voted(Address),
    TotalVotes,
    VotingStart,
    VotingEnd,
}

#[contract]
pub struct BallotChainContract;

#[contractimpl]
impl BallotChainContract {
    /// Initialize the BallotChain election with title and time-bound voting window
    pub fn initialize(env: Env, title: String, start_time: u64, end_time: u64) -> bool {
        if env.storage().instance().has(&DataKey::Title) {
            panic!("BallotChain election already initialized");
        }

        if end_time <= start_time {
            panic!("Voting end time must be after start time");
        }

        env.storage().instance().set(&DataKey::Title, &title);
        env.storage().instance().set(&DataKey::CandidateCount, &0u32);
        env.storage().instance().set(&DataKey::TotalVotes, &0u32);
        env.storage().instance().set(&DataKey::VotingStart, &start_time);
        env.storage().instance().set(&DataKey::VotingEnd, &end_time);

        true
    }

    /// Register a new candidate on the BallotChain contract
    pub fn register_candidate(
        env: Env,
        admin: Address,
        name: String,
        party: String,
        bio: String,
    ) -> u32 {
        admin.require_auth();

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CandidateCount)
            .unwrap_or(0);

        let candidate_id = count;
        let candidate = CandidateStruct {
            id: candidate_id,
            name: name.clone(),
            party: party.clone(),
            bio: bio.clone(),
        };

        env.storage().instance().set(&DataKey::Candidate(candidate_id), &candidate);
        env.storage().instance().set(&DataKey::VoteCount(candidate_id), &0u32);
        env.storage().instance().set(&DataKey::CandidateCount, &(candidate_id + 1));

        // Emit candidate registered event
        env.events().publish(
            (symbol_short!("ballot"), symbol_short!("reg_cand")),
            (candidate_id, name, party),
        );

        candidate_id
    }

    /// Cast a one-wallet-one-vote for a registered candidate during open voting window
    pub fn vote(env: Env, voter: Address, candidate_id: u32) -> u32 {
        voter.require_auth();

        let candidate_count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CandidateCount)
            .expect("Election not initialized");

        if candidate_id >= candidate_count {
            panic!("Invalid candidate ID");
        }

        // Time-bound voting window check
        let end_time: u64 = env
            .storage()
            .instance()
            .get(&DataKey::VotingEnd)
            .unwrap_or(0);
        let current_ledger_time = env.ledger().timestamp();

        if end_time > 0 && current_ledger_time > end_time {
            panic!("Voting window has closed");
        }

        // One-vote-per-wallet enforcement
        let voted_key = DataKey::Voted(voter.clone());
        if env.storage().instance().has(&voted_key) {
            panic!("Wallet address has already cast a vote in this election");
        }

        // Mark voter as voted
        env.storage().instance().set(&voted_key, &true);

        // Increment candidate vote count
        let current_votes: u32 = env
            .storage()
            .instance()
            .get(&DataKey::VoteCount(candidate_id))
            .unwrap_or(0);
        let new_votes = current_votes + 1;
        env.storage().instance().set(&DataKey::VoteCount(candidate_id), &new_votes);

        // Increment total election votes
        let total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0);
        let new_total = total + 1;
        env.storage().instance().set(&DataKey::TotalVotes, &new_total);

        // Emit real-time vote event
        env.events().publish(
            (symbol_short!("ballot"), symbol_short!("vote")),
            (voter, candidate_id, new_votes),
        );

        new_votes
    }

    /// Get election title
    pub fn get_title(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Title)
            .expect("Election not initialized")
    }

    /// Get registered candidate count
    pub fn get_candidate_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::CandidateCount)
            .unwrap_or(0)
    }

    /// Get details of a registered candidate
    pub fn get_candidate(env: Env, candidate_id: u32) -> CandidateStruct {
        env.storage()
            .instance()
            .get(&DataKey::Candidate(candidate_id))
            .expect("Candidate not found")
    }

    /// Get vote count for candidate
    pub fn get_votes(env: Env, candidate_id: u32) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::VoteCount(candidate_id))
            .unwrap_or(0)
    }

    /// Get total votes cast in the election
    pub fn get_total_votes(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0)
    }

    /// Check if a wallet has already voted
    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().instance().has(&DataKey::Voted(voter))
    }

    /// Check if voting window is currently open
    pub fn is_voting_open(env: Env) -> bool {
        let end_time: u64 = env
            .storage()
            .instance()
            .get(&DataKey::VotingEnd)
            .unwrap_or(0);
        if end_time == 0 {
            return true;
        }
        env.ledger().timestamp() <= end_time
    }
}

mod test;
