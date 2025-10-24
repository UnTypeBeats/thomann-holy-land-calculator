# Git Branching Strategy

## Branch Structure

We use a simple two-branch strategy:

### `main` - Production Branch
- **Purpose**: Stable, production-ready code only
- **Protection**: Merges only via pull requests from `develop`
- **Tags**: Version releases (v2.1.0, v2.2.0, etc.)
- **When to merge**: After testing is complete and ready for Chrome Web Store

### `develop` - Development Branch
- **Purpose**: Active development, integration branch
- **Default**: Use this branch for daily work
- **Commits**: Direct commits allowed
- **Testing**: Continuous testing before merging to main

### Feature Branches (Optional)
- **Pattern**: `feature/icon-creation`, `feature/screenshot-workflow`
- **Purpose**: Large features that need isolation
- **Merge to**: `develop` (not main)

## Workflow

### Daily Development
```bash
# Always work on develop
git checkout develop
git pull origin develop

# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "feat: your changes"
git push origin develop
```

### Releasing to Production
```bash
# When develop is stable and tested
git checkout main
git merge develop --no-ff
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin main --tags

# Return to develop
git checkout develop
```

### Quick Fixes on Main
```bash
# For critical production fixes only
git checkout main
git checkout -b hotfix/critical-bug
# ... fix bug ...
git commit -m "fix: critical bug"

# Merge to both main and develop
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug
git branch -d hotfix/critical-bug
```

## Current Status

- ✅ `main` - Production-ready code (v2.1.0)
- ✅ `develop` - Active development (default branch)
- 🎨 Working on: Visual assets (icons + screenshots)

## Commands Reference

```bash
# Check current branch
git branch

# Switch branches
git checkout develop
git checkout main

# See all branches
git branch -a

# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name
```

## Best Practices

1. **Always start on develop**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Commit often with clear messages**
   ```bash
   git commit -m "feat: add icon creation guide"
   git commit -m "fix: update manifest icon paths"
   git commit -m "docs: improve setup instructions"
   ```

3. **Keep develop in sync**
   ```bash
   git push origin develop
   ```

4. **Only merge to main when ready for release**
   - All features tested
   - Documentation updated
   - Version number bumped
   - Ready for Chrome Web Store

5. **Tag releases on main**
   ```bash
   git tag -a v2.2.0 -m "Release v2.2.0"
   git push --tags
   ```

## For Claude Code Sessions

When starting a new session:
1. Claude will work on `develop` by default
2. Commits will go to `develop`
3. When a milestone is ready, merge to `main`
4. Tag the release

## GitHub Setup (Optional)

To set `develop` as the default branch on GitHub:
1. Go to repository Settings
2. Branches → Default branch
3. Change from `main` to `develop`
4. Click "Update"

This way, pull requests default to `develop` instead of `main`.

---

**Current branch**: `develop` ✅
**Ready for**: Visual asset creation and further development
