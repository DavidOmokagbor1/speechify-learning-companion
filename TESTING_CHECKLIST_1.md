# Frontend Testing Checklist - Speechify MVP

**Date**: February 15, 2026  
**Tester**: Paula/Nefera  
**Environment**: Local Development (http://localhost:5174)  
**Browser**: [Select one: Chrome / Firefox / Safari / Edge]  

---

## 📋 Pre-Testing Setup

Before starting tests, ensure:
- [ ] Dev server running: `npm run dev`
- [ ] No browser console errors
- [ ] Fresh browser session (clear cache if needed)
- [ ] Adequate speaker volume for audio testing
- [ ] Test duration: ~45 minutes

---

## 🎯 SECTION 1: AUDIO PLAYER TESTS (10 tests)

### 1.1: Component Renders ✓
- [ ] Navigate to Learn page after demo login
- [ ] AudioPlayer visible with text area containing sample text
- [ ] All control buttons visible: Play, Skip Back, Skip Forward
- [ ] Speed, Voice, Volume controls visible
- [ ] Progress bar visible with time display

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.2: Play Button Functionality ✓
- [ ] Click Play (▶️) button
- [ ] Audio starts playing (listen for text being read)
- [ ] Button changes to Pause (⏸️) icon
- [ ] Progress bar advances
- [ ] Current word in text area is highlighted

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.3: Pause/Resume ✓
- [ ] With audio playing, click Pause button
- [ ] Audio stops (no more voice)
- [ ] Button changes back to Play (▶️)
- [ ] Progress bar stops advancing
- [ ] Click Play again - audio resumes from same position

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.4: Speed Control (0.5x → 1x → 1.5x → 2x) ✓
- [ ] Start audio playing
- [ ] Select "0.5x (Very Slow)" from dropdown
  - [ ] Audio is noticeably slower
- [ ] Select "1.5x (Fast)"
  - [ ] Audio is faster
- [ ] Select "2x (Very Fast)"
  - [ ] Audio is very fast (nearly double speed)
- [ ] Return to "1x (Normal)"
  - [ ] Audio returns to normal speed

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.5: Voice Selection ✓
- [ ] Start audio with default voice (English Female)
- [ ] Select different voice (e.g., "Google UK English Male")
  - [ ] Audio continues with different voice
  - [ ] Voice change is noticeable
- [ ] Try other voice options if available
  - [ ] Each voice sounds different

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.6: Volume Control ✓
- [ ] Start audio playing
- [ ] Move volume slider to 0% (mute)
  - [ ] Audio becomes silent/very quiet
- [ ] Move to 50%
  - [ ] Volume is moderate
- [ ] Move to 100%
  - [ ] Volume is loud/maximum

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.7: Skip Forward (15 seconds) ✓
- [ ] Start audio, let it play for 20+ seconds
- [ ] Note position on progress bar
- [ ] Click forward skip button (⏩)
- [ ] Progress bar jumps forward ~15 seconds
- [ ] Audio continues from new position

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.8: Skip Backward (15 seconds) ✓
- [ ] Let audio play for 30+ seconds
- [ ] Click backward skip button (⏪)
- [ ] Progress bar jumps backward ~15 seconds
- [ ] Audio continues from new position

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 1.9: Real-time Text Highlighting ✓
- [ ] Start audio playback
- [ ] Watch the text area carefully
- [ ] Current word being spoken is highlighted
- [ ] Highlighting moves word-by-word as audio progresses
- [ ] Highlighting is accurate to spoken audio

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here - Note any sync issues]
```

---

### 1.10: Quiz Trigger (Every 5 minutes) ✓
- [ ] Start audio playback
- [ ] Wait 5 minutes OR check browser console for trigger (type in console: `console.log('Quiz should trigger'`)
- [ ] Quiz modal automatically appears
- [ ] Modal displays question and 4 answer options
- [ ] Audio pauses when quiz appears

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

## 🎯 SECTION 2: QUIZ MODAL TESTS (12 tests)

### 2.1: Modal Renders ✓
- [ ] Quiz modal appears centered on screen
- [ ] Semi-transparent dark overlay behind modal
- [ ] Question clearly visible
- [ ] All 4 answer options visible

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.2: Four Options Display ✓
- [ ] Option A visible with text
- [ ] Option B visible with text
- [ ] Option C visible with text
- [ ] Option D visible with text
- [ ] All options clearly labeled with letter

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.3: Select Correct Answer ✓
- [ ] Click correct option (C. Paris)
- [ ] Option background turns green
- [ ] Green ✓ checkmark appears
- [ ] Explanation text displays below
- [ ] Explanation explains why this is correct

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.4: Select Wrong Answer ✓
- [ ] Trigger new quiz
- [ ] Click wrong option (A. London)
- [ ] Option background turns red/pink
- [ ] Red ✗ icon appears
- [ ] Explanation displays
- [ ] Correct option also highlighted in green

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.5: Cannot Change Answer ✓
- [ ] Select an answer
- [ ] Try clicking different options
- [ ] Should not be able to change selection
- [ ] Options should appear disabled/non-clickable

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.6: Continue Button ✓
- [ ] After answering, "Continue Listening" button visible
- [ ] Button is blue and clearly clickable
- [ ] Clicking button closes modal
- [ ] Audio resumes playback

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.7: Auto-Dismiss Countdown ✓
- [ ] After answering, countdown visible: "Continuing in 10s"
- [ ] Countdown decrements: 10 → 9 → 8 → ... → 1
- [ ] Modal automatically closes when reaches 0
- [ ] Audio resumes automatically

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.8: Skip Question Button ✓
- [ ] Open quiz without answering
- [ ] "Skip Question" button visible
- [ ] Click it
- [ ] Modal closes
- [ ] No answer recorded
- [ ] Audio continues

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.9: Explanation Accuracy ✓
- [ ] Answer several quizzes
- [ ] Read explanations
- [ ] Explanations are accurate and helpful
- [ ] Explanations relate to the question and answer

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.10: Visual Feedback Clarity ✓
- [ ] Green checkmark is clearly visible for correct answers
- [ ] Red X is clearly visible for wrong answers
- [ ] Correct answer is obviously indicated when wrong answer is selected
- [ ] Colors are accessible (not relying solely on color)

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.11: Modal Responsive ✓
- [ ] Test at mobile size (375px width)
- [ ] Modal fits within viewport
- [ ] Text is readable
- [ ] Buttons are easily clickable
- [ ] No horizontal scroll needed

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 2.12: Modal Closes Cleanly ✓
- [ ] After dismissing modal (via continue or auto-dismiss)
- [ ] Modal completely removed from view
- [ ] No modal remnants or overlays
- [ ] Page behind modal fully accessible again

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

## 🎯 SECTION 3: DASHBOARD TESTS (12 tests)

### 3.1: Dashboard Loads ✓
- [ ] Click "Dashboard" link in header
- [ ] Page navigates to dashboard
- [ ] "Learning Dashboard" heading visible
- [ ] "Track your progress and stay motivated" subtitle visible

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.2: Four Stats Cards ✓
- [ ] Total Quizzes card visible (📚 icon, shows "24")
- [ ] Average Score card visible (🏆 icon, shows "87.5%")
- [ ] Daily Streak card visible (🔥 icon, shows "12")
- [ ] Subscription Tier card visible (👑 icon, shows "Premium")
- [ ] All cards display values correctly

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.3: Stats Cards Layout ✓
- [ ] At desktop: 4 columns (one card per column)
- [ ] Cards evenly spaced
- [ ] Cards have good visual hierarchy with borders
- [ ] Icons are visible and appropriate

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.4: Trend Chart Renders ✓
- [ ] "7-Session Accuracy Trend" section visible
- [ ] Line chart displays
- [ ] 7 data points visible (sessions 1-7)
- [ ] Chart shows trend from 72% → 92%
- [ ] Axis labels visible (Session, Accuracy %)

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.5: Chart Statistics ✓
- [ ] Current accuracy shown: "92%"
- [ ] Trend indicator shows: "+20%" in green
- [ ] Up arrow (⬆️) visible showing improvement
- [ ] Explanation text below chart is clear

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.6: Chart Interactivity ✓
- [ ] Hover over chart line - tooltip appears
- [ ] Tooltip shows session number and accuracy
- [ ] Tooltip disappears when mouse leaves chart
- [ ] Points on chart are visible/interactive

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.7: Performance Insights ✓
- [ ] "Performance Insights" section visible
- [ ] 3 insight cards displayed:
  - [ ] "🎯 Focus on Definitions"
  - [ ] "⏱️ Slow Down"
  - [ ] "📈 Keep the Streak"
- [ ] Each card has title and description
- [ ] Insights are actionable and relevant

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.8: Insight Cards Readable ✓
- [ ] Insight card backgrounds are distinct
- [ ] Text is readable
- [ ] Emojis are visible
- [ ] Descriptions are clear and helpful

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.9: Premium Upgrade Section ✓
- [ ] Purple gradient background section visible
- [ ] "🚀 Upgrade to Premium" heading
- [ ] Upgrade benefits listed
- [ ] "Upgrade Now" button visible and styled

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.10: Bottom CTA Section ✓
- [ ] Scroll to bottom of page
- [ ] Blue gradient section visible
- [ ] "Premium features await" heading
- [ ] Description text
- [ ] "Explore Plans" button visible

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 3.11: Dashboard Responsive ✓
- [ ] At mobile (375px): Cards stack vertically
- [ ] Chart remains readable on mobile
- [ ] No horizontal scroll
- [ ] Text is readable
- [ ] All buttons accessible

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here - Note any layout issues]
```

---

### 3.12: Dashboard Data Accuracy ✓
- [ ] Stats values are reasonable
- [ ] Trend line shows logical progression
- [ ] Insights are relevant to the data
- [ ] No broken or missing data

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

## 🎯 SECTION 4: NAVIGATION & ROUTING TESTS (10 tests)

### 4.1: Login Page on Initial Load ✓
- [ ] Refresh page (Cmd+R)
- [ ] Login page displays
- [ ] "Login to Speechify" heading visible
- [ ] "Continue as Demo User" button visible

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.2: Demo Login Works ✓
- [ ] Click "Continue as Demo User"
- [ ] Navigates to Learn page
- [ ] URL changes to /learn
- [ ] Learn page content loads

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.3: Header Navigation ✓
- [ ] After login, header visible with logo
- [ ] "Learn" link in header
- [ ] "Dashboard" link in header
- [ ] "Logout" button in header

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.4: Learn Link ✓
- [ ] From Dashboard, click "Learn" link
- [ ] Navigates to Learn page
- [ ] AudioPlayer visible
- [ ] URL shows /learn

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.5: Dashboard Link ✓
- [ ] From Learn, click "Dashboard" link
- [ ] Navigates to Dashboard
- [ ] Stats cards visible
- [ ] URL shows /dashboard

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.6: Protected Routes ✓
- [ ] Click Logout button
- [ ] Logs out and returns to login
- [ ] Manually navigate to /learn in address bar
- [ ] Should redirect back to /login
- [ ] Try /dashboard - should redirect to /login

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.7: Logout Button ✓
- [ ] From any page, click "Logout"
- [ ] Logs out successfully
- [ ] Redirects to login page
- [ ] All tokens cleared
- [ ] Cannot access protected routes

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.8: Logo Navigation ✓
- [ ] Click Speechify logo
- [ ] If logged in: goes to Learn page
- [ ] If logged out: goes to Login page
- [ ] Consistent behavior across pages

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.9: Invalid Routes ✓
- [ ] Navigate to /invalid-page
- [ ] Should handle gracefully (redirect or show 404)
- [ ] App should not crash
- [ ] Can navigate back

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 4.10: Auth State Persistence ✓
- [ ] Log in as demo user
- [ ] Navigate to Learn page
- [ ] Refresh page (Cmd+R)
- [ ] Should stay on Learn page (not redirect to login)
- [ ] Auth state maintained

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

## 🎯 SECTION 5: RESPONSIVE DESIGN TESTS (5 tests)

### 5.1: Desktop Layout ✓
- [ ] Set browser to full desktop width (1920+)
- [ ] All components visible
- [ ] Layout uses full width appropriately
- [ ] No awkward spacing
- [ ] All text readable at normal zoom

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 5.2: Tablet Layout ✓
- [ ] Resize to tablet size (768x1024)
- [ ] AudioPlayer still fully functional
- [ ] Dashboard cards readable
- [ ] No horizontal scroll needed
- [ ] Touch targets are adequate (48px+)

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 5.3: Mobile Layout ✓
- [ ] Resize to mobile (375x667)
- [ ] Learn page layouts correctly
- [ ] Quiz modal fits viewport
- [ ] Dashboard stacks vertically
- [ ] Text is readable
- [ ] No horizontal scroll

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 5.4: Landscape Orientation ✓
- [ ] Rotate to landscape (667x375)
- [ ] AudioPlayer adapts
- [ ] Quiz modal still usable
- [ ] Dashboard layout shifts appropriately

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

### 5.5: Touch Targets ✓
- [ ] All buttons are at least 48x48px
- [ ] Buttons are easily tappable on mobile
- [ ] Spacing between buttons adequate
- [ ] Dropdowns work well on touch

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Write any observations here]
```

---

## 🎯 SECTION 6: BROWSER COMPATIBILITY (4 tests)

### 6.1: Chrome/Chromium ✓
- [ ] Open in Chrome
- [ ] Complete full workflow
- [ ] Test audio playback
- [ ] Open DevTools (F12) - check for console errors
- [ ] Should see: 0 errors

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Browser Version**: Chrome ______

**Errors**:
```
[List any errors found]
```

---

### 6.2: Firefox ✓
- [ ] Open in Firefox
- [ ] Complete full workflow
- [ ] Test audio playback
- [ ] Open DevTools (F12) - check for console errors
- [ ] Should see: 0 errors

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Browser Version**: Firefox ______

**Errors**:
```
[List any errors found]
```

---

### 6.3: Safari ✓
- [ ] Open in Safari
- [ ] Complete full workflow
- [ ] Test audio playback
- [ ] Open DevTools (Cmd+Option+I) - check console
- [ ] Should see: 0 errors

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Browser Version**: Safari ______

**Errors**:
```
[List any errors found]
```

---

### 6.4: Web Speech API Consistency ✓
- [ ] Test audio in each browser
- [ ] Voices available in all browsers
- [ ] Speed control works in all browsers
- [ ] Text highlighting works consistently

**Status**: ⬜ NOT TESTED | ✅ PASS | ❌ FAIL

**Notes**:
```
[Note any differences between browsers]
```

---

## 📊 FINAL TEST SUMMARY

### Test Results Overview
- **Total Tests**: 55
- **Passed**: ___
- **Failed**: ___
- **Not Tested**: ___
- **Pass Rate**: ___%

### Overall Status
- [ ] ✅ ALL TESTS PASSED - Ready for GitHub push
- [ ] ⚠️ SOME TESTS FAILED - Need fixes before push
- [ ] ❌ CRITICAL FAILURES - Major issues found

### Critical Issues (if any):
```
[List any critical issues that must be fixed]
```

### Minor Issues (if any):
```
[List any non-critical issues or improvements]
```

### Browser Issues:
- Chrome: _______________
- Firefox: _______________
- Safari: _______________

### Responsive Issues:
- Mobile: _______________
- Tablet: _______________
- Desktop: _______________

---

## 👤 Test Signature

**Tester Name**: Paula/Nefera  
**Date**: February 15, 2026  
**Time Spent**: ___ minutes  
**Browser**: _______________  
**OS**: macOS  

**Sign-off**: 
- [ ] I have thoroughly tested all components
- [ ] All critical functionality works
- [ ] No blocking issues found
- [ ] Ready for GitHub push & integration with backend

---

## 📝 Notes for Backend Integration

Based on testing, the frontend is ready for backend integration with:
- ✅ All components functional locally
- ✅ Mock data displays correctly
- ✅ API client configured
- ✅ Auth system ready for real tokens

**Next Steps**:
1. Push to GitHub (feature/frontend-v1)
2. Create PR to develop branch
3. Wait for backend API from David
4. Connect to real API endpoints
5. Run integration tests

---

**END OF TEST CHECKLIST**
