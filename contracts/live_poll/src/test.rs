#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_ballotchain_election_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BallotChainContract);
    let client = BallotChainContractClient::new(&env, &contract_id);

    let title = String::from_str(&env, "BallotChain: Stellar Community Governance Election 2026");
    let start_time: u64 = 1000;
    let end_time: u64 = 9999999999;

    let init_res = client.initialize(&title, &start_time, &end_time);
    assert!(init_res);

    assert_eq!(client.get_title(), title);
    assert_eq!(client.get_candidate_count(), 0);

    let admin = Address::generate(&env);

    // Register Candidate 1
    let c1_id = client.register_candidate(
        &admin,
        &String::from_str(&env, "Soroban Core Lab"),
        &String::from_str(&env, "Smart Contract Infrastructure"),
        &String::from_str(&env, "Scaling rust-based sub-second state execution on Stellar."),
    );
    assert_eq!(c1_id, 0);

    // Register Candidate 2
    let c2_id = client.register_candidate(
        &admin,
        &String::from_str(&env, "StellarWallets Alliance"),
        &String::from_str(&env, "Multi-Wallet Ecosystem"),
        &String::from_str(&env, "Unifying web3 browser extensions and mobile signers."),
    );
    assert_eq!(c2_id, 1);

    assert_eq!(client.get_candidate_count(), 2);

    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    assert_eq!(client.has_voted(&voter1), false);

    // Voter 1 votes for Candidate 0
    let votes_c1 = client.vote(&voter1, &0);
    assert_eq!(votes_c1, 1);
    assert_eq!(client.has_voted(&voter1), true);
    assert_eq!(client.get_votes(&0), 1);
    assert_eq!(client.get_total_votes(), 1);

    // Voter 2 votes for Candidate 1
    let votes_c2 = client.vote(&voter2, &1);
    assert_eq!(votes_c2, 1);
    assert_eq!(client.get_votes(&1), 1);
    assert_eq!(client.get_total_votes(), 2);
}
