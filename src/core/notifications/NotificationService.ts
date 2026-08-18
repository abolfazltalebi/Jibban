import { Category, NotificationPayload, ParsedSms } from '../../types';
import { formatCurrency } from '../../utils/currency';

/**
 * Notifee & Local Notification Service
 * Manages high-importance channels, action buttons, direct reply, and in-app simulation
 */

export class NotificationService {
  private static listeners: Array<(payload: NotificationPayload) => void> = [];
  private static dismissListeners: Array<(id: string) => void> = [];

  /**
   * Register listener for new notifications (for web simulation & native bridge)
   */
  public static onNotification(callback: (payload: NotificationPayload) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public static onDismiss(callback: (id: string) => void) {
    this.dismissListeners.push(callback);
    return () => {
      this.dismissListeners = this.dismissListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Creates or triggers an interactive notification for a parsed SMS
   */
  public static async sendTransactionNotification(
    parsedSms: ParsedSms,
    topCategories: Category[],
    isHighConfidence: boolean = false
  ): Promise<NotificationPayload> {
    const formattedAmount = formatCurrency(parsedSms.amount, 'toman');
    const bank = parsedSms.bankName || 'بانک';
    const isDeposit = parsedSms.type === 'income';

    let title = '💸 تراکنش جدید';
    let body = `${formattedAmount} از ${bank} • بابت چی بود؟`;

    if (isDeposit) {
      title = '💰 واریز به حساب';
      body = `مبلغ ${formattedAmount} به حساب ${bank} واریز شد.`;
    } else if (isHighConfidence && topCategories.length > 0) {
      title = '✅ ثبت خودکار تراکنش';
      body = `${formattedAmount} در دسته «${topCategories[0].name}» ثبت شد.`;
    }

    const payload: NotificationPayload = {
      id: 'notif_' + Date.now(),
      title,
      body,
      parsedSms,
      topCategories: topCategories.slice(0, 4), // 4 quick dynamic category actions
      isDirectConfirm: isHighConfidence,
      timestamp: Date.now(),
    };

    // Broadcast to UI listeners
    this.listeners.forEach((listener) => listener(payload));

    return payload;
  }

  public static dismiss(id: string) {
    this.dismissListeners.forEach((listener) => listener(id));
  }
}
