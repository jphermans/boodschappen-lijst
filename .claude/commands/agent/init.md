---
description: Initialize project with AGENT.md and create symlinks for all AI assistants
category: ai-assistant
allowed-tools: Write, Bash(ln:*), Bash(mkdir:*), Bash(test:*), Bash(echo:*), Read, Glob, Task
---

# Initialize AGENT.md for Your Project

Create a comprehensive AGENT.md file following the universal standard, with symlinks for all AI assistants.

## Current Status
!`test -f AGENT.md && echo "⚠️  AGENT.md already exists" || echo "✅ Ready to create AGENT.md"`

## Task

Please analyze this codebase and create an AGENT.md file containing:
1. Build/lint/test commands - especially for running a single test
2. Code style guidelines including imports, formatting, types, naming conventions, error handling, etc.

Usage notes:
- The file you create will be given to agentic coding agents (such as yourself) that operate in this repository
- If there's already an AGENT.md, improve it
- If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include them
- Start the file with: "# AGENT.md\nThis file provides guidance to AI coding assistants working in this repository."

### 1. Gather Repository Information
Use Task tool with description "Gather repository information" to run these Glob patterns in parallel:
- `package*.json` - Node.js project files
- `*.md` - Documentation files
- `.github/workflows/*.yml` - GitHub Actions workflows
- `.github/workflows/*.yaml` - GitHub Actions workflows (alternate extension)
- `.cursor/rules/**` - Cursor rules
- `.cursorrules` - Cursor rules (alternate location)
- `.github/copilot-instructions.md` - GitHub Copilot rules
- `requirements.txt`, `setup.py`, `pyproject.toml` - Python projects
- `go.mod` - Go projects
- `Cargo.toml` - Rust projects
- `Gemfile` - Ruby projects
- `pom.xml`, `build.gradle` - Java projects
- `*.csproj` - .NET projects
- `Makefile` - Build automation
- `.eslintrc*`, `.prettierrc*` - Code style configs
- `tsconfig.json` - TypeScript config
- `.env.example` - Environment configuration
- `**/*.test.*`, `**/*.spec.*` - Test files (limit to a few)
- `Dockerfile`, `docker-compose*.yml` - Docker configuration

Also examine:
- README.md for project overview and command documentation
- package.json scripts to document all available commands
- GitHub workflows to identify CI/CD commands
- A few source files to infer coding conventions
- Test files to understand testing patterns

**Script Consistency Check**: When documenting npm scripts from package.json, verify they match references in:
- GitHub Actions workflows (npm run, npm test, etc.)
- README.md installation and usage sections
- Docker configuration files
- Any setup or deployment scripts

