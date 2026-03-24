extern crate alloc;

// Modules and imports
mod erc721;

/// Import the Stylus SDK along with alloy primitive types for use in our program.
use stylus_sdk::{
    abi::Bytes,
    msg,
    prelude::*,
    evm,
    block,
    alloy_primitives::{Address, U256, FixedBytes}
};
use alloy_sol_types::sol;
use crate::erc721::{Erc721, Erc721Params};
use alloc::string::String;
use alloc::vec::Vec;

/// Course Completion NFT Parameters
struct CourseCompletionNFTParams;

/// Immutable definitions for the NFT
impl Erc721Params for CourseCompletionNFTParams {
    const NAME: &'static str = "Course Completion Certificate";
    const SYMBOL: &'static str = "CERT";
}

// Storage structures for courses and certificates
sol_storage! {
    /// Represents a course
    pub struct Course {
        string name;
        address issuer;
        bool active;
    }

    /// Represents certificate metadata
    pub struct CertificateData {
        uint256 course_id;
        uint256 completion_date;
        address student;
        string metadata_cid;  // IPFS CID for full metadata JSON
    }

    /// Main contract storage
    #[entrypoint]
    pub struct CourseCompletionNFT {
        // Inherit ERC721 functionality
        #[borrow]
        Erc721<CourseCompletionNFTParams> erc721;

        // Course data
        mapping(uint256 => Course) courses;
        uint256 next_course_id;

        // Certificate data (tokenId => CertificateData)
        mapping(uint256 => CertificateData) certificates;

        // Access control - simplified
        mapping(address => bool) admins;

        // Track user completions to prevent duplicates
        mapping(address => mapping(uint256 => bool)) user_completions;

        // Token URI base
        string base_uri;
    }
}

// Declare events only
sol! {
    event CourseCreated(uint256 indexed course_id, string name, address indexed issuer);
    event CertificateMinted(uint256 indexed token_id, address indexed student, uint256 indexed course_id);
}

// Internal helper functions
impl CourseCompletionNFT {
    /// Check if caller is admin
    fn only_admin(&self) -> Result<(), Vec<u8>> {
        if !self.admins.get(msg::sender()) {
            return Err(b"Unauthorized".to_vec());
        }
        Ok(())
    }
}

// Public functions
#[public]
#[inherit(Erc721<CourseCompletionNFTParams>)]
impl CourseCompletionNFT {
    /// Initialize the contract with initial admin
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        self.admins.insert(msg::sender(), true);
        self.base_uri.set_str("ipfs://");
        self.next_course_id.set(U256::from(1u8));
        Ok(())
    }

    /// Create a new course (admin only)
    pub fn create_course(&mut self, name: String, issuer: Address) -> Result<U256, Vec<u8>> {
        self.only_admin()?;
        let course_id = self.next_course_id.get();

        let mut course = self.courses.setter(course_id);
        course.name.set_str(&name);
        course.issuer.set(issuer);
        course.active.set(true);

        self.next_course_id.set(course_id + U256::from(1u8));

        evm::log(CourseCreated { course_id, name, issuer });
        Ok(course_id)
    }

    /// Mint a certificate for course completion
    pub fn mint_certificate(
        &mut self,
        student: Address,
        course_id: U256,
        metadata_cid: String,
    ) -> Result<U256, Vec<u8>> {
        // Check course exists and is active
        let course = self.courses.get(course_id);
        if !course.active.get() {
            return Err(b"InvalidCourse".to_vec());
        }

        // Check caller is course issuer or admin
        let caller = msg::sender();
        if !self.admins.get(caller) && course.issuer.get() != caller {
            return Err(b"Unauthorized".to_vec());
        }

        // Check for duplicate certificate
        if self.user_completions.getter(student).get(course_id) {
            return Err(b"DuplicateCertificate".to_vec());
        }

        // Mint NFT
        self.erc721.mint(student)?;
        let token_id = self.erc721.total_supply.get() - U256::from(1u8);

        // Store certificate data
        let mut cert = self.certificates.setter(token_id);
        cert.course_id.set(course_id);
        cert.completion_date.set(U256::from(block::timestamp()));
        cert.student.set(student);
        cert.metadata_cid.set_str(&metadata_cid);

        // Mark completion
        self.user_completions.setter(student).insert(course_id, true);

        evm::log(CertificateMinted { token_id, student, course_id });
        Ok(token_id)
    }

    /// Get certificate data for a token ID
    pub fn get_certificate(&self, token_id: U256) -> Result<(U256, U256, Address, String), Vec<u8>> {
        self.erc721.owner_of(token_id)?;
        let cert = self.certificates.get(token_id);
        Ok((
            cert.course_id.get(),
            cert.completion_date.get(),
            cert.student.get(),
            cert.metadata_cid.get_string(),
        ))
    }

    /// Get course information
    pub fn get_course(&self, course_id: U256) -> (String, Address, bool) {
        let course = self.courses.get(course_id);
        (course.name.get_string(), course.issuer.get(), course.active.get())
    }

    /// Check if user has certificate for a course
    pub fn has_certificate(&self, student: Address, course_id: U256) -> bool {
        self.user_completions.getter(student).get(course_id)
    }

    /// Get token URI for metadata
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        self.erc721.owner_of(token_id)?;
        let cert = self.certificates.get(token_id);
        let metadata_cid = cert.metadata_cid.get_string();
        let base_uri = self.base_uri.get_string();
        let mut full_uri = base_uri;
        full_uri.push_str(&metadata_cid);
        Ok(full_uri)
    }

    /// Get total number of courses
    pub fn get_total_courses(&self) -> U256 {
        let next_id = self.next_course_id.get();
        if next_id == U256::from(0u8) {
            U256::from(0u8)
        } else {
            next_id - U256::from(1u8)
        }
    }

    /// Add an admin (admin only)
    pub fn add_admin(&mut self, new_admin: Address) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.admins.insert(new_admin, true);
        Ok(())
    }

    /// Check if address is admin
    pub fn is_admin(&self, address: Address) -> bool {
        self.admins.get(address)
    }

    /// Override transfers to make soulbound (always fails)
    pub fn transfer_from(&mut self, _from: Address, _to: Address, _token_id: U256) -> Result<(), Vec<u8>> {
        Err(b"TransfersDisabled".to_vec())
    }

    #[selector(name = "safeTransferFrom")]
    pub fn safe_transfer_from(&mut self, _from: Address, _to: Address, _token_id: U256) -> Result<(), Vec<u8>> {
        Err(b"TransfersDisabled".to_vec())
    }

    #[selector(name = "safeTransferFrom")]
    pub fn safe_transfer_from_with_data(&mut self, _from: Address, _to: Address, _token_id: U256, _data: Bytes) -> Result<(), Vec<u8>> {
        Err(b"TransfersDisabled".to_vec())
    }
}