// LLM-based template selector for choosing the right visualization

export interface TemplateSelectionResult {
  template: 'payment' | 'financial' | 'leads' | 'occupancy' | 'generic';
  confidence: number;
  reason: string;
  suggestedTitle?: string;
}

export class TemplateSelector {
  static analyzeQueryIntent(query: string): string[] {
    const queryLower = query.toLowerCase();
    const intents: string[] = [];

    // Payment-related intents
    if (
      queryLower.includes('paid') ||
      queryLower.includes('overdue') ||
      queryLower.includes('payment') ||
      queryLower.includes('outstanding') ||
      queryLower.includes('collected') ||
      queryLower.includes('owe') ||
      queryLower.includes('due')
    ) {
      intents.push('payment');
    }

    // Financial/Revenue intents
    if (
      queryLower.includes('revenue') ||
      queryLower.includes('financial') ||
      queryLower.includes('income') ||
      queryLower.includes('profit') ||
      queryLower.includes('realization')
    ) {
      intents.push('financial');
    }

    // Lead conversion intents
    if (
      queryLower.includes('lead') ||
      queryLower.includes('conversion') ||
      queryLower.includes('prospect') ||
      queryLower.includes('applicant')
    ) {
      intents.push('leads');
    }

    // Occupancy intents
    if (
      queryLower.includes('occupancy') ||
      queryLower.includes('vacant') ||
      queryLower.includes('available') ||
      queryLower.includes('occupied')
    ) {
      intents.push('occupancy');
    }

    return intents;
  }

  static analyzeDataStructure(data: any): {
    hasPaymentFields: boolean;
    hasFinancialFields: boolean;
    hasLeadFields: boolean;
    hasOccupancyFields: boolean;
    dataSignals: string[];
  } {
    const signals: string[] = [];
    let hasPaymentFields = false;
    let hasFinancialFields = false;
    let hasLeadFields = false;
    let hasOccupancyFields = false;

    // Check for payment-specific fields
    if (data) {
      // Direct payment fields
      if (
        data.paid_count !== undefined ||
        data.overdue_count !== undefined ||
        data.payment_status ||
        data.days_overdue !== undefined ||
        data.amount_due !== undefined ||
        data.collection_rate !== undefined
      ) {
        hasPaymentFields = true;
        signals.push('has_payment_summary_fields');
      }

      // Check arrays for payment data
      const arrays = [data.tenants, data.payments, data];
      for (const arr of arrays) {
        if (Array.isArray(arr) && arr.length > 0) {
          const firstItem = arr[0];
          if (firstItem && (
            firstItem.payment_status ||
            firstItem.amount_due !== undefined ||
            firstItem.days_overdue !== undefined ||
            firstItem.payment_date ||
            (firstItem.status && ['paid', 'overdue', 'pending'].includes(firstItem.status))
          )) {
            hasPaymentFields = true;
            signals.push('has_payment_records');
            break;
          }
        }
      }

      // Financial fields
      if (
        data.total_potential_revenue !== undefined ||
        data.actual_revenue !== undefined ||
        data.revenue_realization_rate !== undefined ||
        data.by_building
      ) {
        hasFinancialFields = true;
        signals.push('has_revenue_fields');
      }

      // Lead fields
      if (
        data.total_leads !== undefined ||
        data.conversion_rate !== undefined ||
        data.converted !== undefined
      ) {
        hasLeadFields = true;
        signals.push('has_lead_fields');
      }

      // Occupancy fields
      if (
        data.occupancy_rate !== undefined ||
        data.vacant_units !== undefined ||
        data.occupied_units !== undefined
      ) {
        hasOccupancyFields = true;
        signals.push('has_occupancy_fields');
      }
    }

    return {
      hasPaymentFields,
      hasFinancialFields,
      hasLeadFields,
      hasOccupancyFields,
      dataSignals: signals
    };
  }

