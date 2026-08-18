---
name: dev-stack-setup
description: Install and configure development toolchains (languages, runtimes, SDKs) on demand. Use when working on projects that require languages or runtimes not pre-installed in the container image.
---

# Development Stack Setup

## When to Use

- Project requires a language/runtime not available in the container
- First run on a repo with a `.nvmrc`, `.ruby-version`, `go.mod`, `pom.xml`, etc.
- User explicitly requests a language installation
- Build/test fails due to missing toolchain

## Detection

Check project root for indicators:

| File | Language |
|------|----------|
| `package.json`, `.nvmrc`, `.node-version` | Node.js |
| `requirements.txt`, `pyproject.toml`, `Pipfile`, `.python-version` | Python |
| `Gemfile`, `.ruby-version`, `*.gemspec` | Ruby |
| `go.mod`, `go.sum` | Go |
| `pom.xml`, `build.gradle`, `*.kt` | Java/Kotlin |
| `*.csproj`, `*.sln`, `global.json` | .NET |
| `Cargo.toml` | Rust |
| `composer.json` | PHP |
| `mix.exs` | Elixir |
| `rebar.config`, `*.erl` | Erlang |

## Installation Commands

This container runs Alpine Linux. Use `apk` for system packages.

### Node.js

Node.js is pre-installed. For version management:

```sh
# Check current version
node -v && npm -v

# Install nvm for version switching
export NVM_DIR="$HOME/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. "$NVM_DIR/nvm.sh"
nvm install 22  # or read .nvmrc
```

### Python

Python 3.12 and 3.13 are pre-installed via uv.

```sh
# Check versions
python3 --version
uv python list

# Install additional Python version
uv python install 3.11

# Create venv
uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt
```

### Ruby

```sh
apk add --no-cache ruby ruby-dev ruby-bundler build-base
gem install bundler
bundle install
```

### Go

```sh
apk add --no-cache go
go version
go mod download
```

### Java / Kotlin

```sh
# OpenJDK 21 (LTS)
apk add --no-cache openjdk21 openjdk21-jdk
java -version

# For Gradle projects
apk add --no-cache gradle

# For Maven projects
apk add --no-cache maven
```

### .NET

.NET 8, 9, and 10 SDKs are pre-installed.

```sh
dotnet --list-sdks
dotnet restore
dotnet build
```

### Rust

```sh
apk add --no-cache rust cargo
rustc --version && cargo --version
```

### PHP

```sh
apk add --no-cache php php-cli php-common php-json php-mbstring php-xml php-curl php-zip php-pdo php-pdo_sqlite php-sqlite3
composer install
```

### Elixir

```sh
apk add --no-cache elixir
elixir --version
mix deps.get
```

### Erlang

```sh
apk add --no-cache erlang
erl -version
```

## Best Practices

1. **Check before installing** — Always verify if the tool is already present before running `apk add`
2. **Pin versions** — When possible, pin to specific versions matching the project requirements
3. **Use project-local installs** — Prefer `nvm`, `uv`, `rbenv`, `asdf` over system-wide when version conflicts are possible
4. **Clean up** — After installing, remove build dependencies if not needed: `apk del build-base` (keep runtime deps)
5. **Document** — Add installed toolchain info to the issue or project notes so other agents know what's available
6. **Test** — Run `--version` or a simple compile/test to confirm the installation works

## Verification

After installation, always verify:

```sh
# Language-specific version check
<command> --version

# Project-specific build/test
# e.g., npm test, go build, dotnet build, bundle exec rake, etc.
```

## Fallback

If `apk` doesn't have the package you need:

```sh
# Use official installers
curl -fsSL https://raw.githubusercontent.com/<lang>/install.sh | sh

# Or download binaries directly
wget -qO- <url> | tar -xzf - -C /usr/local/bin
```
