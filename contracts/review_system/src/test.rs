#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Env, String,
};

// Import the VendorRegistry contract for integration testing
use vendor_registry::{VendorRegistryContract, VendorRegistryContractClient, Role};

fn setup_env() -> (
    Env,
    Address,
    ReviewSystemContractClient<'static>,
    VendorRegistryContractClient<'static>,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();

    // Deploy VendorRegistry
    let registry_id = env.register(VendorRegistryContract, ());
    let registry_client = VendorRegistryContractClient::new(&env, &registry_id);
    let registry_addr = Address::from_contract_id(&env, &registry_id);

    // Deploy ReviewSystem
    let review_id = env.register(ReviewSystemContract, ());
    let review_client = ReviewSystemContractClient::new(&env, &review_id);
    let review_addr = Address::from_contract_id(&env, &review_id);

    let admin = Address::generate(&env);

    // Initialize both contracts
    registry_client.initialize(&admin);
    review_client.initialize(&admin, &registry_addr);

    // Link registry -> review contract for auth
    registry_client.set_review_contract(&admin, &review_addr);

    (env, admin, review_client, registry_client, registry_addr)
}

// ═══════════════════════════════════════════════════════════════
// Initialization Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_initialize_success() {
    let (env, admin, review_client, _, _) = setup_env();
    assert_eq!(review_client.get_admin(), admin);
    assert_eq!(review_client.version(), 1);
    assert_eq!(review_client.get_review_count(), 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_twice_fails() {
    let (env, admin, review_client, _, registry_addr) = setup_env();
    let admin2 = Address::generate(&env);
    review_client.initialize(&admin2, &registry_addr);
}

// ═══════════════════════════════════════════════════════════════
// Review Submission Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_submit_review_success() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    // Register a vendor first
    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Test Vendor"),
        &String::from_str(&env, "Services"),
        &String::from_str(&env, "test@vendor.com"),
    );

    // Submit a review
    let reviewer = Address::generate(&env);
    let review_id = review_client.submit_review(
        &reviewer,
        &vendor_id,
        &80, // delivery
        &90, // quality
        &70, // payment
        &85, // communication
        &String::from_str(&env, "Great vendor, reliable delivery!"),
    );

    assert_eq!(review_id, 1);
    assert_eq!(review_client.get_review_count(), 1);

    // Verify the review data
    let review = review_client.get_review(&review_id);
    assert_eq!(review.vendor_id, vendor_id);
    assert_eq!(review.delivery_score, 80);
    assert_eq!(review.quality_score, 90);
    assert_eq!(review.payment_score, 70);
    assert_eq!(review.communication_score, 85);
    assert_eq!(review.overall_score, 81); // (80+90+70+85)/4 = 81
}

#[test]
fn test_inter_contract_score_update() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Scored Vendor"),
        &String::from_str(&env, "Materials"),
        &String::from_str(&env, "scored@vendor.com"),
    );

    // Submit first review
    let reviewer1 = Address::generate(&env);
    review_client.submit_review(
        &reviewer1,
        &vendor_id,
        &80, &90, &70, &85,
        &String::from_str(&env, "Good quality"),
    );

    // Verify vendor score was updated via inter-contract call
    let vendor = registry_client.get_vendor(&vendor_id);
    assert_eq!(vendor.avg_score, 81); // (80+90+70+85)/4
    assert_eq!(vendor.review_count, 1);

    // Submit second review
    let reviewer2 = Address::generate(&env);
    review_client.submit_review(
        &reviewer2,
        &vendor_id,
        &60, &50, &70, &40,
        &String::from_str(&env, "Needs improvement"),
    );

    // Verify updated aggregate
    let vendor2 = registry_client.get_vendor(&vendor_id);
    assert_eq!(vendor2.review_count, 2);
    // avg of (81, 55) = 68
    assert_eq!(vendor2.avg_score, 68);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_submit_review_invalid_score() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Vendor"),
        &String::from_str(&env, "Cat"),
        &String::from_str(&env, "v@v.com"),
    );

    let reviewer = Address::generate(&env);
    review_client.submit_review(
        &reviewer, &vendor_id,
        &101, &90, &70, &85, // delivery > 100 = invalid
        &String::from_str(&env, "Test"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_duplicate_review_fails() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Vendor"),
        &String::from_str(&env, "Cat"),
        &String::from_str(&env, "v@v.com"),
    );

    let reviewer = Address::generate(&env);
    review_client.submit_review(
        &reviewer, &vendor_id,
        &80, &90, &70, &85,
        &String::from_str(&env, "First review"),
    );

    // Same reviewer, same vendor — should fail
    review_client.submit_review(
        &reviewer, &vendor_id,
        &60, &50, &70, &40,
        &String::from_str(&env, "Second attempt"),
    );
}

// ═══════════════════════════════════════════════════════════════
// Query Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_get_vendor_reviews() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Multi-Review Vendor"),
        &String::from_str(&env, "Services"),
        &String::from_str(&env, "multi@v.com"),
    );

    // Submit 3 reviews
    for _ in 0..3u32 {
        let reviewer = Address::generate(&env);
        review_client.submit_review(
            &reviewer, &vendor_id,
            &80, &75, &70, &85,
            &String::from_str(&env, "Good"),
        );
    }

    let reviews = review_client.get_vendor_reviews(&vendor_id);
    assert_eq!(reviews.len(), 3);
}

#[test]
fn test_score_aggregate() {
    let (env, admin, review_client, registry_client, _) = setup_env();

    let manager = Address::generate(&env);
    registry_client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = registry_client.register_vendor(
        &manager,
        &String::from_str(&env, "Agg Vendor"),
        &String::from_str(&env, "Materials"),
        &String::from_str(&env, "agg@v.com"),
    );

    let reviewer = Address::generate(&env);
    review_client.submit_review(
        &reviewer, &vendor_id,
        &80, &90, &70, &60,
        &String::from_str(&env, "Mixed review"),
    );

    let agg = review_client.get_vendor_score_aggregate(&vendor_id);
    assert_eq!(agg.count, 1);
    assert_eq!(agg.total_delivery, 80);
    assert_eq!(agg.total_quality, 90);
    assert_eq!(agg.total_payment, 70);
    assert_eq!(agg.total_communication, 60);
}
