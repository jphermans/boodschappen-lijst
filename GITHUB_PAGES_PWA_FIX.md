# GitHub Pages PWA Fix

## Issue
When adding the website to the home screen as a PWA and opening it, the URL path gets stripped and it tries to open just the base GitHub Pages URL without the repository path, causing a 404 error.

**Example:**
- Website URL: `https://username.github.io/repository-name/`
- PWA opens: `https://username.github.io/` (missing repository name)
- Result: 404 error

## Root Cause
The PWA manifest was using absolute paths (`/`) for `start_url` and `scope`, which don't work correctly with GitHub Pages subdirectory deployments.

## Solution Applied

### 1. Updated PWA Manifest (`public/manifest.json`)
Changed from absolute to relative paths:

**Before:**
```json
{
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icon.svg",
      ...
    }
  ]
}
```

**After:**
```json
{
  "start_url": "./",
  "scope": "./",
  "icons": [
    {
      "src": "./icon.svg",
      ...
    }
  ]
}
```

### 2. Key Changes Made
- ✅ `start_url`: Changed from `"/"` to `"./"` (relative path)
- ✅ `scope`: Changed from `"/"` to `"./"` (relative path)
- ✅ All icon `src` paths: Changed from `"/icon.svg"` to `"./icon.svg"` (relative paths)

## How It Works
- **Relative paths (`./`)**: Work from the current directory where the manifest is served
- **Absolute paths (`/`)**: Always go to the root domain, ignoring subdirectories
- **GitHub Pages**: Serves apps from subdirectories like `/repository-name/`

## Testing the Fix

### Step 1: Deploy Changes
1. Commit and push the updated `manifest.json`
2. Wait for GitHub Pages to rebuild (usually 1-2 minutes)
3. Verify the site loads at your GitHub Pages URL

### Step 2: Test PWA Installation
1. **On Mobile (iOS/Android):**
   - Open Safari/Chrome and navigate to your GitHub Pages URL
   - Tap the Share button (iOS) or Menu (Android)
   - Select "Add to Home Screen"
   - Confirm the installation

2. **On Desktop (Chrome/Edge):**
   - Navigate to your GitHub Pages URL
   - Look for the install icon in the address bar
   - Click "Install" when prompted

### Step 3: Test PWA Launch
1. **From Home Screen:**
   - Tap/click the installed app icon
   - The app should open to the correct URL with the repository path
   - Verify it doesn't show a 404 error

2. **Check URL:**
   - The opened app should show the full correct URL
   - Should include the repository name in the path

## Expected Results
✅ **Before Fix:** PWA opens to `https://username.github.io/` → 404 error
✅ **After Fix:** PWA opens to `https://username.github.io/repository-name/` → App loads correctly

## Additional Benefits
- **Better offline support**: Relative paths work better with service workers
- **Portable deployment**: Works on any subdirectory or custom domain
- **Consistent behavior**: Same behavior across different hosting environments

## Troubleshooting

### If PWA Still Opens to Wrong URL:
1. **Clear browser cache** and try again
2. **Remove and re-add** the PWA to home screen
3. **Check manifest.json** is being served with correct content-type
4. **Verify GitHub Pages** deployment completed successfully

### If Icons Don't Load:
1. **Check icon files exist** in the `public/` folder
2. **Verify relative paths** are correct in manifest.json
3. **Test icon URLs** directly in browser

### Browser Developer Tools Check:
1. Open DevTools → Application → Manifest
2. Verify `start_url` shows the correct relative path
3. Check that all icon URLs resolve correctly

## Notes
- This fix is specifically for **GitHub Pages** deployments
- Works with **any repository name** or **custom domains**
- **No code changes needed** - only manifest.json updates
- Compatible with all **modern browsers** that support PWAs

The fix ensures your PWA works correctly when installed from GitHub Pages, opening to the right URL every time.