### 2. Check for Existing Configs
- If AGENT.md exists, improve it based on analysis
- If .cursorrules or .cursor/rules/* exist, incorporate them
- If .github/copilot-instructions.md exists, include its content
- If other AI configs exist (.clinerules, .windsurfrules), merge them

### 3. Create AGENT.md
Based on your analysis, create AGENT.md with this structure:

```markdown
# AGENT.md
This file provides guidance to AI coding assistants working in this repository.

**Note:** [Document if CLAUDE.md or other AI config files are symlinks to AGENT.md]

# [Project Name]

[Project Overview: Brief description of the project's purpose and architecture]

## Build & Commands

[Development, testing, and deployment commands with EXACT script names:]

**CRITICAL**: Document the EXACT script names from package.json, not generic placeholders.
For example:
- Build: `npm run build` (if package.json has "build": "webpack")
- Test: `npm test` (if package.json has "test": "jest")
- Type check: `npm run typecheck` (if package.json has "typecheck": "tsc --noEmit")
- Lint: `npm run lint` (if package.json has "lint": "eslint .")

If the project uses different names, document those:
- Type check: `npm run tsc` (if that's what's in package.json)
- Lint: `npm run eslint` (if that's what's in package.json)
- Format: `npm run prettier` (if that's what's in package.json)

[Include ALL commands from package.json scripts, even if they have non-standard names]

### Script Command Consistency
**Important**: When modifying npm scripts in package.json, ensure all references are updated:
- GitHub Actions workflows (.github/workflows/*.yml)
- README.md documentation
- Contributing guides
- Dockerfile/docker-compose.yml
- CI/CD configuration files
- Setup/installation scripts

Common places that reference npm scripts:
- Build commands → Check: workflows, README, Dockerfile
- Test commands → Check: workflows, contributing docs
- Lint commands → Check: pre-commit hooks, workflows
- Start commands → Check: README, deployment docs

**Note**: Always use the EXACT script names from package.json, not assumed names

## Code Style

[Formatting rules, naming conventions, and best practices:]
- Language/framework specifics
- Import conventions
- Formatting rules
- Naming conventions
- Type usage patterns
- Error handling patterns
[Be specific based on actual code analysis]

## Testing

[Testing frameworks, conventions, and execution guidelines:]
- Framework: [Jest/Vitest/Pytest/etc]
- Test file patterns: [*.test.ts, *.spec.js, etc]
- Testing conventions
- Coverage requirements
- How to run specific test suites

### Testing Philosophy
**When tests fail, fix the code, not the test.**

Key principles:
- **Tests should be meaningful** - Avoid tests that always pass regardless of behavior
- **Test actual functionality** - Call the functions being tested, don't just check side effects
- **Failing tests are valuable** - They reveal bugs or missing features
- **Fix the root cause** - When a test fails, fix the underlying issue, don't hide the test
- **Test edge cases** - Tests that reveal limitations help improve the code
- **Document test purpose** - Each test should include a comment explaining why it exists and what it validates

## Security

[Security considerations and data protection guidelines:]
- Authentication/authorization patterns
- Data validation requirements
- Secret management
- Security best practices specific to this project

## Directory Structure & File Organization

### Reports Directory
ALL project reports and documentation should be saved to the `reports/` directory:

```
your-project/
├── reports/              # All project reports and documentation
│   └── *.md             # Various report types
├── temp/                # Temporary files and debugging
└── [other directories]
```

### Report Generation Guidelines
**Important**: ALL reports should be saved to the `reports/` directory with descriptive names:

**Implementation Reports:**
- Phase validation: `PHASE_X_VALIDATION_REPORT.md`
- Implementation summaries: `IMPLEMENTATION_SUMMARY_[FEATURE].md`
- Feature completion: `FEATURE_[NAME]_REPORT.md`

**Testing & Analysis Reports:**
- Test results: `TEST_RESULTS_[DATE].md`
- Coverage reports: `COVERAGE_REPORT_[DATE].md`
- Performance analysis: `PERFORMANCE_ANALYSIS_[SCENARIO].md`
- Security scans: `SECURITY_SCAN_[DATE].md`

**Quality & Validation:**
- Code quality: `CODE_QUALITY_REPORT.md`
- Dependency analysis: `DEPENDENCY_REPORT.md`
- API compatibility: `API_COMPATIBILITY_REPORT.md`

**Report Naming Conventions:**
- Use descriptive names: `[TYPE]_[SCOPE]_[DATE].md`
- Include dates: `YYYY-MM-DD` format
- Group with prefixes: `TEST_`, `PERFORMANCE_`, `SECURITY_`
- Markdown format: All reports end in `.md`

### Temporary Files & Debugging
All temporary files, debugging scripts, and test artifacts should be organized in a `/temp` folder:

**Temporary File Organization:**
- **Debug scripts**: `temp/debug-*.js`, `temp/analyze-*.py`
- **Test artifacts**: `temp/test-results/`, `temp/coverage/`
- **Generated files**: `temp/generated/`, `temp/build-artifacts/`
- **Logs**: `temp/logs/debug.log`, `temp/logs/error.log`

**Guidelines:**
- Never commit files from `/temp` directory
- Use `/temp` for all debugging and analysis scripts created during development
- Clean up `/temp` directory regularly or use automated cleanup
- Include `/temp/` in `.gitignore` to prevent accidental commits

### Example `.gitignore` patterns
```
# Temporary files and debugging
/temp/
temp/
**/temp/
debug-*.js
test-*.py
analyze-*.sh
*-debug.*
*.debug

# Claude settings
.claude/settings.local.json

