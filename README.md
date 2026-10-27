# 📍 Campus Lost & Found Management System

> **Problem Statement (P04):** Lost IDs, laptops, bottles, and documents on a 600-acre campus frequently fail to reach their owners because there is no trusted and visible recovery channel connecting finders, owners, and campus authorities.

---

## 👥 Module Breakdown & Team Responsibilities

| Module | Service Name | Responsibilities | Assigned To |
|---|---|---|---|
| **Module 1** | **Lost Item Service** | • Student authentication & lost item reporting form<br>• Search & filter existing reported items<br>• Real-time alerts/notifications when matches occur | TBD |
| **Module 2** | **Found Item Service** | • Finder / Campus Security item logging<br>• Storage location & handover desk tagging<br>• QR code / reference ID generation for physical tag | TBD |
| **Module 3** | **Claim & Verification Service** | • Automated matching engine (Lost ↔ Found)<br>• Ownership verification (proof, secret question, ID check)<br>• Handover confirmation & status audit log | TBD |

---

## 🔄 End-to-End Workflow & Integration

```mermaid
flowchart LR
    A[Student loses item] -->|Module 1| B[Report Lost Item]
    C[Finder/Security] -->|Module 2| D[Register Found Item]
    B --> E[Matching Engine]
    D --> E
    E -->|Module 3| F[Potential Match Found]
    F --> G[Submit Claim & Verification Proof]
    G --> H[Campus Security Approves]
    H --> I[Physical Handover & Case Closed]
```

---

## 🛠️ Team Git Guidelines (Avoiding Merge Conflicts)

1. **Never commit directly to `main`**:
   - `main` branch is reserved for stable, working releases.
2. **Feature Branch Naming Convention**:
   - Module 1: `feature/module-1-lost-service`
   - Module 2: `feature/module-2-found-service`
   - Module 3: `feature/module-3-claim-service`
3. **Pull Request (PR) Workflow**:
   - Pull latest main before pushing: `git checkout main && git pull origin main`
   - Push your branch: `git push origin <your-branch-name>`
   - Create a Pull Request on GitHub and have at least one teammate review it.
