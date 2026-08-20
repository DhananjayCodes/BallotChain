#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};

#[test]
fn test_poll_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, LivePollContract);
    let client = LivePollContractClient::new(&env, &contract_id);

    let title = String::from_str(&env, "Best Stellar Ecosystem Feature?");
    let options = vec![
        &env,
        String::from_str(&env, "Soroban Smart Contracts"),
        String::from_str(&env, "Fast & Low Fee Settlement"),
        String::from_str(&env, "StellarWalletsKit Integration"),
        String::from_str(&env, "Decentralized Orderbook DEX"),
    ];

    let init_res = client.initialize(&title, &options);
    assert!(init_res);

    assert_eq!(client.get_title(), title);
    assert_eq!(client.get_options().len(), 4);
    assert_eq!(client.get_total_votes(), 0);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    assert_eq!(client.has_voted(&user1), false);

    // Vote for option index 0
    let votes_opt0 = client.vote(&user1, &0);
    assert_eq!(votes_opt0, 1);
    assert_eq!(client.has_voted(&user1), true);
    assert_eq!(client.get_votes(&0), 1);
    assert_eq!(client.get_total_votes(), 1);

    // Vote for option index 1
    let votes_opt1 = client.vote(&user2, &1);
    assert_eq!(votes_opt1, 1);
    assert_eq!(client.get_votes(&1), 1);
    assert_eq!(client.get_total_votes(), 2);
}
