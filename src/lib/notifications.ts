// Notification system for payment status updates and other alerts

export interface NotificationData {
  user_id: string;
  type: 'payment_verified' | 'payment_failed' | 'form_submitted' | 'form_completed' | 'system_alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: ('email' | 'sms' | 'in_app')[];
}

export class NotificationService {
  
  // Send payment verification success notification
  static async sendPaymentVerifiedNotification(paymentData: {
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone?: string;
    amount: number;
    currency: string;
    reference_number: string;
    form_id: string;
  }) {
    const notification: NotificationData = {
      user_id: paymentData.user_id,
      type: 'payment_verified',
      title: 'Payment Verified Successfully! 🎉',
      message: `Your payment of ${paymentData.currency === 'USD' ? '$' : 'ETB '}${paymentData.amount} ${paymentData.currency} has been verified. Your DV application has been submitted with reference ${paymentData.reference_number}.`,
      data: {
        payment_amount: paymentData.amount,
        payment_currency: paymentData.currency,
        reference_number: paymentData.reference_number,
        form_id: paymentData.form_id
      },
      channels: ['email', 'sms', 'in_app']
    };

    await this.sendNotification(notification, {
      email: paymentData.user_email,
      phone: paymentData.user_phone,
      name: paymentData.user_name
    });
  }

  // Send payment verification failure notification
  static async sendPaymentFailedNotification(paymentData: {
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone?: string;
    amount: number;
    currency: string;
    reference_number?: string;
    reason?: string;
  }) {
    const notification: NotificationData = {
      user_id: paymentData.user_id,
      type: 'payment_failed',
      title: 'Payment Verification Failed',
      message: `We could not verify your payment of ${paymentData.currency === 'USD' ? '$' : 'ETB '}${paymentData.amount} ${paymentData.currency}. ${paymentData.reason || 'Please check your payment details and try again.'}`,
      data: {
        payment_amount: paymentData.amount,
        payment_currency: paymentData.currency,
        reference_number: paymentData.reference_number,
        failure_reason: paymentData.reason
      },
      channels: ['email', 'sms', 'in_app']
    };

    await this.sendNotification(notification, {
      email: paymentData.user_email,
      phone: paymentData.user_phone,
      name: paymentData.user_name
    });
  }

  // Send form submission confirmation
  static async sendFormSubmittedNotification(formData: {
    user_id: string;
    user_name: string;
    user_email: string;
    form_id: string;
    reference_number: string;
    applicant_name: string;
  }) {
    const notification: NotificationData = {
      user_id: formData.user_id,
      type: 'form_submitted',
      title: 'DV Application Submitted Successfully! 🇺🇸',
      message: `Your DV lottery application for ${formData.applicant_name} has been successfully submitted with reference number ${formData.reference_number}. You will receive updates on the processing status.`,
      data: {
        form_id: formData.form_id,
        reference_number: formData.reference_number,
        applicant_name: formData.applicant_name
      },
      channels: ['email', 'in_app']
    };

    await this.sendNotification(notification, {
      email: formData.user_email,
      name: formData.user_name
    });
  }

  // Send form completion notification (when DV confirmation number is available)
  static async sendFormCompletedNotification(formData: {
    user_id: string;
    user_name: string;
    user_email: string;
    form_id: string;
    reference_number: string;
    dv_confirmation_number: string;
    applicant_name: string;
  }) {
    const notification: NotificationData = {
      user_id: formData.user_id,
      type: 'form_completed',
      title: 'DV Application Processing Complete! 🎯',
      message: `Great news! Your DV application for ${formData.applicant_name} has been processed. Your DV confirmation number is: ${formData.dv_confirmation_number}. Keep this number safe!`,
      data: {
        form_id: formData.form_id,
        reference_number: formData.reference_number,
        dv_confirmation_number: formData.dv_confirmation_number,
        applicant_name: formData.applicant_name
      },
      channels: ['email', 'sms', 'in_app']
    };

    await this.sendNotification(notification, {
      email: formData.user_email,
      name: formData.user_name
    });
  }

