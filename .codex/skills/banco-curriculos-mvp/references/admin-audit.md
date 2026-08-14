# Admin, Pix, and Audit Rules

- Manual Pix payment creation requires authenticated admin.
- Subscription activation requires authenticated admin and an existing `Payment`.
- Do not activate a subscription without a payment.
- Mark or associate used payments so repeated activation is visible/preventable where needed.
- Record `AuditLog` for payment creation, subscription activation, admin login, LGPD request creation, and candidate detail access.
- Do not add automatic payment integrations unless the user explicitly changes the MVP scope.
- Keep admin pages operational and plain: enough to test local flows without creating a large backoffice.
