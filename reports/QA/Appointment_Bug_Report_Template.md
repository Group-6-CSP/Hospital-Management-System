# Appointment Management — Bug Report Template

Use this template to report defects related to booking, rescheduling, cancelling, listing/searching, notifications, authentication, and permissions in the Appointment Management module.

- Title: [Short, action-oriented summary]
- Bug ID: [APPT-BUG-####]
- Reported By: [Name]
- Date/Time: [YYYY-MM-DD HH:mm Z]
- Status: [New | Triaged | In Progress | Fixed | Verified | Closed]
- Assignee/Owner: [Name]

## Environment

- Frontend URL: [http://localhost:3000 or 3001 | deployed URL]
- Backend URL: [http://localhost:5239 | deployed URL]
- Backend commit/tag: [SHA or tag]
- Frontend commit/tag: [SHA or tag]
- Database: [Azure MySQL host/db]
- Browser/OS: [e.g., Chrome 141, Windows 11]
- Node/.NET versions: [Node X.Y, .NET 9]
- Feature flags/config: [if any]

## Preconditions / Test Data

- User account(s): [e.g., testuser2@example.com (Patient), Test@123]
- Seed data: [IDs for Patients/Doctors/Appts if relevant]
- Any special setup: [e.g., clear cache/localStorage, enable notifications]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Data Used

- Request payload(s):
  - [Endpoint] [Method] [Body/Params]
- IDs / Dates / Time slots: [e.g., DoctorId D456, 2025-10-12 10:00]

## Expected Result

[Describe the expected behavior, UI state, and API response (status code, schema).]

## Actual Result

[Describe the observed behavior, including UI/API discrepancies and error messages.]

## Severity and Priority

- Severity: [Blocker | Critical | Major | Minor | Trivial]
  - Blocker: System unusable; core flow (e.g., booking) impossible
  - Critical: Major feature broken; no workaround
  - Major: Significant defect; workaround exists
  - Minor: Cosmetic or small functional issue; easy workaround
  - Trivial: Typos/UI polish; no functional impact
- Priority: [P0 | P1 | P2 | P3]
  - P0: Fix immediately; hotfix candidate
  - P1: Next sprint; high business impact
  - P2: Normal; fix when feasible
  - P3: Low; backlog

## Logs / Screenshots / Evidence

- Screenshots or screen recording: [attach or path]
- Frontend console log excerpt:

  ```
  [paste relevant lines]
  ```

- Network trace (HAR) or API responses:

  ```
  [endpoint, status, response body]
  ```

- Backend logs (timestamped):

  ```
  [paste relevant lines]
  ```

- DB evidence (if applicable):

  ```sql
  -- redacted query/results
  ```

## Linked Test Case(s) / Acceptance Criteria

- Test Case IDs: [e.g., APPT-012, APPT-021]
- AC Reference: [AC-# from test plan]
- Postman/Newman run: [reports/test-runs/api/results.xml]
- Integration/UI test links: [reports paths]

## Regression / Reproducibility

- First seen in build: [build/commit]
- Reproducible: [Always | Intermittent % | Rare]
- Similar past issues: [IDs]

## Impact / Scope

- Affected users/roles: [Patients, Admins]
- Affected endpoints/pages: [list]
- Workaround: [if any]

---
Checklist:

- [ ] Minimal, repeatable steps provided
- [ ] Evidence attached (logs/screens/trace)
- [ ] Severity and priority justified
- [ ] Linked to test case(s) and AC
- [ ] Environment details complete
