#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Env, String,
};

fn setup_env() -> (Env, Address, VendorRegistryContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VendorRegistryContract, ());
    let client = VendorRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    (env, admin, client)
}

// ═══════════════════════════════════════════════════════════════
// Initialization Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_initialize_success() {
    let (_env, admin, client) = setup_env();
    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.version(), 1);
    assert_eq!(client.get_vendor_count(), 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_twice_fails() {
    let (_env, _admin, client) = setup_env();
    let admin2 = Address::generate(&client.env);
    client.initialize(&admin2); // Should panic: AlreadyInitialized
}

// ═══════════════════════════════════════════════════════════════
// RBAC Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_grant_and_get_role() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);

    client.grant_role(&admin, &manager, &Role::Manager);

    let role = client.get_role(&manager);
    assert_eq!(role, Some(Role::Manager));
}

#[test]
fn test_revoke_role() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);

    client.grant_role(&admin, &manager, &Role::Manager);
    assert_eq!(client.get_role(&manager), Some(Role::Manager));

    client.revoke_role(&admin, &manager);
    assert_eq!(client.get_role(&manager), None);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_non_admin_cannot_grant_role() {
    let (_env, _admin, client) = setup_env();
    let non_admin = Address::generate(&client.env);
    let target = Address::generate(&client.env);

    client.grant_role(&non_admin, &target, &Role::Manager); // Should panic
}

// ═══════════════════════════════════════════════════════════════
// Vendor Registration Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_register_vendor_success() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);
    client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = client.register_vendor(
        &manager,
        &String::from_str(&env, "Acme Supplies"),
        &String::from_str(&env, "Raw Materials"),
        &String::from_str(&env, "acme@example.com"),
    );

    assert_eq!(vendor_id, 1);
    assert_eq!(client.get_vendor_count(), 1);

    let vendor = client.get_vendor(&vendor_id);
    assert_eq!(vendor.name, String::from_str(&env, "Acme Supplies"));
    assert_eq!(vendor.status, VendorStatus::Active);
    assert_eq!(vendor.avg_score, 0);
}

#[test]
fn test_register_multiple_vendors() {
    let (env, admin, client) = setup_env();

    let mgr1 = Address::generate(&env);
    let mgr2 = Address::generate(&env);
    client.grant_role(&admin, &mgr1, &Role::Manager);
    client.grant_role(&admin, &mgr2, &Role::Manager);

    let id1 = client.register_vendor(
        &mgr1,
        &String::from_str(&env, "Vendor A"),
        &String::from_str(&env, "Logistics"),
        &String::from_str(&env, "a@example.com"),
    );

    let id2 = client.register_vendor(
        &mgr2,
        &String::from_str(&env, "Vendor B"),
        &String::from_str(&env, "Packaging"),
        &String::from_str(&env, "b@example.com"),
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_vendor_count(), 2);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_unauthorized_register_vendor() {
    let (env, _admin, client) = setup_env();
    let random = Address::generate(&env);

    client.register_vendor(
        &random,
        &String::from_str(&env, "Vendor"),
        &String::from_str(&env, "Category"),
        &String::from_str(&env, "email@test.com"),
    ); // Should panic: Unauthorized
}

// ═══════════════════════════════════════════════════════════════
// Vendor Update Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_update_vendor() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);
    client.grant_role(&admin, &manager, &Role::Manager);

    let vendor_id = client.register_vendor(
        &manager,
        &String::from_str(&env, "Old Name"),
        &String::from_str(&env, "Old Category"),
        &String::from_str(&env, "old@test.com"),
    );

    client.update_vendor(
        &manager,
        &vendor_id,
        &Some(String::from_str(&env, "New Name")),
        &None,
        &None,
    );

    let vendor = client.get_vendor(&vendor_id);
    assert_eq!(vendor.name, String::from_str(&env, "New Name"));
    assert_eq!(vendor.category, String::from_str(&env, "Old Category"));
}

// ═══════════════════════════════════════════════════════════════
// Status Transition Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_valid_status_transitions() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);
    client.grant_role(&admin, &manager, &Role::Manager);

    let vid = client.register_vendor(
        &manager,
        &String::from_str(&env, "Test Vendor"),
        &String::from_str(&env, "Testing"),
        &String::from_str(&env, "test@example.com"),
    );

    // Active -> Suspended
    client.set_vendor_status(&manager, &vid, &VendorStatus::Suspended);
    assert_eq!(client.get_vendor(&vid).status, VendorStatus::Suspended);

    // Suspended -> Active
    client.set_vendor_status(&manager, &vid, &VendorStatus::Active);
    assert_eq!(client.get_vendor(&vid).status, VendorStatus::Active);

    // Active -> Probation
    client.set_vendor_status(&manager, &vid, &VendorStatus::Probation);
    assert_eq!(client.get_vendor(&vid).status, VendorStatus::Probation);

    // Probation -> Deactivated
    client.set_vendor_status(&manager, &vid, &VendorStatus::Deactivated);
    assert_eq!(client.get_vendor(&vid).status, VendorStatus::Deactivated);
}

// ═══════════════════════════════════════════════════════════════
// List / Pagination Tests
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_list_vendors_pagination() {
    let (env, admin, client) = setup_env();

    // Register 5 vendors
    for _i in 0..5u32 {
        let mgr = Address::generate(&env);
        client.grant_role(&admin, &mgr, &Role::Manager);

        let name = String::from_str(&env, "Vendor");
        let cat = String::from_str(&env, "Cat");
        let email = String::from_str(&env, "e@e.com");
        client.register_vendor(&mgr, &name, &cat, &email);
    }

    assert_eq!(client.get_vendor_count(), 5);

    // Get first page (3 items)
    let page1 = client.list_vendors(&1, &3);
    assert_eq!(page1.len(), 3);

    // Get second page (2 items)
    let page2 = client.list_vendors(&4, &3);
    assert_eq!(page2.len(), 2);
}

// ═══════════════════════════════════════════════════════════════
// Inter-Contract Score Update Test
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_update_vendor_score() {
    let (env, admin, client) = setup_env();
    let manager = Address::generate(&env);
    client.grant_role(&admin, &manager, &Role::Manager);

    let vid = client.register_vendor(
        &manager,
        &String::from_str(&env, "Scored Vendor"),
        &String::from_str(&env, "Services"),
        &String::from_str(&env, "scored@example.com"),
    );

    // Set review contract address (use the contract itself for test simplicity)
    let review_addr = Address::generate(&env);
    client.set_review_contract(&admin, &review_addr);

    // Update score as if called from review contract
    client.update_vendor_score(&vid, &85, &10);

    let vendor = client.get_vendor(&vid);
    assert_eq!(vendor.avg_score, 85);
    assert_eq!(vendor.review_count, 10);
}