  static selectTemplate(query: string, data: any): TemplateSelectionResult {
    console.log('🤖 Template Selection Analysis:', {
      query,
      dataKeys: data ? Object.keys(data) : [],
      dataPreview: JSON.stringify(data).substring(0, 200)
    });

    const queryIntents = this.analyzeQueryIntent(query);
    const dataAnalysis = this.analyzeDataStructure(data);

    console.log('🎯 Analysis Results:', {
      queryIntents,
      dataAnalysis
    });

    // Priority 1: Query asks for payments but data shows revenue
    if (queryIntents.includes('payment') && !dataAnalysis.hasPaymentFields && dataAnalysis.hasFinancialFields) {
      // This is a mismatch - user asked for payments but got revenue data
      // Still mark as payment template to show the mismatch warning
      return {
        template: 'payment',
        confidence: 0.4,
        reason: 'Query requested payment data but received revenue data - mismatch detected.',
        suggestedTitle: 'Payment Status (Data Mismatch)'
      };
    }

    // Priority 1.5: Query asks for leads but data shows revenue
    if (queryIntents.includes('leads') && !dataAnalysis.hasLeadFields && dataAnalysis.hasFinancialFields) {
      // This is a mismatch - user asked for leads but got revenue data
      return {
        template: 'leads',
        confidence: 0.4,
        reason: 'Query requested lead conversion data but received revenue data - mismatch detected.',
        suggestedTitle: 'Lead Conversion (Data Mismatch)'
      };
    }

    // Priority 2: Strong payment signals in data
    if (dataAnalysis.hasPaymentFields) {
      return {
        template: 'payment',
        confidence: 0.9,
        reason: 'Data contains payment-specific fields',
        suggestedTitle: 'Tenant Payment Status'
      };
    }

    // Priority 3: Query intent matches data type
    if (queryIntents.includes('payment') && !dataAnalysis.hasFinancialFields) {
      // Query wants payments, no financial data, might be empty or wrong format
      return {
        template: 'payment',
        confidence: 0.7,
        reason: 'Query specifically asks for payment information',
        suggestedTitle: 'Payment Status Report'
      };
    }

    if (queryIntents.includes('financial') && dataAnalysis.hasFinancialFields) {
      return {
        template: 'financial',
        confidence: 0.9,
        reason: 'Query and data both indicate financial/revenue reporting',
        suggestedTitle: 'Financial Report'
      };
    }

    if (queryIntents.includes('leads') && dataAnalysis.hasLeadFields) {
      return {
        template: 'leads',
        confidence: 0.9,
        reason: 'Lead conversion data detected',
        suggestedTitle: 'Lead Conversion Report'
      };
    }

    if (queryIntents.includes('occupancy') && dataAnalysis.hasOccupancyFields) {
      return {
        template: 'occupancy',
        confidence: 0.9,
        reason: 'Occupancy data detected',
        suggestedTitle: 'Occupancy Report'
      };
    }

    // Default based on data structure
    if (dataAnalysis.hasFinancialFields) {
      return {
        template: 'financial',
        confidence: 0.6,
        reason: 'Financial data structure detected',
        suggestedTitle: 'Revenue Analysis'
      };
    }

    if (dataAnalysis.hasLeadFields) {
      return {
        template: 'leads',
        confidence: 0.6,
        reason: 'Lead data structure detected',
        suggestedTitle: 'Lead Analysis'
      };
    }

    // Fallback
    return {
      template: 'generic',
      confidence: 0.3,
      reason: 'Unable to determine specific template type',
      suggestedTitle: 'Data Report'
    };
  }

  // Generate a prompt for actual LLM analysis if needed
  static generateLLMPrompt(query: string, data: any): string {
    return `
Analyze this user query and data response to determine the best visualization template.

User Query: "${query}"

Data Structure:
${JSON.stringify(data, null, 2).substring(0, 1000)}

Available Templates:
1. payment - For tenant payment status, overdue amounts, collection tracking
2. financial - For revenue reports, building financial performance
3. leads - For lead conversion, prospect tracking
4. occupancy - For room/unit availability and occupancy rates
5. generic - For other data types

Based on the user's intent and the actual data structure, which template should be used?
Consider that sometimes the backend returns the wrong type of data.

Respond with:
{
  "template": "template_name",
  "confidence": 0.0-1.0,
  "reason": "explanation"
}
`;
  }
}