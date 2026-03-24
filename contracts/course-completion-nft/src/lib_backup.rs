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
use crate::erc721::{Erc721, Erc721Params, Erc721Error};
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
        uint256 course_id;
        string name;
        string content_cid;  // IPFS CID for course content
        address issuer;
        bool active;
        uint256 created_at;
        uint256 total_issued;  // Track how many certificates issued
    }

    /// Represents certificate metadata
    pub struct CertificateData {
        uint256 course_id;
        uint256 completion_date;
        address student;
        bytes32 skills_hash;  // Merkle root of skills learned
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

        // Access control
        mapping(address => bool) admins;
        mapping(address => mapping(uint256 => bool)) course_issuers;  // issuer => courseId => canIssue

        // Track user completions to prevent duplicates (student => courseId => hasCertificate)
        mapping(address => mapping(uint256 => bool)) user_completions;

        // Token URI base
        string base_uri;

        // Soulbound flag
        bool soulbound_enabled;
    }
}

// Declare Solidity error types
sol! {
    /// Caller is not authorized (not admin or issuer)
    error Unauthorized();
    /// Course does not exist or is inactive
    error InvalidCourse(uint256 course_id);
    /// User already has certificate for this course
    error DuplicateCertificate(address student, uint256 course_id);
    /// Transfers are disabled (soulbound)
    error TransfersDisabled();
    /// Course already exists
    error CourseAlreadyExists(uint256 course_id);
    /// Invalid token ID
    error InvalidTokenId(uint256 token_id);

    /// Events
    event CourseCreated(uint256 indexed course_id, string name, address indexed issuer);
    event CertificateMinted(uint256 indexed token_id, address indexed student, uint256 indexed course_id, uint256 completion_date);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event IssuerAdded(address indexed issuer, uint256 indexed course_id);
    event IssuerRemoved(address indexed issuer, uint256 indexed course_id);
    event BaseURIUpdated(string new_base_uri);
    event SoulboundToggled(bool enabled);
}

/// Represents the ways methods may fail.
pub enum CourseCompletionNFTError {
    Unauthorized(Unauthorized),
    InvalidCourse(InvalidCourse),
    DuplicateCertificate(DuplicateCertificate),
    TransfersDisabled(TransfersDisabled),
    CourseAlreadyExists(CourseAlreadyExists),
    InvalidTokenId(InvalidTokenId),
    Erc721Error(Erc721Error),
}

/// Implement Into<Vec<u8>> for error encoding (required by Stylus)
impl Into<Vec<u8>> for CourseCompletionNFTError {
    fn into(self) -> Vec<u8> {
        let msg = match self {
            CourseCompletionNFTError::Unauthorized(_) => "Unauthorized",
            CourseCompletionNFTError::InvalidCourse(_) => "InvalidCourse",
            CourseCompletionNFTError::DuplicateCertificate(_) => "DuplicateCertificate",
            CourseCompletionNFTError::TransfersDisabled(_) => "TransfersDisabled",
            CourseCompletionNFTError::CourseAlreadyExists(_) => "CourseAlreadyExists",
            CourseCompletionNFTError::InvalidTokenId(_) => "InvalidTokenId",
            CourseCompletionNFTError::Erc721Error(_) => "Erc721Error",
        };
        msg.as_bytes().to_vec()
    }
}

// Internal helper functions
impl CourseCompletionNFT {
    /// Check if caller is admin
    fn only_admin(&self) -> Result<(), Vec<u8>> {
        if !self.admins.get(msg::sender()) {
            return Err("Unauthorized".as_bytes().to_vec());
        }
        Ok(())
    }

    /// Check if caller is authorized issuer for a course
    fn only_course_issuer(&self, course_id: U256) -> Result<(), Vec<u8>> {
        let is_issuer = self.course_issuers
            .getter(msg::sender())
            .get(course_id);

        if !is_issuer {
            return Err("Unauthorized".as_bytes().to_vec());
        }
        Ok(())
    }

