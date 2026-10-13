# SABI VAULT: DEVELOPER & MACHINE-TO-MACHINE (M2M) API SPECIFICATION
> **Enterprise & Government Integration Protocol for Autonomous AI Agents, Border Systems, and University Portals**  
> *Target:* Enable external automated systems to query, ground, and verify citizen credentials directly via API without relying on manual web portals.

---

## 1. Architectural Philosophy: The Dual-Key Cryptographic Handshake

To ensure **institutional accountability** alongside **citizen data sovereignty**, all automated M2M requests require two distinct cryptographic tokens:
1. **`X-Sabi-Org-Key` (The Enterprise License):** Issued via the Super Admin Dashboard to accredited government ministries, embassies, or enterprises (e.g. `sbo_live_89127391...`). Tracks rate limits, billing, and organizational identity.
2. **`Authorization: Bearer <Candidate_Scoped_Key>` (Citizen Consent Anchor):** The citizen's minted scoped key (e.g. `sbk_live_v1_...`). Enforces category redaction (e.g. only `academics` and `finance`), TTL expiration, and regional sovereign node routing.

```
+-----------------------------------+       +------------------------------------+
| External System / AI Agent        |       | Sabi Vault M2M Gateway             |
| (Workday, Visa Border API, CrewAI)|       |                                    |
+-----------------+-----------------+       +-----------------+------------------+
                  |                                           |
                  | 1. POST /api/v1/m2m/query                 |
                  |    Headers:                               |
                  |      X-Sabi-Org-Key: sbo_live_...         |
                  |      Authorization: Bearer sbk_live_...   |
                  +------------------------------------------>|
                  |                                           | 2. Authenticate Org & Billing
                  |                                           | 3. Validate Candidate Scopes & TTL
                  |                                           | 4. Fetch from Sovereign DB (NDPC/GDPR)
                  |                                           | 5. Re-hash & Verify On-Chain
                  |                                           | 6. Settle 60/40 Micro-Transaction
                  |                                           |
                  | 7. Return Verified Scoped JSON            |
                  |    + Blockchain Proof Badge               |
                  |<------------------------------------------+
                  |
                  | 8. External Agent grounds its OWN internal
                  |    LLM/Prompts over mathematically verified data!
                  v
```

---

## 2. API Endpoints

### 2.1 Direct Scoped Query (`POST /api/v1/m2m/query`)
Allows external systems to retrieve clean, structured, tamper-proof JSON to feed their internal databases or custom AI models.

**Headers:**
```http
Content-Type: application/json
X-Sabi-Org-Key: sbo_live_772189a0b1c2d3e4f5a6b7c8
Authorization: Bearer sbk_live_v1_eyJrZXlJZCI6ImtleV8wMSIs...
```

**Request Body:**
```json
{
  "requestingEntity": "UK Home Office / Border Agency",
  "requiredCategories": ["academics", "finance"]
}
```

**Response (200 OK):**
```json
{
  "status": "VERIFIED_SUCCESS",
  "candidateId": "usr_chinwe_okafor_7721",
  "sovereignNode": {
    "nodeId": "ng-west-africa",
    "jurisdiction": "Nigeria / ECOWAS",
    "complianceFramework": "NDPC"
  },
  "verifiedData": {
    "academics": {
      "degrees": [
        {
          "institution": "University of Lagos",
          "degreeType": "BSc",
          "fieldOfStudy": "Computer Engineering",
          "gpa": 4.84,
          "isNotarized": true,
          "tier": 2,
          "hashRef": "3e2849e798bc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      ]
    },
    "finance": {
      "bankRecords": [
        {
          "institutionName": "Zenith Bank PLC",
          "currency": "NGN",
          "currentLiquidBalance": 8750000,
          "averageThreeMonthBalance": 8200000,
          "hashRef": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
        }
      ]
    }
  },
  "blockchainProof": {
    "network": "Base Sepolia L2",
    "blockNumber": 18924102,
    "tamperStatus": "ALL_HASHES_MATCH_LEDGER"
  },
  "microTransactionReceipt": {
    "feeUsd": 1.00,
    "platformSplit": 0.60,
    "sovereignHostSplit": 0.40
  }
}
```

---

### 2.2 Custom Grounding & Screening Engine (`POST /api/v1/m2m/evaluate`)
For organizations that want Sabi Vault's multi-agent engine to evaluate candidates against their private requirement document or custom scoring rubric.

**Request Body:**
```json
{
  "vertical": "immigration",
  "candidateApiKey": "sbk_live_v1_eyJrZXlJZCI...",
  "customRubric": {
    "title": "UK Skilled Worker Visa Standard Tier",
    "minimumAcademicDegree": "BSc",
    "minimumLiquidFunds": { "currency": "GBP", "amount": 12700 },
    "mandatoryNotarizationRequired": true,
    "scoringWeights": {
      "academics": 40,
      "finance": 60
    }
  }
}
```

**Response (200 OK):**
```json
{
  "status": "EVALUATION_COMPLETE",
  "compositeScore": 96.5,
  "verdict": "HIGHLY_QUALIFIED",
  "rubricBreakdown": [
    {
      "category": "Academics",
      "score": 100,
      "status": "PASSED",
      "proof": "BSc Computer Engineering (Tier 2 Notarized) verified on Base Sepolia"
    },
    {
      "category": "Finance",
      "score": 93,
      "status": "PASSED",
      "proof": "Liquid balance of NGN 8,750,000 satisfies minimum funds conversion"
    }
  ],
  "fraudAudit": {
    "overallRisk": "CLEAN",
    "riskScore": 0,
    "passedChecks": ["Graduation timeline valid", "Balance surge stable"]
  }
}
```

---

### 2.3 Batch Screening Queue (`POST /api/v1/m2m/batch-verify`)
Process batches of candidate keys in a single parallel call:
```json
{
  "vertical": "labour",
  "candidateKeys": [
    "sbk_live_v1_candidate1...",
    "sbk_live_v1_candidate2...",
    "sbk_live_v1_candidate3..."
  ],
  "jobCriteriaText": "Senior Distributed Systems Architect with Go and Kafka experience."
}
```

---

## 3. Python & LangChain / AI Agent Integration Example

```python
import os
import requests

def verify_and_ground_candidate(candidate_key: str):
    url = "https://api.sabivault.io/api/v1/m2m/query"
    headers = {
        "X-Sabi-Org-Key": os.getenv("SABI_ORG_API_KEY"),
        "Authorization": f"Bearer {candidate_key}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json={
        "requestingEntity": "Autonomous Recruiting Agent",
        "requiredCategories": ["academics", "experience"]
    })
    
    payload = response.json()
    assert payload["blockchainProof"]["tamperStatus"] == "ALL_HASHES_MATCH_LEDGER"
    
    # Pass verified structured data directly into internal agent's context window
    verified_data = payload["verifiedData"]
    return verified_data
```

---

## 4. Webhook Event Notifications
Organizations configure webhook listeners in the Super Admin dashboard to receive asynchronous alerts:
* `credential.tier2_legalized`: Sent when a notary seals a pending transcript.
* `key.revoked`: Sent when a candidate terminates an active API key early.
* `security.tamper_detected`: Sent if an on-chain hash mismatch is detected.

