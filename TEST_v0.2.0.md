# 🧪 Testing Guide for v0.2.0

## Quick Start Testing

### 1. Load the Extension
1. Open Chrome/Edge/Brave
2. Go to extensions page (chrome://extensions)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the SlipStream folder
6. Verify extension appears in toolbar

### 2. Open Salesforce
1. Navigate to any Salesforce Lightning page
2. Press **F8** (easiest) or **Cmd+Shift+L** or **Cmd+Shift+Space**
3. Verify SlipStream UI appears

---

## Test Cases

### ✅ Basic Commands

#### Test 1: Setup Home
```
Input:  open setup
Expected: Navigates to /lightning/setup/SetupOneHome/home
Result:  [ ] PASS  [ ] FAIL
```

#### Test 2: Setup Home (Alias)
```
Input:  open setup home
Expected: Navigates to /lightning/setup/SetupOneHome/home
Result:  [ ] PASS  [ ] FAIL
```

#### Test 3: Object Manager
```
Input:  open object manager
Expected: Navigates to /lightning/setup/ObjectManager/home
Result:  [ ] PASS  [ ] FAIL
```

#### Test 4: Developer Console
```
Input:  open dev console
Expected: Opens Developer Console in NEW TAB
Result:  [ ] PASS  [ ] FAIL
```

#### Test 5: Developer Console (Alias)
```
Input:  open developer console
Expected: Opens Developer Console in NEW TAB
Result:  [ ] PASS  [ ] FAIL
```

---

### ✅ Object-Specific Commands

#### Test 6: Open Account Object
```
Input:  open setup Account
Expected: Navigates to /lightning/setup/ObjectManager/Account/Details/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 7: Open Contact Object
```
Input:  open setup Contact
Expected: Navigates to /lightning/setup/ObjectManager/Contact/Details/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 8: Open Custom Object
```
Input:  open setup MyCustomObject__c
Expected: Navigates to /lightning/setup/ObjectManager/MyCustomObject__c/Details/view
Result:  [ ] PASS  [ ] FAIL
Notes:  (Replace with actual custom object from your org)
```

---

### ✅ Fields Commands

#### Test 9: Account Fields List
```
Input:  open setup Account Fields
Expected: Navigates to /lightning/setup/ObjectManager/Account/FieldsAndRelationships/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 10: Specific Field (Account.Industry)
```
Input:  open setup Account Field Industry
Expected: Navigates to Account fields page (field search needed)
Result:  [ ] PASS  [ ] FAIL
Notes:  Currently navigates to fields list, not specific field
```

#### Test 11: Contact Fields
```
Input:  open setup Contact Fields
Expected: Navigates to /lightning/setup/ObjectManager/Contact/FieldsAndRelationships/view
Result:  [ ] PASS  [ ] FAIL
```

---

### ✅ Page Layouts Commands

#### Test 12: Account Layouts
```
Input:  open setup Account Layout Standard
Expected: Navigates to /lightning/setup/ObjectManager/Account/PageLayouts/view
Result:  [ ] PASS  [ ] FAIL
Notes:  Currently navigates to layouts list, not specific layout
```

#### Test 13: Opportunity Layouts
```
Input:  open setup Opportunity Layout Sales Layout
Expected: Navigates to /lightning/setup/ObjectManager/Opportunity/PageLayouts/view
Result:  [ ] PASS  [ ] FAIL
```

---

### ✅ Lightning Pages (Flexi Pages)

#### Test 14: Account Lightning Page
```
Input:  open setup Account Flexi Page Account_Record_Page
Expected: Navigates to /lightning/setup/FlexiPageList/home
Result:  [ ] PASS  [ ] FAIL
Notes:  Currently navigates to Lightning Pages list
```

---

### ✅ Validation Rules

#### Test 15: Account Validation Rules
```
Input:  open setup Account Validation Rules
Expected: Navigates to /lightning/setup/ObjectManager/Account/ValidationRules/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 16: Opportunity Validation Rules
```
Input:  open setup Opportunity Validation Rules
Expected: Navigates to /lightning/setup/ObjectManager/Opportunity/ValidationRules/view
Result:  [ ] PASS  [ ] FAIL
```

---

### ✅ Compact Layouts

#### Test 17: Account Compact Layouts
```
Input:  open setup Account Compact Layouts
Expected: Navigates to /lightning/setup/ObjectManager/Account/CompactLayouts/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 18: Contact Compact Layouts
```
Input:  open setup Contact Compact Layouts
Expected: Navigates to /lightning/setup/ObjectManager/Contact/CompactLayouts/view
Result:  [ ] PASS  [ ] FAIL
```

---

### ✅ Record Types

#### Test 19: Account Record Types
```
Input:  open setup Account Record Types
Expected: Navigates to /lightning/setup/ObjectManager/Account/RecordTypes/view
Result:  [ ] PASS  [ ] FAIL
```

#### Test 20: Opportunity Record Types
```
Input:  open setup Opportunity Record Types
Expected: Navigates to /lightning/setup/ObjectManager/Opportunity/RecordTypes/view
Result:  [ ] PASS  [ ] FAIL
```

---

## UI/UX Testing

### Command Suggestions

#### Test 21: Typing "open" Shows Suggestions
```
Action: Type "open" (just the word "open")
Expected: Shows suggestions including:
  - open setup
  - open object manager
  - open dev console
  - open setup Account
  - open setup Contact
  - open setup Opportunity
Result: [ ] PASS  [ ] FAIL
```

#### Test 22: Typing "open se" Shows Setup Commands
```
Action: Type "open se"
Expected: Shows "open setup" and "open setup home" as top suggestions
Result: [ ] PASS  [ ] FAIL
```

#### Test 23: Typing "open setup acc" Shows Account Commands
```
Action: Type "open setup acc"
Expected: Shows Account-related commands
Result: [ ] PASS  [ ] FAIL
```

#### Test 24: Invalid Command Shows "No Results"
```
Action: Type "xyz123abc"
Expected: Shows "No commands found" with helpful hints
Result: [ ] PASS  [ ] FAIL
```

---

### Keyboard Navigation

#### Test 25: Arrow Down Selects Next
```
Action: 
  1. Type "open"
  2. Press ↓ (down arrow)
Expected: Second item becomes selected (highlighted)
Result: [ ] PASS  [ ] FAIL
```

#### Test 26: Arrow Up Selects Previous
```
Action:
  1. Type "open"
  2. Press ↓ twice
  3. Press ↑ once
Expected: First item after initial becomes selected
Result: [ ] PASS  [ ] FAIL
```

#### Test 27: Enter Executes Selected Command
```
Action:
  1. Type "open setup"
  2. Press Enter
Expected: Navigates to Setup home page
Result: [ ] PASS  [ ] FAIL
```

#### Test 28: ESC Closes Palette
```
Action:
  1. Open palette (F8)
  2. Type something
  3. Press ESC
Expected: Palette closes, page unchanged
Result: [ ] PASS  [ ] FAIL
```

---

### Mouse Interactions

#### Test 29: Click on Suggestion Executes
```
Action:
  1. Type "open"
  2. Click on "open setup" suggestion
Expected: Navigates to Setup home
Result: [ ] PASS  [ ] FAIL
```

#### Test 30: Click Backdrop Closes Palette
```
Action:
  1. Open palette
  2. Click on dark background (outside white box)
Expected: Palette closes
Result: [ ] PASS  [ ] FAIL
```

---

## Edge Cases

#### Test 31: Empty Input Shows Welcome State
```
Action: Open palette, don't type anything
Expected: Shows welcome message with SlipStream logo
Result: [ ] PASS  [ ] FAIL
```

#### Test 32: Case Insensitive Commands
```
Input:  OPEN SETUP
Expected: Works the same as "open setup"
Result: [ ] PASS  [ ] FAIL
```

#### Test 33: Extra Spaces Handled
```
Input:  "  open   setup  " (extra spaces)
Expected: Matches and executes correctly
Result: [ ] PASS  [ ] FAIL
```

#### Test 34: Custom Object with Namespace
```
Input:  open setup namespace__CustomObject__c
Expected: Navigates to custom object page
Result: [ ] PASS  [ ] FAIL
Notes:  (Test with actual namespaced object if available)
```

---

## Performance Testing

#### Test 35: Suggestions Appear Instantly
```
Action: Type "open setup"
Expected: Suggestions appear within 100ms
Result: [ ] PASS  [ ] FAIL
Notes:  Should feel instant, no lag
```

#### Test 36: Navigation is Immediate
```
Action: Execute "open setup" command
Expected: Navigation starts immediately (within 50ms)
Result: [ ] PASS  [ ] FAIL
```

---

## Browser Compatibility

#### Test 37: Chrome
```
Browser: Google Chrome
Version: _________
Result: [ ] PASS  [ ] FAIL
Notes:
```

#### Test 38: Edge
```
Browser: Microsoft Edge
Version: _________
Result: [ ] PASS  [ ] FAIL
Notes:
```

#### Test 39: Brave
```
Browser: Brave
Version: _________
Result: [ ] PASS  [ ] FAIL
Notes:
```

---

## Salesforce Org Testing

#### Test 40: Standard Org
```
Org Type: Standard (non-scratch org)
Result: [ ] PASS  [ ] FAIL
Notes:
```

#### Test 41: Developer Edition
```
Org Type: Developer Edition
Result: [ ] PASS  [ ] FAIL
Notes:
```

#### Test 42: Sandbox
```
Org Type: Sandbox
Result: [ ] PASS  [ ] FAIL
Notes:
```

#### Test 43: Production Org
```
Org Type: Production
Result: [ ] PASS  [ ] FAIL
Notes: ⚠️ Test carefully in production!
```

---

## Console Testing

#### Test 44: Check Console for Errors
```
Action: 
  1. Open browser DevTools (F12)
  2. Go to Console tab
  3. Use SlipStream
Expected: No errors in console
Result: [ ] PASS  [ ] FAIL
Notes: Copy any errors here:
```

#### Test 45: Verify Loading Message
```
Action: 
  1. Reload Salesforce page
  2. Check console
Expected: See "🚀 Salesforce SlipStream loaded" message
Result: [ ] PASS  [ ] FAIL
```

---

## Summary

### Test Results
```
Total Tests: 45
Passed:      _____
Failed:      _____
Skipped:     _____
Success Rate: _____%
```

### Critical Issues Found
```
1. 
2. 
3. 
```

### Non-Critical Issues
```
1. 
2. 
3. 
```

### Suggestions for Improvement
```
1. 
2. 
3. 
```

---

## Testing Completed By

**Name:** ____________________  
**Date:** ____________________  
**Org Type:** ________________  
**Browser:** __________________  
**Version:** 0.2.0

---

## Quick Testing Script

For rapid testing, copy and paste these into SlipStream one by one:

```
open setup
open object manager
open dev console
open setup Account
open setup Account Fields
open setup Account Validation Rules
open setup Account Compact Layouts
open setup Account Record Types
open setup Contact
open setup Opportunity
```

Expected: All should navigate successfully to their respective pages!
