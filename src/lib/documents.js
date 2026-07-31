// The NYC rental application document set.
//
// Shared deliberately: src/pages/Documents.jsx renders the upload slots from
// this list, and api/ai-chat.js reports what is missing from the same list.
// If they were defined separately the agent would eventually tell a renter
// they were "all set" against a checklist the upload page no longer used.
//
// doc_id values are persisted in public.user_documents.doc_id — changing an
// id orphans every previously uploaded file at that slot. Add new slots with
// new ids rather than renumbering.

export const TENANT_DOCS = [
  { id: 't1', label: 'ID or Passport' },
  { id: 't2', label: 'Offer Letter or Letter of Employment' },
  { id: 't3', label: '2 Most Recent Bank Statements' },
  { id: 't4', label: 'Top 2 Pages of 2 Most Recent Tax Returns' },
  { id: 't5', label: '6 Months Proof of Rent Payments or Landlord Letter', optional: true },
]

export const GUARANTOR_DOCS = [
  { id: 'g1', label: 'ID or Passport' },
  { id: 'g2', label: 'Letter of Employment' },
  { id: 'g3', label: '2 Most Recent Paystubs' },
  { id: 'g4', label: '2 Most Recent Bank Statements' },
  { id: 'g5', label: 'Top 2 Pages of 2 Most Recent Tax Returns' },
  { id: 'g6', label: '2 Most Recent W-2s', optional: true },
]

export const DOCS_BY_ROLE = { tenant: TENANT_DOCS, guarantor: GUARANTOR_DOCS }

// The two income rules essentially every NYC landlord applies. Kept here so
// the calculator page, the agent, and any future surface quote one number.
export const INCOME_RULES = {
  tenantAnnualMultiple: 40,    // gross annual income >= 40x monthly rent
  guarantorAnnualMultiple: 80, // guarantors are held to double
}
