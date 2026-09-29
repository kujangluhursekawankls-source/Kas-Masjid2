# Security Specification: Kas Masjid Multi-Tenant

## 1. Data Invariants
1. A user can only read and write their own `/users/{userId}` record.
2. A masjid document `/masjids/{masjidId}` can be created by authenticated users, and read by authenticated members of that masjid.
3. Subcollection records (pemasukan, pengeluaran, pengurus, kategori) can only be accessed by authenticated users who belong to the corresponding `masjidId`.
4. All incoming payload keys are strictly validated and cannot contain ghost fields.
5. All IDs match alphanumeric format.

## 2. The "Dirty Dozen" Threat Payloads
1. Attempting to create a user record with another user's UID (`userId != request.auth.uid`).
2. Attempting to write a masjid with arbitrary unvalidated fields (Ghost Fields).
3. Attempting to read another masjid's pemasukan records.
4. Attempting to delete a transaction without belonging to the parent masjid.
5. Attempting to inject oversized (>500KB) base64 strings into non-attachment fields.
6. Attempting unauthenticated reads on masjid financial documents.
7. Attempting unauthenticated writes on user profiles.
8. Attempting to update `createdAt` timestamp to spoof audit trails.
9. Attempting to change `ownerId` of a masjid.
10. Attempting to create a transaction without required fields (`nominal`, `uraian`, `nomorTransaksi`).
11. Attempting negative or non-number nominal values.
12. Attempting SQL/NoSQL injection string patterns in document IDs.
