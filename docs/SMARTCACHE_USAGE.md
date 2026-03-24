# SmartCache is_cacheable() Usage Guide

SmartCache is a gas optimization layer for Arbitrum Stylus that warms storage slots for frequently accessed contracts.

## The is_cacheable Function

To enable your contract for SmartCache, you must implement the `is_cacheable` function. This function tells the Arbitrum sequencer that your contract is compatible with the caching layer.

### Implementation Pattern (Stylus Rust)

```rust
use stylus_sdk::prelude::*;

#[public]
impl MyContract {
    /// Returns whether this contract is cacheable
    /// SmartCache sequencer checks this to decide if storage should be warmed
    pub fn is_cacheable(&self) -> bool {
        true
    }
}
```

### Why use is_cacheable?

1. **Lower Gas Costs**: Repeated access to storage slots becomes significantly cheaper (up to 95% reduction).
2. **Improved Latency**: Faster response times for read-heavy operations.
3. **Optimized for Stylus**: Specifically designed for the WASM-based Stylus runtime.

### Integrating with stylus-cache-sdk

For more advanced caching controls, use the `stylus-cache-sdk`:

```rust
use stylus_cache_sdk::{is_contract_cacheable};

#[public]
impl MyContract {
    pub fn is_cacheable(&self) -> bool {
        is_contract_cacheable() // Dynamically controlled by SDK
    }
}
```

## Supported Contract Types

Currently, SmartCache is optimally supported for **Stylus Rust Contracts**. If you are using other contract types (like Solidity), you may still see benefits from general L2 caching, but the explicit `is_cacheable` hook is a Stylus-specific feature.
