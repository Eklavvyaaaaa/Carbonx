# Carbonx

Carbonx is a decentralized carbon credit management platform built on the Algorand blockchain using AlgoKit. It enables transparent issuance, transfer, and retirement of carbon credits via smart contracts written in Algorand Python (Puya). The project leverages Algorand's energy-efficient, carbon-negative infrastructure to provide a sustainable and trustworthy foundation for carbon market operations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Debugging](#debugging)
- [Project Structure](#project-structure)
- [Tools and Dependencies](#tools-and-dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Carbonx uses Algorand smart contracts to represent and manage carbon credits on-chain. Algorand was selected as the underlying blockchain for its pure proof-of-stake consensus mechanism, which is inherently energy-efficient and carbon-negative, making it a natural choice for sustainability-focused applications.

The project is scaffolded with AlgoKit, Algorand's official developer toolkit, and uses Algorand Python (compiled via Puya) to write type-safe, auditable smart contract logic that runs on the Algorand Virtual Machine (AVM).

---

## Architecture

The repository is organized as an AlgoKit workspace that can support multiple smart contract projects under a single monorepo structure.

```
Carbonx/
  .algokit/              AlgoKit configuration and caches
  .tours/                Interactive VS Code CodeTour walkthroughs
  .vscode/               VS Code workspace settings and recommended extensions
  projects/              Smart contract sub-projects
  .algokit.toml          Workspace-level AlgoKit configuration
  pyproject.toml         Python project metadata and tool configuration
  poetry.toml            Poetry virtual environment settings
  poetry.lock            Locked dependency tree
  Carbonx.code-workspace VS Code multi-root workspace file
```

Each sub-project under `projects/` follows the standard AlgoKit Python smart contract layout:

```
projects/<contract-name>/
  smart_contracts/
    <contract-name>/
      contract.py        Algorand Python smart contract definition
      deploy_config.py   Deployment logic for this contract
    config.py            Build orchestration (builds all or selected contracts)
    __main__.py          Entry point for deployment and debugging
  tests/                 Pytest test suite
```

---

## Prerequisites

Ensure the following tools are installed and available on your system before proceeding.

**Required**

- Python 3.12 or later — [Download](https://www.python.org/downloads/)
- Docker — Required to run a local Algorand network (LocalNet). [Install Docker](https://www.docker.com/)
- AlgoKit CLI 2.0.0 or later — [Installation Guide](https://github.com/algorandfoundation/algokit-cli#install)
- Poetry 1.2 or later — [Installation Guide](https://python-poetry.org/docs/#installation)

**Verification**

```bash
python --version       # Must be 3.12+
docker --version       # Any recent stable version
algokit --version      # Must be 2.0.0 or later
poetry -V              # Must be 1.2 or later
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Eklavvyaaaaa/Carbonx.git
cd Carbonx
```

### 2. Bootstrap the Project

Run the AlgoKit bootstrap command to install all Python dependencies and create the virtual environment:

```bash
algokit project bootstrap all
```

This installs packages defined in `pyproject.toml` into a `.venv` directory at the repository root.

### 3. Activate the Virtual Environment

```bash
# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\.venv\Scripts\activate.bat
```

---

## Configuration

Carbonx uses environment files to configure network endpoints. These are not committed to the repository and must be generated locally.

### Generate a LocalNet Environment File

```bash
algokit generate env-file -a target_network localnet
```

This creates a `.env.localnet` file with default `algod` and `indexer` configuration for local development.

### Generate Environment Files for Other Networks

```bash
algokit generate env-file -a target_network testnet
algokit generate env-file -a target_network mainnet
```

The generated file follows the naming convention `.env.<target_network>` and can be customized with your own node endpoints and API keys.

### Start LocalNet

```bash
algokit localnet start
```

This starts a local Algorand network using Docker. You can stop it with `algokit localnet stop` and reset state with `algokit localnet reset`.

---

## Development Workflow

### Building Smart Contracts

Compile all contracts in the workspace:

```bash
algokit project run build
```

Compile a specific contract by name:

```bash
algokit project run build -- <contract_name>
```

This compiles Algorand Python source files to AVM bytecode and generates ABI definitions and typed client files.

### Deploying Contracts

Deploy all contracts to LocalNet:

```bash
algokit project deploy localnet
```

Deploy a specific contract:

```bash
algokit project deploy localnet -- <contract_name>
```

Replace `localnet` with `testnet` or `mainnet` to deploy to other networks. Ensure the corresponding `.env.<network>` file exists before deploying.

---

## Smart Contracts

### Generating a New Smart Contract

From the repository root, run:

```bash
algokit generate smart-contract
```

This scaffolds a new contract directory under `smart_contracts/` with the following files:

- `contract.py` — The Algorand Python smart contract class
- `deploy_config.py` — Deployment logic specific to this contract

After generation, define your contract's creation parameters and deployment steps in `deploy_config.py`. The `config.py` file at the `smart_contracts/` level automatically discovers and builds all contracts in the directory.

### Algorand Python Contract Structure

Contracts are written as Python classes that inherit from `algopy.ARC4Contract` (or `algopy.Contract`). Below is an illustrative example of a carbon credit issuance contract:

```python
from algopy import ARC4Contract, GlobalState, Txn, UInt64, arc4

class CarbonCredit(ARC4Contract):
    total_credits: GlobalState[UInt64]

    @arc4.abimethod(create="require")
    def create(self, initial_supply: UInt64) -> None:
        self.total_credits.value = initial_supply

    @arc4.abimethod
    def issue(self, amount: UInt64) -> None:
        assert Txn.sender == Global.creator_address, "Only creator can issue credits"
        self.total_credits.value += amount

    @arc4.abimethod
    def retire(self, amount: UInt64) -> None:
        assert self.total_credits.value >= amount, "Insufficient credits"
        self.total_credits.value -= amount
```

Refer to the [Algorand Python documentation](https://github.com/algorandfoundation/puya) for the full language reference.

---

## Testing

Tests are written with Pytest and AlgoKit Utils. They run against a LocalNet instance.

Ensure LocalNet is running before executing tests:

```bash
algokit localnet start
```

Run the test suite:

```bash
pytest
```

Run tests for a specific contract:

```bash
pytest projects/<contract_name>/tests/
```

---

## Deployment

### LocalNet

```bash
algokit project deploy localnet
```

### TestNet

```bash
algokit project deploy testnet
```

Ensure `.env.testnet` is present and contains valid `algod` and `indexer` endpoint URLs and an account mnemonic with sufficient funds.

### MainNet

```bash
algokit project deploy mainnet
```

Use caution when deploying to MainNet. Ensure contracts are audited and `.env.mainnet` is secured and never committed to version control.

---

## Debugging

### AlgoKit AVM Debugger (VS Code)

The project is optimized for the AlgoKit AVM Debugger extension for VS Code.

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=algorandfoundation.algokit-avm-vscode-debugger).
2. Refer to the commented header in `smart_contracts/__main__.py` to enable debug trace generation.
3. Use the `Debug TEAL via AlgoKit AVM Debugger` launch configuration to select a trace file and start a debug session.

### VS Code Debugging (General)

1. Open the repository root in VS Code.
2. Install recommended extensions when prompted.
3. Press `F5` to start a debug session.
4. On Windows, select the Python interpreter at `.\.venv\Scripts\python.exe` via `Ctrl+Shift+P` > `Python: Select Interpreter` before the first run.

### JetBrains IDE Debugging

1. Open the repository root in your JetBrains IDE.
2. The IDE will auto-configure the Python interpreter from the `.venv` virtual environment.
3. Use `Shift+F10` or `Ctrl+R` to start debugging.
4. Windows users may encounter issues with pre-launch tasks due to a known JetBrains bug. See the [JetBrains issue tracker](https://youtrack.jetbrains.com/issue/IDEA-277486/Shell-script-configuration-cannot-run-as-before-launch-task) for workarounds.

---

## Project Structure

```
Carbonx/
  .algokit/
    generators/             AlgoKit generator templates
  .tours/
    getting-started-with-your-algokit-project.tour   CodeTour walkthrough
  .vscode/
    extensions.json         Recommended VS Code extensions
    launch.json             Debug configurations
    settings.json           Workspace settings
  projects/
    <contract-name>/
      smart_contracts/
        <contract-name>/
          contract.py       Smart contract source
          deploy_config.py  Deployment configuration
        config.py           Build orchestration
        __main__.py         Deployment entry point
      tests/
        test_<contract>.py  Pytest test cases
  .algokit.toml             AlgoKit workspace configuration
  .editorconfig             Editor formatting rules
  .gitattributes            Git line ending settings
  .gitignore                Files excluded from version control
  pyproject.toml            Python dependencies and tool config
  poetry.lock               Locked dependency versions
  poetry.toml               Poetry local venv setting
  Carbonx.code-workspace    VS Code workspace file
  README.md                 This file
```

---

## Tools and Dependencies

| Tool | Purpose | Reference |
|------|---------|-----------|
| Algorand | Layer 1 blockchain | [algorand.com](https://www.algorand.com/) |
| AlgoKit CLI | Developer toolkit for Algorand | [GitHub](https://github.com/algorandfoundation/algokit-cli) |
| Algorand Python (Puya) | Typed Python for AVM smart contracts | [GitHub](https://github.com/algorandfoundation/puya) |
| AlgoKit Utils (Python) | Utility library for Algorand interaction | [GitHub](https://github.com/algorandfoundation/algokit-utils-py) |
| Poetry | Python dependency management | [python-poetry.org](https://python-poetry.org/) |
| Docker | LocalNet container runtime | [docker.com](https://www.docker.com/) |
| Pytest | Test framework | [pytest.org](https://pytest.org/) |

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Bootstrap your local environment as described in the [Installation](#installation) section.
3. Write or update tests for any changed functionality.
4. Ensure all tests pass against LocalNet before submitting a pull request.
5. Open a pull request with a clear description of your changes.

---

## License

This project does not currently specify a license. Contact the repository owner for usage terms.
