/**
 * MedReach AI — Analytics & User Behavior Tracking Utility
 * Supports Google Analytics (gtag), Plausible, or local telemetry logging.
 */

export interface AnalyticsEvent {
  action: string;
  category: 'SEARCH' | 'RESERVATION' | 'PRESCRIPTION' | 'EMERGENCY' | 'AUTH' | 'NAVIGATION';
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private isProduction = process.env.NODE_ENV === 'production';
  private trackingId = process.env.NEXT_PUBLIC_GA_ID || 'G-MEDREACH-DEMO';

  /**
   * Track Page View across App Router navigations
   */
  public trackPageView(url: string, title?: string) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('config', this.trackingId, {
        page_path: url,
        page_title: title || document.title,
      });
    }

    // Local telemetry stream for evaluation
    this.logTelemetry('PAGE_VIEW', { url, title, timestamp: new Date().toISOString() });
  }

  /**
   * Track user interactions (e.g. searching a drug, clicking hold stock, dialing emergency)
   */
  public trackEvent({ action, category, label, value, metadata }: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...metadata,
      });
    }

    this.logTelemetry(`EVENT [${category}] ${action}`, { label, value, metadata });
  }

  private logTelemetry(type: string, data: any) {
    if (!this.isProduction) {
      // Formatted developer telemetry logging
      // console.debug(`📊 [Analytics] ${type}`, data);
    }
  }
}

export const analytics = new AnalyticsTracker();

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
