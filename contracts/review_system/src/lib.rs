#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, contractclient,
    symbol_short, Address, BytesN, Env, String, Symbol, Vec, log,
};

// ═══════════════════════════════════════════════════════════════
// Inter-Contract Client Interface for VendorRegistry
// ═══════════════════════════════════════════════════════════════

#[contractclient(name = "VendorRegistryClient")]
pub trait VendorRegistryInterface {
    fn update_vendor_score(
        env: Env,
        vendor_id: u64,
        new_avg_score: u32,
        total_reviews: u32,
    );
}

// ═══════════════════════════════════════════════════════════════
// Storage Keys
// ═══════════════════════════════════════════════════════════════

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const VERSION_KEY: Symbol = symbol_short!("VERSION");
const REGISTRY: Symbol = symbol_short!("REGISTRY");
const REV_COUNT: Symbol = symbol_short!("REV_CT");

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum DataKey {
    Review(u64),
    VendorReviews(u64),
    VendorScoreAgg(u64),
    ReviewerVendor(Address, u64),
}

// ═══════════════════════════════════════════════════════════════
// Data Types
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Review {
    pub id: u64,
    pub vendor_id: u64,
    pub reviewer: Address,
    pub delivery_score: u32,   // 0-100
    pub quality_score: u32,    // 0-100
    pub payment_score: u32,    // 0-100
    pub communication_score: u32, // 0-100
    pub overall_score: u32,    // computed average 0-100
    pub comment: String,
    pub created_at: u64,
}

/// Aggregated score data for a vendor, stored persistently.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ScoreAggregate {
    pub total_delivery: u64,
    pub total_quality: u64,
    pub total_payment: u64,
    pub total_communication: u64,
    pub total_overall: u64,
    pub count: u32,
}

// ═══════════════════════════════════════════════════════════════
// Errors
// ═══════════════════════════════════════════════════════════════

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReviewError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidScore = 4,
    AlreadyReviewed = 5,
    ReviewNotFound = 6,
    RegistryNotSet = 7,
    InvalidInput = 8,
    VendorNotFound = 9,
}

// ═══════════════════════════════════════════════════════════════
// Contract
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct ReviewSystemContract;

#[contractimpl]
impl ReviewSystemContract {
    // ─── Initialization ─────────────────────────────────────

    /// Initialize with admin and vendor registry contract address.
    pub fn initialize(
        env: Env,
        admin: Address,
        vendor_registry: Address,
    ) -> Result<(), ReviewError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(ReviewError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&REGISTRY, &vendor_registry);
        env.storage().instance().set(&VERSION_KEY, &1u32);
        env.storage().instance().set(&REV_COUNT, &0u64);

        env.events().publish(
            (symbol_short!("init"),),
            (admin.clone(), vendor_registry),
        );

        log!(&env, "ReviewSystem initialized");