    /// Check if course exists and is active
    fn require_valid_course(&self, course_id: U256) -> Result<(), Vec<u8>> {
        let course = self.courses.get(course_id);
        if !course.active.get() {
            return Err("InvalidCourse".as_bytes().to_vec());
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
        // Set deployer as first admin
        let deployer = msg::sender();
        self.admins.insert(deployer, true);

        // Set default base URI
        self.base_uri.set_str("ipfs://");

        // Enable soulbound by default
        self.soulbound_enabled.set(true);

        // Initialize next_course_id
        self.next_course_id.set(U256::from(1u8));

        evm::log(AdminAdded { admin: deployer });
        Ok(())
    }

    /// Create a new course (admin only)
    pub fn create_course(
        &mut self,
        name: String,
        content_cid: String,
        issuer: Address,
    ) -> Result<U256, Vec<u8>> {
        self.only_admin()?;

        let course_id = self.next_course_id.get();

        // Initialize course
        let mut course = self.courses.setter(course_id);
        course.course_id.set(course_id);
        course.name.set_str(&name);
        course.content_cid.set_str(&content_cid);
        course.issuer.set(issuer);
        course.active.set(true);
        course.created_at.set(U256::from(block::timestamp()));
        course.total_issued.set(U256::from(0u8));

        // Automatically add issuer for this course
        self.course_issuers.setter(issuer).insert(course_id, true);

        // Increment course ID for next course
        self.next_course_id.set(course_id + U256::from(1u8));

        evm::log(CourseCreated {
            course_id,
            name,
            issuer,
        });

        evm::log(IssuerAdded {
            issuer,
            course_id,
        });

        Ok(course_id)
    }

    /// Mint a certificate for course completion (issuer only)
    pub fn mint_certificate(
        &mut self,
        student: Address,
        course_id: U256,
        skills_hash: FixedBytes<32>,
        metadata_cid: String,
    ) -> Result<U256, Vec<u8>> {
        // Check authorization
        self.only_course_issuer(course_id)?;

        // Check course exists and is active
        self.require_valid_course(course_id)?;

        // Check for duplicate certificate
        if self.user_completions.getter(student).get(course_id) {
            return Err("DuplicateCertificate".as_bytes().to_vec());
        }

        // Mint NFT
        self.erc721.mint(student)?;

        // Get the token ID (total_supply - 1 since we just minted)
        let token_id = self.erc721.total_supply.get() - U256::from(1u8);

        // Store certificate data
        let mut cert = self.certificates.setter(token_id);
        cert.course_id.set(course_id);
        cert.completion_date.set(U256::from(block::timestamp()));
        cert.student.set(student);
        cert.skills_hash.set(skills_hash);
        cert.metadata_cid.set_str(&metadata_cid);

        // Mark user as having completed this course
        self.user_completions.setter(student).insert(course_id, true);

        // Increment course total_issued
        let mut course = self.courses.setter(course_id);
        let current_issued = course.total_issued.get();
        course.total_issued.set(current_issued + U256::from(1u8));

        evm::log(CertificateMinted {
            token_id,
            student,
            course_id,
            completion_date: U256::from(block::timestamp()),
        });

        Ok(token_id)
    }

    /// Get certificate data for a token ID
    pub fn get_certificate(&self, token_id: U256) -> Result<(U256, U256, Address, FixedBytes<32>, String), Vec<u8>> {
        // Verify token exists by checking owner
        self.erc721.owner_of(token_id)?;

        let cert = self.certificates.get(token_id);
        Ok((
            cert.course_id.get(),
            cert.completion_date.get(),
            cert.student.get(),
            cert.skills_hash.get(),
            cert.metadata_cid.get_string(),
        ))
    }

    /// Get course information
    pub fn get_course(&self, course_id: U256) -> Result<(String, String, Address, bool, U256, U256), Vec<u8>> {
        let course = self.courses.get(course_id);
        Ok((
            course.name.get_string(),
            course.content_cid.get_string(),
            course.issuer.get(),
            course.active.get(),
            course.created_at.get(),
            course.total_issued.get(),
        ))
    }

    /// Check if user has certificate for a course
    pub fn has_certificate(&self, student: Address, course_id: U256) -> bool {
        self.user_completions.getter(student).get(course_id)
    }

    /// Get token URI for metadata
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        // Verify token exists
        self.erc721.owner_of(token_id)?;

        let cert = self.certificates.get(token_id);
        let metadata_cid = cert.metadata_cid.get_string();
        let base_uri = self.base_uri.get_string();

        // Return base_uri + metadata_cid
        let mut full_uri = base_uri;
        full_uri.push_str(&metadata_cid);

        Ok(full_uri)
    }