  // Core notification sending function
  private static async sendNotification(
    notification: NotificationData, 
    contactInfo: { email?: string; phone?: string; name?: string }
  ) {
    try {
      // Send email notification
      if (notification.channels.includes('email') && contactInfo.email) {
        await this.sendEmailNotification(notification, contactInfo.email, contactInfo.name);
      }

      // Send SMS notification
      if (notification.channels.includes('sms') && contactInfo.phone) {
        await this.sendSMSNotification(notification, contactInfo.phone);
      }

      // Store in-app notification
      if (notification.channels.includes('in_app')) {
        await this.storeInAppNotification(notification);
      }

      console.log(`Notification sent successfully for user ${notification.user_id}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Email notification (placeholder - integrate with actual email service)
  private static async sendEmailNotification(
    notification: NotificationData, 
    email: string, 
    name?: string
  ) {
    // In production, integrate with services like:
    // - AWS SES
    // - SendGrid
    // - Mailgun
    // - Ethiopian email services

    const emailTemplate = this.generateEmailTemplate(notification, name);
    
    // Placeholder for actual email sending
    console.log(`Email notification sent to ${email}:`, {
      subject: notification.title,
      body: emailTemplate,
      recipient: email
    });

    // Example integration:
    // await emailService.send({
    //   to: email,
    //   subject: notification.title,
    //   html: emailTemplate,
    //   from: 'notifications@etho-dv.com'
    // });
  }

  // SMS notification (placeholder - integrate with actual SMS service)
  private static async sendSMSNotification(
    notification: NotificationData, 
    phone: string
  ) {
    // In production, integrate with Ethiopian SMS services like:
    // - Ethio Telecom SMS API
    // - YegnaNet SMS
    // - Local SMS gateway providers

    const smsMessage = this.generateSMSMessage(notification);
    
    // Placeholder for actual SMS sending
    console.log(`SMS notification sent to ${phone}:`, smsMessage);

    // Example integration:
    // await smsService.send({
    //   to: phone,
    //   message: smsMessage,
    //   from: 'Etho-DV'
    // });
  }

  // Store in-app notification (integrate with database)
  private static async storeInAppNotification(notification: NotificationData) {
    // Store in database for in-app notifications
    // This could be integrated with the existing MongoDB setup
    
    console.log('In-app notification stored:', notification);

    // Example database storage:
    // await InAppNotification.create({
    //   user_id: notification.user_id,
    //   type: notification.type,
    //   title: notification.title,
    //   message: notification.message,
    //   data: notification.data,
    //   is_read: false,
    //   created_at: new Date()
    // });
  }

  // Generate email template
  private static generateEmailTemplate(notification: NotificationData, name?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: white; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🇺🇸 Etho-DV</h1>
            <p>DV Lottery Application Service</p>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            ${name ? `<p>Dear ${name},</p>` : ''}
            <p>${notification.message}</p>
            
            ${notification.data?.reference_number ? `
              <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Reference Number:</strong> ${notification.data.reference_number}
              </div>
            ` : ''}
            
            ${notification.data?.dv_confirmation_number ? `
              <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>DV Confirmation Number:</strong> ${notification.data.dv_confirmation_number}
              </div>
            ` : ''}
            
            <a href="https://etho-dv.com/dashboard" class="button">View Dashboard</a>
            
            <p>Thank you for using Etho-DV!</p>
          </div>
          <div class="footer">
            <p>© 2024 Etho-DV. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate SMS message
  private static generateSMSMessage(notification: NotificationData): string {
    let message = `Etho-DV: ${notification.title}\n\n${notification.message}`;
    
    if (notification.data?.reference_number) {
      message += `\n\nRef: ${notification.data.reference_number}`;
    }
    
    if (notification.data?.dv_confirmation_number) {
      message += `\n\nDV#: ${notification.data.dv_confirmation_number}`;
    }
    
    message += '\n\nView: etho-dv.com/dashboard';
    
    // SMS length limit (160 characters for single SMS)
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }
    
    return message;
  }

  // Utility function to check if notifications are enabled for user
  static async areNotificationsEnabled(userId: string, channel: 'email' | 'sms'): Promise<boolean> {
    // Check user notification preferences
    // This would integrate with user settings in the database
    return true; // Default to enabled
  }
}

// Export for use in payment verification and other services
export default NotificationService;