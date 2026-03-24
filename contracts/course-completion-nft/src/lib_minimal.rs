extern crate alloc;

use stylus_sdk::{
    msg,
    prelude::*,
    evm,
    block,
    alloy_primitives::{Address, U256}
};
use alloy_sol_types::sol;
use alloc::string::String;
use alloc::vec::Vec;

sol_storage! {
    #[entrypoint]
    pub struct CourseCompletionNFT {
        // NFT basics
        mapping(uint256 => address) owners;
        mapping(address => uint256) balances;
        uint256 total_supply;

        // Course data - simplified
        mapping(uint256 => string) course_names;
        mapping(uint256 => address) course_issuers;
        mapping(uint256 => bool) course_active;
        uint256 next_course_id;

        // Certificate data - minimal
        mapping(uint256 => uint256) token_courses;
        mapping(uint256 => uint256) token_dates;
        mapping(uint256 => string) token_metadata;

        // Access control - minimal
        mapping(address => bool) admins;

        // Prevent duplicates
        mapping(address => mapping(uint256 => bool)) completions;
    }
}

sol! {
    event CourseCreated(uint256 indexed course_id, string name);
    event CertificateMinted(uint256 indexed token_id, address indexed student);
}

impl CourseCompletionNFT {
    fn only_admin(&self) -> Result<(), Vec<u8>> {
        if !self.admins.get(msg::sender()) {
            return Err(b"Unauthorized".to_vec());
        }
        Ok(())
    }
}

#[public]
impl CourseCompletionNFT {
    /// Initialize
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        self.admins.insert(msg::sender(), true);
        self.next_course_id.set(U256::from(1u8));
        Ok(())
    }

    /// Create course
    pub fn create_course(&mut self, name: String, issuer: Address) -> Result<U256, Vec<u8>> {
        self.only_admin()?;
        let id = self.next_course_id.get();

        self.course_names.insert(id, name.clone());
        self.course_issuers.insert(id, issuer);
        self.course_active.insert(id, true);
        self.next_course_id.set(id + U256::from(1u8));

        evm::log(CourseCreated { course_id: id, name });
        Ok(id)
    }

    /// Mint certificate
    pub fn mint_certificate(&mut self, student: Address, course_id: U256, metadata: String) -> Result<U256, Vec<u8>> {
        // Check course active
        if !self.course_active.get(course_id) {
            return Err(b"InvalidCourse".to_vec());
        }

        // Check auth
        let caller = msg::sender();
        if !self.admins.get(caller) && self.course_issuers.get(course_id) != caller {
            return Err(b"Unauthorized".to_vec());
        }

        // Check duplicate
        if self.completions.getter(student).get(course_id) {
            return Err(b"Duplicate".to_vec());
        }

        // Mint
        let token_id = self.total_supply.get();
        self.owners.insert(token_id, student);
        self.balances.setter(student).set(self.balances.get(student) + U256::from(1u8));
        self.total_supply.set(token_id + U256::from(1u8));

        // Store certificate data
        self.token_courses.insert(token_id, course_id);
        self.token_dates.insert(token_id, U256::from(block::timestamp()));
        self.token_metadata.insert(token_id, metadata);
        self.completions.setter(student).insert(course_id, true);

        evm::log(CertificateMinted { token_id, student });
        Ok(token_id)
    }

    /// Basic ERC721 functions
    pub fn owner_of(&self, token_id: U256) -> Address {
        self.owners.get(token_id)
    }

    pub fn balance_of(&self, owner: Address) -> U256 {
        self.balances.get(owner)
    }

    pub fn total_supply(&self) -> U256 {
        self.total_supply.get()
    }

    /// Get certificate data
    pub fn get_certificate(&self, token_id: U256) -> (U256, U256, String) {
        (
            self.token_courses.get(token_id),
            self.token_dates.get(token_id),
            self.token_metadata.get(token_id)
        )
    }

    /// Get course info
    pub fn get_course(&self, course_id: U256) -> (String, Address, bool) {
        (
            self.course_names.get(course_id),
            self.course_issuers.get(course_id),
            self.course_active.get(course_id)
        )
    }

    /// Check completion
    pub fn has_certificate(&self, student: Address, course_id: U256) -> bool {
        self.completions.getter(student).get(course_id)
    }

    /// Add admin
    pub fn add_admin(&mut self, admin: Address) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.admins.insert(admin, true);
        Ok(())
    }

    /// Check admin
    pub fn is_admin(&self, addr: Address) -> bool {
        self.admins.get(addr)
    }

    /// Block transfers
    pub fn transfer_from(&mut self, _from: Address, _to: Address, _token_id: U256) -> Result<(), Vec<u8>> {
        Err(b"Soulbound".to_vec())
    }

    /// ERC721 metadata
    pub fn name() -> String {
        "Course Certificate".to_string()
    }

    pub fn symbol() -> String {
        "CERT".to_string()
    }
}