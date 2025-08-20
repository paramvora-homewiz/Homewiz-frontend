# Backend Payment API Requirements

## Current Issue
When users query about tenant payments (e.g., "Which tenants have paid and which are overdue?"), the backend returns financial/revenue data instead of payment status data.

## Required Backend Changes

### 1. **Query Intent Recognition**
The backend needs to improve its natural language processing to correctly identify payment-related queries:

**Payment Query Patterns:**
- "Which tenants have paid?"
- "Who is overdue?"
- "Show me payment status"
- "List tenants with outstanding payments"
- "Who owes rent?"
- "Payment collection status"
- "Which tenants haven't paid this month?"

**Distinguish from Financial Queries:**
- Financial: "revenue report", "financial performance", "income analysis"
- Payment: "tenant payments", "who paid", "overdue tenants", "payment status"

### 2. **Data Structure for Payment Responses**

#### Expected Payment Status Response Format:
```json
{
  "success": true,
  "insight_type": "PAYMENT_STATUS",
  "data": {
    "tenants": [
      {
        "tenant_id": "uuid",
        "tenant_name": "John Smith",
        "unit_number": "101",
        "building_name": "UpMarket Residences",
        "building_id": "uuid",
        "amount_due": 1500.00,
        "amount_paid": 1500.00,
        "balance": 0.00,
        "due_date": "2024-01-01",
        "payment_date": "2023-12-28",
        "payment_method": "Bank Transfer",
        "status": "paid",  // "paid" | "overdue" | "pending" | "partial"
        "days_overdue": 0,  // Only if overdue
        "last_reminder_sent": null  // Optional
      }
    ],
    "summary": {
      "total_tenants": 150,
      "paid_count": 120,
      "overdue_count": 20,
      "pending_count": 10,
      "total_expected": 225000.00,
      "total_collected": 180000.00,
      "total_outstanding": 45000.00,
      "collection_rate": 80.0,
      "avg_days_overdue": 7.5
    },
    "by_building": [  // Optional breakdown
      {
        "building_id": "uuid",
        "building_name": "UpMarket Residences",
        "total_units": 50,
        "paid_count": 40,
        "overdue_count": 7,
        "pending_count": 3,
        "collection_rate": 80.0
      }
    ],
    "by_status": {  // Optional status breakdown
      "paid": {
        "count": 120,
        "total_amount": 180000.00,
        "percentage": 80.0
      },
      "overdue": {
        "count": 20,
        "total_amount": 30000.00,
        "percentage": 13.3,
        "avg_days_overdue": 7.5
      },
      "pending": {
        "count": 10,
        "total_amount": 15000.00,
        "percentage": 6.7
      }
    }
  }
}
```

### 3. **API Endpoint Recommendations**

#### Option 1: Enhance Existing Query Endpoint
```python
# /query endpoint should detect payment queries
def process_query(query: str):
    intent = detect_intent(query)
    
    if intent == "payment_status":
        return get_payment_status_report()
    elif intent == "financial_report":
        return get_financial_report()
    # ... other intents
```

#### Option 2: Dedicated Payment Endpoints
```
GET /api/payments/status
  - Returns current payment status for all tenants
  - Query params: ?building_id=xxx&status=overdue&month=2024-01

GET /api/payments/summary
  - Returns payment collection summary

POST /api/payments/report
  - Body: { "filters": {...}, "date_range": {...} }
```

### 4. **Database Query Examples**

```sql
-- Get payment status for all tenants
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    u.unit_number,
    b.name as building_name,
    l.monthly_rent as amount_due,
    COALESCE(p.amount_paid, 0) as amount_paid,
    l.due_date,
    p.payment_date,
    p.payment_method,
    CASE 
        WHEN p.amount_paid >= l.monthly_rent THEN 'paid'
        WHEN p.amount_paid > 0 THEN 'partial'
        WHEN l.due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN l.due_date < CURRENT_DATE AND (p.amount_paid IS NULL OR p.amount_paid < l.monthly_rent)
        THEN CURRENT_DATE - l.due_date
        ELSE 0
    END as days_overdue
FROM tenants t
JOIN leases l ON t.id = l.tenant_id
JOIN units u ON l.unit_id = u.id
JOIN buildings b ON u.building_id = b.id
LEFT JOIN payments p ON l.id = p.lease_id 
    AND EXTRACT(MONTH FROM p.payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE l.status = 'active';
```

### 5. **Error Handling**

When a payment query is detected but payment data is unavailable:
```json
{
  "success": false,
  "error": "payment_data_unavailable",
  "message": "Payment tracking data is not available for the requested period",
  "suggestion": "Try requesting a financial report instead",
  "fallback_data": {
    // Optionally include financial data as fallback
  }
}
```

### 6. **Testing Requirements**

1. **Query Classification Tests:**
   - "Which tenants have paid?" → Payment Status Report
   - "Show me revenue for last month" → Financial Report
   - "Who owes rent?" → Payment Status Report
   - "Financial performance" → Financial Report

2. **Data Validation Tests:**
   - Ensure all required fields are present
   - Validate status values are correct
   - Check calculations (collection_rate, days_overdue)

3. **Performance Tests:**
   - Response time < 2 seconds for up to 1000 tenants
   - Efficient queries with proper indexing

### 7. **Migration Path**

1. **Phase 1:** Add payment intent detection
2. **Phase 2:** Implement payment data structure
3. **Phase 3:** Update query processor to return payment data
4. **Phase 4:** Add dedicated payment endpoints (optional)

### 8. **Frontend Integration**

The frontend is already prepared to handle this data structure:
- `TenantPaymentStatusDisplay` component for visualization
- `TemplateSelector` for intelligent template selection
- Automatic detection of payment vs financial data

## Benefits

1. **Better User Experience:** Users get the data they actually asked for
2. **Clear Separation:** Payment tracking vs revenue reporting
3. **Actionable Insights:** Property managers can quickly identify who needs follow-up
4. **Accurate Metrics:** Collection rates, overdue tracking, payment trends

## Example Implementation (Python/FastAPI)

```python
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

class PaymentStatus(str, Enum):
    PAID = "paid"
    OVERDUE = "overdue"
    PENDING = "pending"
    PARTIAL = "partial"

class TenantPayment(BaseModel):
    tenant_id: str
    tenant_name: str
    unit_number: str
    building_name: str
    amount_due: float
    amount_paid: float
    balance: float
    due_date: date
    payment_date: Optional[date]
    payment_method: Optional[str]
    status: PaymentStatus
    days_overdue: int = 0

class PaymentSummary(BaseModel):
    total_tenants: int
    paid_count: int
    overdue_count: int
    pending_count: int
    total_expected: float
    total_collected: float
    total_outstanding: float
    collection_rate: float

class PaymentStatusResponse(BaseModel):
    success: bool = True
    insight_type: str = "PAYMENT_STATUS"
    data: dict  # Contains tenants and summary

@router.post("/query")
async def process_query(query: str):
    intent = detect_query_intent(query)
    
    if intent == QueryIntent.PAYMENT_STATUS:
        return await get_payment_status_report()
    elif intent == QueryIntent.FINANCIAL_REPORT:
        return await get_financial_report()
    # ... handle other intents

async def get_payment_status_report():
    tenants = await fetch_tenant_payments()
    summary = calculate_payment_summary(tenants)
    
    return PaymentStatusResponse(
        data={
            "tenants": tenants,
            "summary": summary
        }
    )
```

## Conclusion

By implementing these changes, the backend will correctly handle payment-related queries and return appropriate data structures that the frontend can beautifully visualize. This will significantly improve the user experience and provide property managers with the information they actually need.