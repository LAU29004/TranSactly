import { NativeModules } from 'react-native';
import { analyzeSMS } from './api/smsApi';
const { SmsModule } = NativeModules;

export const fetchSMSMessages = async () => {
  return await SmsModule.getSMS();
};

export const getBankingSMS = async (startDate?: Date, endDate?: Date) => {
  const messages = await fetchSMSMessages();

  const filteredMessages = messages.filter((msg: any) => {
    const body = (msg.body || '').toLowerCase();

    // SMS date
    const smsDate = new Date(
      typeof msg.date === 'string' || typeof msg.date === 'number'
        ? Number(msg.date)
        : msg.date,
    );

    // Date range filtering

    const normalizedSmsDate = new Date(
      smsDate.getFullYear(),
      smsDate.getMonth(),
      smsDate.getDate(),
    );

    const normalizedStart = startDate
      ? new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
        )
      : null;

    const normalizedEnd = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      : null;

    const isWithinRange =
      (!normalizedStart || normalizedSmsDate >= normalizedStart) &&
      (!normalizedEnd || normalizedSmsDate <= normalizedEnd);

    // Must contain amount
    const hasAmount = /(?:rs\.?|inr)\s?\d+/i.test(body);

    // Must contain real transaction action
    const hasTransactionAction =
      body.includes('debited') ||
      body.includes('credited') ||
      body.includes('withdrawn') ||
      body.includes('sent') ||
      body.includes('received');

    // Must reference account/card/payment
    const hasAccountReference =
      body.includes('a/c') ||
      body.includes('account') ||
      body.includes('card') ||
      body.includes('upi');

    // Must look like real banking grammar
    const isRealTransactionGrammar =
      body.includes('debited by') ||
      body.includes('credited by') ||
      body.includes('debited from') ||
      body.includes('credited to your') ||
      body.includes('sent to') ||
      body.includes('received from') ||
      body.includes('upi payment');

    // OTP rejection
    const isOtp = body.includes('otp') || body.includes('one time password');

    // Promotion rejection
    const isPromotional =
      body.includes('offer') ||
      body.includes('cashback') ||
      body.includes('sale') ||
      body.includes('discount') ||
      body.includes('voucher') ||
      body.includes('coupon') ||
      body.includes('reward');

    // Spam / gambling / fake finance rejection
    const looksLikeAd =
      body.includes('welcome bonus') ||
      body.includes('claim now') ||
      body.includes('download now') ||
      body.includes('rummy') ||
      body.includes('bonus') ||
      body.includes('loan approved') ||
      body.includes('pre-approved');

    // Failed transaction rejection
    const isFailed =
      body.includes('failed') ||
      body.includes('declined') ||
      body.includes('unsuccessful');

    return (
      hasAmount &&
      hasTransactionAction &&
      hasAccountReference &&
      isRealTransactionGrammar &&
      !isOtp &&
      !isPromotional &&
      !looksLikeAd &&
      !isFailed &&
      isWithinRange
    );
  });

  // Keep latest 100 only
  return filteredMessages.slice(0, 100);
};


export const parseSMSIntoTransactions =
  async (
    startDate?: Date,
    endDate?: Date,
  ) => {

  try {

const sms =
  await getBankingSMS(
    startDate,
    endDate,
  );

const uniqueMap = new Map();

sms.forEach((msg: any) => {
  const key =
    `${msg.body}-${msg.date}`;

  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, {
      message: msg.body || '',
      date: new Date(
        Number(msg.date),
      ).toISOString(),
    });
  }
});

const rawMessages = Array.from(
  uniqueMap.values(),
);

    const response = await analyzeSMS(
      rawMessages,
    );

    const analyzed =
      response.data || [];

    return analyzed.map(
      (tx: any, index: number) => ({

        id: index.toString(),

        text: tx.message,

        amount: tx.amount,

        merchant: tx.merchant,

        category: tx.category,

        type: tx.type,

        confidence: tx.confidence,

        source: tx.source,

        date: tx.transaction_date,
      }),
    );

  } catch (error) {

    return [];
  }
};