    /// Get total number of courses
    pub fn get_total_courses(&self) -> U256 {
        // next_course_id - 1 gives us the total (since we start at 1)
        let next_id = self.next_course_id.get();
        if next_id == U256::from(0u8) {
            U256::from(0u8)
        } else {
            next_id - U256::from(1u8)
        }
    }

    // ===== Access Control Functions =====

    /// Add an admin (admin only)
    pub fn add_admin(&mut self, new_admin: Address) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.admins.insert(new_admin, true);

        evm::log(AdminAdded { admin: new_admin });
        Ok(())
    }

    /// Remove an admin (admin only)
    pub fn remove_admin(&mut self, admin: Address) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.admins.insert(admin, false);

        evm::log(AdminRemoved { admin });
        Ok(())
    }

    /// Check if address is admin
    pub fn is_admin(&self, address: Address) -> bool {
        self.admins.get(address)
    }

    /// Add course issuer (admin only)
    pub fn add_course_issuer(
        &mut self,
        issuer: Address,
        course_id: U256,
    ) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.course_issuers.setter(issuer).insert(course_id, true);

        evm::log(IssuerAdded { issuer, course_id });
        Ok(())
    }

    /// Remove course issuer (admin only)
    pub fn remove_course_issuer(
        &mut self,
        issuer: Address,
        course_id: U256,
    ) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.course_issuers.setter(issuer).insert(course_id, false);

        evm::log(IssuerRemoved { issuer, course_id });
        Ok(())
    }

    /// Check if address is issuer for a course
    pub fn is_course_issuer(&self, issuer: Address, course_id: U256) -> bool {
        self.course_issuers.getter(issuer).get(course_id)
    }

    // ===== Admin Configuration Functions =====

    /// Set base URI for token metadata (admin only)
    pub fn set_base_uri(&mut self, new_base_uri: String) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.base_uri.set_str(&new_base_uri);

        evm::log(BaseURIUpdated { new_base_uri });
        Ok(())
    }

    /// Toggle soulbound mode (admin only)
    pub fn toggle_soulbound(&mut self, enabled: bool) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        self.soulbound_enabled.set(enabled);

        evm::log(SoulboundToggled { enabled });
        Ok(())
    }

    /// Check if soulbound is enabled
    pub fn is_soulbound(&self) -> bool {
        self.soulbound_enabled.get()
    }

    /// Update course active status (admin only)
    pub fn set_course_active(
        &mut self,
        course_id: U256,
        active: bool,
    ) -> Result<(), Vec<u8>> {
        self.only_admin()?;
        let mut course = self.courses.setter(course_id);
        course.active.set(active);
        Ok(())
    }

    // ===== Override Transfer Functions (Soulbound) =====

    /// Override transferFrom to prevent transfers if soulbound
    pub fn transfer_from(
        &mut self,
        from: Address,
        to: Address,
        token_id: U256,
    ) -> Result<(), Vec<u8>> {
        if self.soulbound_enabled.get() {
            return Err("TransfersDisabled".as_bytes().to_vec());
        }
        self.erc721.transfer_from(from, to, token_id)?;
        Ok(())
    }

    /// Override safeTransferFrom to prevent transfers if soulbound
    #[selector(name = "safeTransferFrom")]
    pub fn safe_transfer_from(
        &mut self,
        from: Address,
        to: Address,
        token_id: U256,
    ) -> Result<(), Vec<u8>> {
        if self.soulbound_enabled.get() {
            return Err("TransfersDisabled".as_bytes().to_vec());
        }
        self.erc721.transfer(token_id, from, to)?;
        Ok(())
    }

    /// Override safeTransferFrom with data to prevent transfers if soulbound
    #[selector(name = "safeTransferFrom")]
    pub fn safe_transfer_from_with_data(
        &mut self,
        from: Address,
        to: Address,
        token_id: U256,
        _data: Bytes,
    ) -> Result<(), Vec<u8>> {
        if self.soulbound_enabled.get() {
            return Err("TransfersDisabled".as_bytes().to_vec());
        }
        self.erc721.transfer(token_id, from, to)?;
        Ok(())
    }
}
