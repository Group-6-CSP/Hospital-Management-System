# Appointment Management – QA Test Plan

- Date: 2025-10-10
- Owner: QA - Dilara
- Module: Appointment Management (Backend: ASP.NET Core, DB: Azure MySQL, Frontend: React)

## 1. Scope
Features covered:
- Booking appointments
- Rescheduling appointments
- Cancelling appointments
- Listing and searching appointments (by patient, doctor, date range, status)
Out of scope:
- Payments/Billing
- Doctor availability management UI (if not part of module)

## 2. Goals & Success Criteria
- Validate core flows: book, reschedule, cancel, and list/search across roles.
- Prevent double-booking of doctor/time slots (DB unique constraint enforced).
- Ensure RBAC: Patients, Doctors, Admins have correct permissions.
- Stability: No P1/P2 defects open at exit; automated suite ≥ 90% pass rate; API happy paths green.

## 3. Environments
- Azure MySQL: dedicated schema `hospital_management`.
- Backend: ASP.NET Core (.NET 9), Swagger enabled for readiness.
- Frontend: React (CRA), tests via Jest.
- Config: Connection strings via env `HMS_AZURE_MYSQL` or `ConnectionStrings__DefaultConnection`.

## 4. Roles & Personas
- Patient: books/reschedules/cancels own appointments; views their list.
- Doctor: views assigned appointments; may reschedule/cancel as policy permits.
- Admin: full access for triage, overrides, audits.

## 5. Test Strategy
- Manual: High-risk edge cases, UI/UX checks, exploratory around time zones and search filters.
- Automated:
  - Backend integration tests (xUnit) for DB-level rules and status transitions.
  - API tests (Postman/Newman): login → book → reschedule → cancel workflows.
  - Frontend unit tests (Jest): key components render and simple flows.
- Exploratory: Session-based testing for complex date/time transitions, concurrent bookings, and pagination.

## 6. High-Level Schedule
- Week 1: Test design & data strategy; environment prep.
- Week 2: Implement automation; stabilize backend + API tests.
- Week 3: UI tests, exploratory cycles; defect triage.
- Week 4: Regression, exit criteria, and sign-off.

## 7. Entry/Exit Criteria
Entry:
- Environment reachable (Azure MySQL), backend builds and runs, seed data applied.
Exit:
- Test cases executed; critical defects closed; test summary and artifacts published.

## 8. Required Deliverables
- Test Plan (this document)
- Test Cases CSV: `reports/QA/appointments_test_cases.csv`
- Automation results:
  - Backend TRX: `reports/test-runs/unit/integration.trx`
  - API JUnit: `reports/test-runs/api/results.xml`
  - Frontend JUnit: `reports/test-runs/frontend/junit.xml`
- Consolidated Summary: `reports/test-summary.md`
- Bug Reports & Triage notes (if tracked externally, link here)

## 9. Risks & Mitigations
- Time zone/date handling: test UTC vs local; use fixed offsets in tests.
- Data coupling: reset schema per run; idempotent seed scripts.
- Secrets management: use env vars/secrets, avoid hardcoding.

## 10. Tooling & How to Run
- One-command runner from repo root:
  - `./run-local-tests.ps1 -MySqlHost <host> -MySqlPort 3306 -MySqlDatabase hospital_management -MySqlUser <user> -MySqlPassword <pwd>`
- Outputs are written to `reports/test-runs/*` and summarized in `reports/test-summary.md`.

## 11. Acceptance Criteria (AC) Mapping

Booking
- AC-1 Patient can select a doctor, date, and time → APPT-001 (book happy path), E2E Selenium (tests/e2e/e2e_book_appointment.py)
- AC-2 System checks doctor’s availability before confirming → APPT-004 (double-booking DB rule), APPT-027 (UI error when unavailable)
- AC-3 Double-booking prevented (one slot per doctor/time) → APPT-004
- AC-4 Confirmation message displayed after successful booking → APPT-001, E2E Selenium
- AC-5 Appointment saved in DB and visible in patient history → APPT-001 + APPT-021
- AC-6 API response time < 2s under 100 concurrent requests → APPT-026 (booking SLO via JMeter)
- AC-7 Error message if doctor slot unavailable → APPT-027

Patient History
- AC-1 Patient can view past appointments → APPT-021
- AC-2 Each entry includes doctor name, date, time, and status → APPT-021
- AC-3 Only authenticated patients can view their own history → APPT-022, APPT-014
- AC-4 History is paginated if > 20 records → APPT-023
- AC-5 API response time < 2s → APPT-036 (history SLO via JMeter)
- AC-6 Error message if no history found → APPT-024

Rescheduling
- AC-1 Admin can select an appointment and modify date/time → APPT-002
- AC-2 System checks doctor availability before rescheduling → APPT-011
- AC-3 Patients and doctors receive notifications of changes → APPT-025
- AC-4 Rescheduled appointment updated in DB immediately → APPT-029
- AC-5 Conflict prevention (no overlapping slots) → APPT-011
- AC-6 API response time < 2s → APPT-028 (reschedule SLO via JMeter)
- AC-7 Error message if rescheduling fails → APPT-011

Statistics / Reports
- AC-1 Admin can generate daily/monthly statistics → APPT-030
- AC-2 Include number of appointments per doctor/department → APPT-031
- AC-3 Reports exportable (CSV/PDF) → APPT-032
- AC-4 Handles 500+ concurrent report requests → APPT-033 (JMeter)
- AC-5 Report generated within 3s → APPT-034 (JMeter)
- AC-6 Error message if no data available → APPT-035
