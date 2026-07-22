#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    Address, BytesN, Env, String, Symbol, Vec, log,
};

// ═══════════════════════════════════════════════════════════════
// Storage Keys
// ═══════════════════════════════════════════════════════════════

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const VERSION_KEY: Symbol = symbol_short!("VERSION");
const VENDOR_CT: Symbol = symbol_short!("V_COUNT");
const REVIEW_CA: Symbol = symbol_short!("REV_CA");

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum DataKey {
    Vendor(u64),
    VendorByAddr(Address),
    Role(Address),
    VendorCount,
}

// ═══════════════════════════════════════════════════════════════
// Data Types
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Role {
    Admin,
    Manager,
    Viewer,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum VendorStatus {
    Active,
    Suspended,
    Probation,
    Deactivated,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Vendor {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub category: String,
    pub contact_email: String,
    pub status: VendorStatus,
    pub avg_score: u32,       // 0-100, scaled score
    pub review_count: u32,
    pub created_at: u64,
    pub updated_at: u64,
}

// ═══════════════════════════════════════════════════════════════
// Errors
// ═══════════════════════════════════════════════════════════════

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VendorError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    VendorNotFound = 4,
    VendorAlreadyExists = 5,
    InvalidInput = 6,
    InvalidStatusTransition = 7,
    ReviewContractNotSet = 8,
    ScoreOutOfRange = 9,
}

// ═══════════════════════════════════════════════════════════════
// Contract
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct VendorRegistryContract;

#[contractimpl]
impl VendorRegistryContract {
    // ─── Initialization ─────────────────────────────────────

    /// Initialize the contract with an admin address.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), VendorError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(VendorError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&VERSION_KEY, &1u32);
        env.storage().instance().set(&VENDOR_CT, &0u64);

        // Set admin role
        env.storage().persistent().set(&DataKey::Role(admin.clone()), &Role::Admin);

        env.events().publish(
            (symbol_short!("init"),),
            admin.clone(),
        );

        log!(&env, "VendorRegistry initialized with admin: {:?}", admin);

        Ok(())
    }

    /// Set the review system contract address for inter-contract calls.
    pub fn set_review_contract(env: Env, caller: Address, review_contract: Address) -> Result<(), VendorError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&REVIEW_CA, &review_contract);

        env.events().publish(
            (symbol_short!("cfg"), symbol_short!("review")),
            review_contract,
        );

        Ok(())
    }

    // ─── Upgrade ────────────────────────────────────────────

    /// Upgrade the contract WASM. Admin only.
    pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), VendorError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        let mut version: u32 = env.storage().instance().get(&VERSION_KEY).unwrap_or(1);
        version += 1;
        env.storage().instance().set(&VERSION_KEY, &version);

        env.deployer().update_current_contract_wasm(new_wasm_hash.clone());

        env.events().publish(
            (symbol_short!("upgrade"),),
            version,
        );

        Ok(())
    }

    pub fn version(env: Env) -> u32 {
        env.storage().instance().get(&VERSION_KEY).unwrap_or(1)
    }

    // ─── RBAC ───────────────────────────────────────────────

    /// Grant a role to an address. Admin only.
    pub fn grant_role(env: Env, caller: Address, account: Address, role: Role) -> Result<(), VendorError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().persistent().set(&DataKey::Role(account.clone()), &role);

        env.events().publish(
            (symbol_short!("role"), symbol_short!("grant")),
            (account, role),
        );

        Ok(())
    }

    /// Revoke a role from an address. Admin only.
    pub fn revoke_role(env: Env, caller: Address, account: Address) -> Result<(), VendorError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().persistent().remove(&DataKey::Role(account.clone()));

        env.events().publish(
            (symbol_short!("role"), symbol_short!("revoke")),
            account,
        );

        Ok(())
    }

    /// Get the role of an address. Returns None if no role.
    pub fn get_role(env: Env, account: Address) -> Option<Role> {
        env.storage().persistent().get(&DataKey::Role(account))
    }

    // ─── Vendor Management ──────────────────────────────────

    /// Register a new vendor. Requires Manager or Admin role.
    pub fn register_vendor(
        env: Env,
        caller: Address,
        name: String,
        category: String,
        contact_email: String,
    ) -> Result<u64, VendorError> {
        caller.require_auth();
        Self::require_manager_or_admin(&env, &caller)?;

        // Validate inputs
        if name.len() == 0 || name.len() > 128 {
            return Err(VendorError::InvalidInput);
        }
        if category.len() == 0 || category.len() > 64 {
            return Err(VendorError::InvalidInput);
        }

        // Check if vendor already exists for this caller address
        if env.storage().persistent().has(&DataKey::VendorByAddr(caller.clone())) {
            return Err(VendorError::VendorAlreadyExists);
        }

        // Increment vendor count
        let count: u64 = env.storage().instance().get(&VENDOR_CT).unwrap_or(0);
        let vendor_id = count + 1;
        env.storage().instance().set(&VENDOR_CT, &vendor_id);

        let now = env.ledger().timestamp();

        let vendor = Vendor {
            id: vendor_id,
            owner: caller.clone(),
            name: name.clone(),
            category: category.clone(),
            contact_email,
            status: VendorStatus::Active,
            avg_score: 0,
            review_count: 0,
            created_at: now,
            updated_at: now,
        };

        env.storage().persistent().set(&DataKey::Vendor(vendor_id), &vendor);
        env.storage().persistent().set(&DataKey::VendorByAddr(caller.clone()), &vendor_id);

        env.events().publish(
            (symbol_short!("vendor"), symbol_short!("register")),
            (vendor_id, name, category),
        );

        log!(&env, "Vendor registered: id={}", vendor_id);

        Ok(vendor_id)
    }

    /// Update vendor details. Only vendor owner, Manager, or Admin.
    pub fn update_vendor(
        env: Env,
        caller: Address,
        vendor_id: u64,
        name: Option<String>,
        category: Option<String>,
        contact_email: Option<String>,
    ) -> Result<(), VendorError> {
        caller.require_auth();

        let mut vendor: Vendor = env.storage().persistent()
            .get(&DataKey::Vendor(vendor_id))
            .ok_or(VendorError::VendorNotFound)?;

        // Must be vendor owner, manager, or admin
        if vendor.owner != caller {
            Self::require_manager_or_admin(&env, &caller)?;
        }

        if let Some(n) = name {
            if n.len() == 0 || n.len() > 128 {
                return Err(VendorError::InvalidInput);
            }
            vendor.name = n;
        }
        if let Some(c) = category {
            if c.len() == 0 || c.len() > 64 {
                return Err(VendorError::InvalidInput);
            }
            vendor.category = c;
        }
        if let Some(e) = contact_email {
            vendor.contact_email = e;
        }

        vendor.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Vendor(vendor_id), &vendor);

        env.events().publish(
            (symbol_short!("vendor"), symbol_short!("update")),
            vendor_id,
        );

        Ok(())
    }

    /// Transition vendor status. Enforces valid state transitions.
    pub fn set_vendor_status(
        env: Env,
        caller: Address,
        vendor_id: u64,
        new_status: VendorStatus,
    ) -> Result<(), VendorError> {
        caller.require_auth();
        Self::require_manager_or_admin(&env, &caller)?;

        let mut vendor: Vendor = env.storage().persistent()
            .get(&DataKey::Vendor(vendor_id))
            .ok_or(VendorError::VendorNotFound)?;

        // Enforce valid state transitions
        Self::validate_status_transition(&vendor.status, &new_status)?;

        let old_status = vendor.status.clone();
        vendor.status = new_status.clone();
        vendor.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Vendor(vendor_id), &vendor);

        env.events().publish(
            (symbol_short!("vendor"), symbol_short!("status")),
            (vendor_id, old_status, new_status),
        );

        Ok(())
    }

    /// Called by review_system contract to update the vendor's aggregate score.
    /// This is the inter-contract call entrypoint.
    pub fn update_vendor_score(
        env: Env,
        vendor_id: u64,
        new_avg_score: u32,
        total_reviews: u32,
    ) -> Result<(), VendorError> {
        // Verify caller is the registered review contract
        let review_contract: Address = env.storage().instance()
            .get(&REVIEW_CA)
            .ok_or(VendorError::ReviewContractNotSet)?;

        review_contract.require_auth();

        if new_avg_score > 100 {
            return Err(VendorError::ScoreOutOfRange);
        }

        let mut vendor: Vendor = env.storage().persistent()
            .get(&DataKey::Vendor(vendor_id))
            .ok_or(VendorError::VendorNotFound)?;

        vendor.avg_score = new_avg_score;
        vendor.review_count = total_reviews;
        vendor.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Vendor(vendor_id), &vendor);

        env.events().publish(
            (symbol_short!("vendor"), symbol_short!("scored")),
            (vendor_id, new_avg_score, total_reviews),
        );

        Ok(())
    }

    // ─── Queries ────────────────────────────────────────────

    pub fn get_vendor(env: Env, vendor_id: u64) -> Result<Vendor, VendorError> {
        env.storage().persistent()
            .get(&DataKey::Vendor(vendor_id))
            .ok_or(VendorError::VendorNotFound)
    }

    pub fn get_vendor_by_address(env: Env, address: Address) -> Result<Vendor, VendorError> {
        let vendor_id: u64 = env.storage().persistent()
            .get(&DataKey::VendorByAddr(address))
            .ok_or(VendorError::VendorNotFound)?;

        Self::get_vendor(env, vendor_id)
    }

    pub fn get_vendor_count(env: Env) -> u64 {
        env.storage().instance().get(&VENDOR_CT).unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Result<Address, VendorError> {
        env.storage().instance()
            .get(&ADMIN_KEY)
            .ok_or(VendorError::NotInitialized)
    }

    /// List vendors with pagination.
    pub fn list_vendors(env: Env, start: u64, limit: u64) -> Vec<Vendor> {
        let count: u64 = env.storage().instance().get(&VENDOR_CT).unwrap_or(0);
        let mut vendors = Vec::new(&env);
        let end = core::cmp::min(start + limit, count + 1);

        for i in start..end {
            if let Some(vendor) = env.storage().persistent().get::<DataKey, Vendor>(&DataKey::Vendor(i)) {
                vendors.push_back(vendor);
            }
        }

        vendors
    }

    // ─── Internal Helpers ───────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) -> Result<(), VendorError> {
        let admin: Address = env.storage().instance()
            .get(&ADMIN_KEY)
            .ok_or(VendorError::NotInitialized)?;

        if *caller != admin {
            return Err(VendorError::Unauthorized);
        }
        Ok(())
    }

    fn require_manager_or_admin(env: &Env, caller: &Address) -> Result<(), VendorError> {
        let role: Option<Role> = env.storage().persistent().get(&DataKey::Role(caller.clone()));
        match role {
            Some(Role::Admin) | Some(Role::Manager) => Ok(()),
            _ => Err(VendorError::Unauthorized),
        }
    }

    fn validate_status_transition(
        current: &VendorStatus,
        target: &VendorStatus,
    ) -> Result<(), VendorError> {
        let valid = match (current, target) {
            (VendorStatus::Active, VendorStatus::Suspended) => true,
            (VendorStatus::Active, VendorStatus::Probation) => true,
            (VendorStatus::Active, VendorStatus::Deactivated) => true,
            (VendorStatus::Suspended, VendorStatus::Active) => true,
            (VendorStatus::Suspended, VendorStatus::Deactivated) => true,
            (VendorStatus::Probation, VendorStatus::Active) => true,
            (VendorStatus::Probation, VendorStatus::Suspended) => true,
            (VendorStatus::Probation, VendorStatus::Deactivated) => true,
            (VendorStatus::Deactivated, VendorStatus::Active) => true,
            _ => false,
        };

        if valid {
            Ok(())
        } else {
            Err(VendorError::InvalidStatusTransition)
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod test;