        Ok(())
    }

    /// Update the vendor registry address. Admin only.
    pub fn set_registry(env: Env, caller: Address, registry: Address) -> Result<(), ReviewError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&REGISTRY, &registry);

        env.events().publish(
            (symbol_short!("cfg"), symbol_short!("registry")),
            registry,
        );

        Ok(())
    }

    // ─── Upgrade ────────────────────────────────────────────

    pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), ReviewError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        let mut version: u32 = env.storage().instance().get(&VERSION_KEY).unwrap_or(1);
        version += 1;
        env.storage().instance().set(&VERSION_KEY, &version);

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        env.events().publish(
            (symbol_short!("upgrade"),),
            version,
        );

        Ok(())
    }

    pub fn version(env: Env) -> u32 {
        env.storage().instance().get(&VERSION_KEY).unwrap_or(1)
    }

    // ─── Review Submission ──────────────────────────────────

    /// Submit a review for a vendor. Scores are 0-100.
    /// After storing the review, makes an inter-contract call to
    /// VendorRegistry to update the vendor's aggregate score.
    pub fn submit_review(
        env: Env,
        reviewer: Address,
        vendor_id: u64,
        delivery_score: u32,
        quality_score: u32,
        payment_score: u32,
        communication_score: u32,
        comment: String,
    ) -> Result<u64, ReviewError> {
        reviewer.require_auth();

        // Validate scores (0-100)
        if delivery_score > 100 || quality_score > 100
            || payment_score > 100 || communication_score > 100
        {
            return Err(ReviewError::InvalidScore);
        }

        // Validate comment length
        if comment.len() > 500 {
            return Err(ReviewError::InvalidInput);
        }

        // Check if reviewer already reviewed this vendor
        let reviewer_key = DataKey::ReviewerVendor(reviewer.clone(), vendor_id);
        if env.storage().persistent().has(&reviewer_key) {
            return Err(ReviewError::AlreadyReviewed);
        }

        // Compute overall score
        let overall_score = (delivery_score + quality_score + payment_score + communication_score) / 4;

        // Create review
        let count: u64 = env.storage().instance().get(&REV_COUNT).unwrap_or(0);
        let review_id = count + 1;
        env.storage().instance().set(&REV_COUNT, &review_id);

        let now = env.ledger().timestamp();

        let review = Review {
            id: review_id,
            vendor_id,
            reviewer: reviewer.clone(),
            delivery_score,
            quality_score,
            payment_score,
            communication_score,
            overall_score,
            comment: comment.clone(),
            created_at: now,
        };

        // Store review
        env.storage().persistent().set(&DataKey::Review(review_id), &review);
        env.storage().persistent().set(&reviewer_key, &review_id);

        // Update vendor review list
        let review_list_key = DataKey::VendorReviews(vendor_id);
        let mut review_ids: Vec<u64> = env.storage().persistent()
            .get(&review_list_key)
            .unwrap_or(Vec::new(&env));
        review_ids.push_back(review_id);
        env.storage().persistent().set(&review_list_key, &review_ids);

        // Update aggregated scores
        let agg_key = DataKey::VendorScoreAgg(vendor_id);
        let mut agg: ScoreAggregate = env.storage().persistent()
            .get(&agg_key)
            .unwrap_or(ScoreAggregate {
                total_delivery: 0,
                total_quality: 0,
                total_payment: 0,
                total_communication: 0,
                total_overall: 0,
                count: 0,
            });

        agg.total_delivery += delivery_score as u64;
        agg.total_quality += quality_score as u64;
        agg.total_payment += payment_score as u64;
        agg.total_communication += communication_score as u64;
        agg.total_overall += overall_score as u64;
        agg.count += 1;

        env.storage().persistent().set(&agg_key, &agg);

        let new_avg = (agg.total_overall / agg.count as u64) as u32;

        // ── Inter-Contract Call ──────────────────────────────
        // Call VendorRegistry to update the vendor's aggregate score
        let registry_addr: Address = env.storage().instance()
            .get(&REGISTRY)
            .ok_or(ReviewError::RegistryNotSet)?;

        let registry_client = VendorRegistryClient::new(&env, &registry_addr);
        registry_client.update_vendor_score(&vendor_id, &new_avg, &agg.count);

        // Emit event
        env.events().publish(
            (symbol_short!("review"), symbol_short!("submit")),
            (review_id, vendor_id, reviewer.clone(), overall_score),
        );

        log!(&env, "Review {} submitted for vendor {}", review_id, vendor_id);

        Ok(review_id)
    }

    // ─── Queries ────────────────────────────────────────────

    pub fn get_review(env: Env, review_id: u64) -> Result<Review, ReviewError> {
        env.storage().persistent()
            .get(&DataKey::Review(review_id))
            .ok_or(ReviewError::ReviewNotFound)
    }

    pub fn get_vendor_reviews(env: Env, vendor_id: u64) -> Vec<Review> {
        let review_list_key = DataKey::VendorReviews(vendor_id);
        let review_ids: Vec<u64> = env.storage().persistent()
            .get(&review_list_key)
            .unwrap_or(Vec::new(&env));

        let mut reviews = Vec::new(&env);
        for id in review_ids.iter() {
            if let Some(review) = env.storage().persistent().get::<DataKey, Review>(&DataKey::Review(id)) {
                reviews.push_back(review);
            }
        }

        reviews
    }

    pub fn get_vendor_score_aggregate(env: Env, vendor_id: u64) -> ScoreAggregate {
        env.storage().persistent()
            .get(&DataKey::VendorScoreAgg(vendor_id))
            .unwrap_or(ScoreAggregate {
                total_delivery: 0,
                total_quality: 0,
                total_payment: 0,
                total_communication: 0,
                total_overall: 0,
                count: 0,
            })
    }

    pub fn get_review_count(env: Env) -> u64 {
        env.storage().instance().get(&REV_COUNT).unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Result<Address, ReviewError> {
        env.storage().instance()
            .get(&ADMIN_KEY)
            .ok_or(ReviewError::NotInitialized)
    }

    // ─── Internal Helpers ───────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) -> Result<(), ReviewError> {
        let admin: Address = env.storage().instance()
            .get(&ADMIN_KEY)
            .ok_or(ReviewError::NotInitialized)?;

        if *caller != admin {
            return Err(ReviewError::Unauthorized);
        }
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod test;