# Don't ignore reports directory
!reports/
!reports/**
```

### Claude Code Settings (.claude Directory)

The `.claude` directory contains Claude Code configuration files with specific version control rules:

#### Version Controlled Files (commit these):
- `.claude/settings.json` - Shared team settings for hooks, tools, and environment
- `.claude/commands/*.md` - Custom slash commands available to all team members
- `.claude/hooks/*.sh` - Hook scripts for automated validations and actions

#### Ignored Files (do NOT commit):
- `.claude/settings.local.json` - Personal preferences and local overrides
- Any `*.local.json` files - Personal configuration not meant for sharing

**Important Notes:**
- Claude Code automatically adds `.claude/settings.local.json` to `.gitignore`
- The shared `settings.json` should contain team-wide standards (linting, type checking, etc.)
- Personal preferences or experimental settings belong in `settings.local.json`
- Hook scripts in `.claude/hooks/` should be executable (`chmod +x`)

## Configuration

[Environment setup and configuration management:]
- Required environment variables
- Configuration files and their purposes
- Development environment setup
- Dependencies and version requirements
```

Think about what you'd tell a new team member on their first day. Include these key sections:

1. **Project Overview** - Brief description of purpose and architecture
2. **Build & Commands** - All development, testing, and deployment commands
3. **Code Style** - Formatting rules, naming conventions, best practices
4. **Testing** - Testing frameworks, conventions, execution guidelines
5. **Security** - Security considerations and data protection
6. **Configuration** - Environment setup and configuration management

Additional sections based on project needs:
- Architecture details for complex projects
- API documentation
- Database schemas
- Deployment procedures
- Contributing guidelines

**Important:** 
- Include content from any existing .cursorrules or copilot-instructions.md files
- Focus on practical information that helps AI assistants write better code
- Be specific and concrete based on actual code analysis

### 4. Create Directory Structure
Create the reports directory and documentation structure:

```bash
# Create reports directory
mkdir -p reports

# Create reports README template
cat > reports/README.md << 'EOF'
# Reports Directory

This directory contains ALL project reports including validation, testing, analysis, performance benchmarks, and any other documentation generated during development.

## Report Categories

### Implementation Reports
- Phase/milestone completion reports
- Feature implementation summaries
- Technical implementation details

### Testing & Analysis Reports
- Test execution results
- Code coverage analysis
- Performance test results
- Security analysis reports

### Quality & Validation
- Code quality metrics
- Dependency analysis
- API compatibility reports
- Build and deployment validation

## Purpose

These reports serve as:
1. **Progress tracking** - Document completion of development phases
2. **Quality assurance** - Validate implementations meet requirements
3. **Knowledge preservation** - Capture decisions and findings
4. **Audit trail** - Historical record of project evolution

## Naming Conventions

- Use descriptive names: `[TYPE]_[SCOPE]_[DATE].md`
- Include dates: `YYYY-MM-DD` format
- Group with prefixes: `TEST_`, `PERFORMANCE_`, `SECURITY_`
- Markdown format: All reports end in `.md`

## Version Control

All reports are tracked in git to maintain historical records.
EOF
```

### 5. Create Symlinks
After creating AGENT.md and directory structure, create symlinks for all AI assistants and document this in AGENT.md:

```bash
# Claude Code
ln -sf AGENT.md CLAUDE.md

# Cline
ln -sf AGENT.md .clinerules

# Cursor
ln -sf AGENT.md .cursorrules

# Windsurf
ln -sf AGENT.md .windsurfrules

# Replit
ln -sf AGENT.md .replit.md

# Gemini CLI, OpenAI Codex, OpenCode
ln -sf AGENT.md GEMINI.md

# GitHub Copilot (needs directory)
mkdir -p .github
ln -sf ../AGENT.md .github/copilot-instructions.md

# Firebase Studio (needs directory)
mkdir -p .idx
ln -sf ../AGENT.md .idx/airules.md
```

### 6. Show Results
Display:
- Created/updated AGENT.md
- Created reports directory structure
- List of symlinks created
- Key information included in the file
- Suggest reviewing and customizing if needed

**Important:** Make sure to add a note at the top of AGENT.md documenting which files are symlinks to AGENT.md. For example:
```markdown
**Note:** CLAUDE.md, .clinerules, .cursorrules, and other AI config files are symlinks to AGENT.md in this project.
```

