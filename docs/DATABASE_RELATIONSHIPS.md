# Database Relationships

High-level overview of the data model and its entity relationships.

---

## Entities and Relationships

### Tenant
Central multi-tenancy unit. Everything in the system belongs to or is scoped by a Tenant.

- Has many **Users** (1:N)
- Has many **Logs** (1:N)
- Has exactly one **Subscription** (1:1)

---

### User
Represents an authenticated person within a Tenant.

- Belongs to one **Tenant** (N:1, optional)
- Belongs to one **RoleProfile** (N:1, optional)
- Has many **Logs** (1:N)
- Has many **RefreshTokens** (1:N) — active sessions
- Has many **UserTokens** (1:N) — one-time tokens for flows like first access and password reset

---

### RoleProfile
Defines a permission template that can be assigned to Users.

- Has many **Users** (1:N)

---

### Plan
Describes a product offering (price, billing cycle, feature set, limits).

- Has many **Subscriptions** (1:N)

---

### Subscription
Links a Tenant to a Plan and tracks the billing lifecycle.

- Belongs to one **Tenant** (1:1, each tenant can have only one active subscription)
- Belongs to one **Plan** (N:1)
- Has many **Invoices** (1:N)

---

### Invoice
A financial record for a billing period within a Subscription.

- Belongs to one **Subscription** (N:1)

---

### Log
Audit trail of actions performed in the system.

- Optionally belongs to one **User** (N:1)
- Optionally belongs to one **Tenant** (N:1)

---

### RefreshToken
Long-lived token used to renew access sessions, tied to a device fingerprint.

- Belongs to one **User** (N:1, cascade delete)

---

### UserToken
Short-lived one-time token for specific flows (FIRST_ACCESS, FORGOT_PASSWORD). May include a 4-digit verification code.

- Belongs to one **User** (N:1, cascade delete)

---

## Relationship Summary Table

| From         | To           | Cardinality | Notes                                  |
|--------------|--------------|-------------|----------------------------------------|
| Tenant       | User         | 1 : N       |                                        |
| Tenant       | Subscription | 1 : 1       | One active subscription per tenant     |
| Tenant       | Log          | 1 : N       | Optional reference                     |
| User         | Tenant       | N : 1       | Optional (user may have no tenant)     |
| User         | RoleProfile  | N : 1       | Optional                               |
| User         | RefreshToken | 1 : N       | Cascade delete                         |
| User         | UserToken    | 1 : N       | Cascade delete                         |
| User         | Log          | 1 : N       | Optional reference                     |
| RoleProfile  | User         | 1 : N       |                                        |
| Plan         | Subscription | 1 : N       |                                        |
| Subscription | Tenant       | 1 : 1       |                                        |
| Subscription | Plan         | N : 1       |                                        |
| Subscription | Invoice      | 1 : N       |                                        |
| Invoice      | Subscription | N : 1       |                                        |

---

## Conceptual Groupings

**Identity & Access**
`User` — `RoleProfile` — `RefreshToken` — `UserToken`

**Multi-tenancy**
`Tenant` — `User`

**Billing**
`Plan` — `Subscription` — `Invoice` — `Tenant`

**Audit**
`Log` — `User` — `Tenant`
