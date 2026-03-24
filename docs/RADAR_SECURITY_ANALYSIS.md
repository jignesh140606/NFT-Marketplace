# Auditware Radar Security Analysis

## Overview

Radar by Auditware is a powerful static analysis tool designed to identify security vulnerabilities in Rust-based smart contracts. It uses a rule engine to detect common security issues like:

- **Unchecked arithmetic** - Integer overflow/underflow vulnerabilities
- **Missing access controls** - Functions without proper authorization
- **Account validation problems** - Improper address handling

## Prerequisites

⚠️ **Docker Required**: Radar requires Docker to be installed and running.

**Windows users**: Must use a WSL terminal.

## Installation

### Option 1: Using the Install Script

```bash
pnpm security:install
```

### Option 2: Manual Installation

```bash
curl -L https://raw.githubusercontent.com/auditware/radar/main/install-radar.sh | bash
```

Or install from source:

```bash
git clone https://github.com/auditware/radar.git
cd radar
bash install-radar.sh
```

**After installation**, restart your terminal or run:

```bash
source ~/.bashrc
```

## Running Analysis

### Using the Script

```bash
pnpm security:analyze
```

### Manual Execution

From your project root:

```bash
radar -p .
```

## Understanding Output

### Console Output

Real-time findings with severity levels:

```
[ Low ] Unchecked Arithmetics found at:
 * /path/to/your/contract/src/lib.rs:49:34-44

[i] radar completed successfully. json results were saved to disk.
[i] Results written to /path/to/output.json
```

### Severity Levels

| Level | Description |
|-------|-------------|
| **High** | Critical vulnerabilities requiring immediate attention |
| **Medium** | Significant issues that should be addressed |
| **Low** | Minor concerns or best practice violations |

### JSON Report

The `output.json` file contains detailed information:

```json
{
  "findings": [
    {
      "severity": "Low",
      "title": "Unchecked Arithmetics",
      "location": "/src/lib.rs:49:34-44",
      "certainty": "high",
      "description": "..."
    }
  ]
}
```

## Best Practices

1. **Run before deployment** - Always analyze before deploying to mainnet
2. **Fix high severity first** - Prioritize critical vulnerabilities
3. **Review low severity** - Even minor issues can compound
4. **Re-run after changes** - Verify fixes don't introduce new issues

## Resources

- [Radar GitHub Repository](https://github.com/auditware/radar)
- [Auditware Documentation](https://auditware.io)

---

💡 **Tip**: The JSON output contains detailed information about each check, including severity, certainty, and locations of issues. Review it carefully to understand what needs to be fixed.
