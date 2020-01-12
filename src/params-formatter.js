'use strict';

const { ValidationError } = require('./errors');
const { LANGUAGES } = require('./assets/lang-codes');
const { CURRENCIES } = require('./assets/currencies');
const { COUNTRIES } = require('./assets/countries');

const paramFormatters = {
  order: (obj, value) => {
    obj.DS_MERCHANT_ORDER = value;
  },
  merchantCode: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTCODE = value;
  },
  transactionType: (obj, value) => {
    obj.DS_MERCHANT_TRANSACTIONTYPE = value;
  },
  terminal: (obj, value) => {
    obj.DS_MERCHANT_TERMINAL = value;
  },
  currency: (obj, value) => {
    const currencyCode = value.toUpperCase();
    const currency = CURRENCIES[currencyCode];
    if (!currency || !currency.num) {
      throw new ValidationError('Unsupported currency', value, 'currency');
    }

    obj.DS_MERCHANT_CURRENCY = currency.num.toString().padStart(3, '0');
  },
  amount: (obj, value) => {
    if (value.length > 12) {
      throw new ValidationError('Amount to charge is too large', value, 'amount');
    }
    obj.DS_MERCHANT_AMOUNT = String(value);
  },
  merchantName: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTNAME = value;
  },
  merchantURL: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTURL = value;
  },
  merchantSignature: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTSIGNATURE = value;
  },
  successURL: (obj, value) => {
    obj.DS_MERCHANT_URLOK = value;
  },
  errorURL: (obj, value) => {
    obj.DS_MERCHANT_URLKO = value;
  },
  dateFrequency: (obj, value) => {
    obj.DS_MERCHANT_DATEFRECUENCY = value;
  },
  chargeExpiryDate: (obj, value) => {
    obj.DS_MERCHANT_CHARGEEXPIRYDATE = value;
  },
  sumTotal: (obj, value) => {
    obj.DS_MERCHANT_SUMTOTAL = value;
  },
  directPayment: (obj, value) => {
    obj.DS_MERCHANT_DIRECTPAYMENT = value;
  },
  identifier: (obj, value) => {
    obj.DS_MERCHANT_IDENTIFIER = value;
  },
  group: (obj, value) => {
    obj.DS_MERCHANT_GROUP = value;
  },
  pan: (obj, value) => {
    obj.DS_MERCHANT_PAN = value;
  },
  expiryDate: (obj, value) => {
    const stdFmt = value;
    if (stdFmt.length !== 4 || ! /^\d+$/.test(stdFmt)) {
      throw new ValidationError('Invalid expiryDate', value, 'expiryDate');
    }
    const altFmt = `${stdFmt.slice(2, 4)}${stdFmt.slice(0, 2)}`;
    obj.DS_MERCHANT_EXPIRYDATE = altFmt;
  },
  CVV2: (obj, value) => {
    obj.DS_MERCHANT_CVV2 = value;
  },
  cardCountry: (obj, value) => {
    const countryInt = COUNTRIES[value.toLowerCase()];
    if (countryInt) {
      obj.DS_CARD_COUNTRY = countryInt;
    }
  },
  lang: (obj, value) => {
    const langInt = LANGUAGES[value.toLowerCase()];
    if (langInt) {
      obj.DS_MERCHANT_CONSUMERLANGUAGE = langInt;
    }
  },
  merchantData: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTDATA = value;
  },
  clientIp: (obj, value) => {
    obj.DS_MERCHANT_CLIENTIP = value;
  },
  operationId: (obj, value) => {
    obj.DS_MERCHANT_IDOPER = value;
  },
  payMethods: (obj, value) => {
    obj.DS_MERCHANT_PAYMETHODS = value;
  },
  productDescription: (obj, value) => {
    obj.DS_MERCHANT_PRODUCTDESCRIPTION = value;
  },
  taxReference: (obj, value) => {
    obj.DS_MERCHANT_TAX_REFERENCE = value;
  },
  transactionDate: (obj, value) => {
    obj.DS_MERCHANT_TRANSACTIONDATE = value;
  },
  merchantDescriptor: (obj, value) => {
    obj.DS_MERCHANT_MERCHANTDESCRIPTOR = value;
  },
  customerMobile: (obj, value) => {
    obj.DS_MERCHANT_CUSTOMER_MOBILE = value;
  },
  customerMail: (obj, value) => {
    obj.DS_MERCHANT_CUSTOMER_MAIL = value;
  },
  cardHolder: (obj, value) => {
    obj.DS_MERCHANT_TITULAR = value;
  },
  smsTemplate: (obj, value) => {
    obj.DS_MERCHANT_CUSTOMER_SMS_TEXT = value;
  },
};

exports.paramFormatters = paramFormatters;

exports.formatParams = paramsInput => {
  // Pre processing
  const {
    amount,
    merchantCode,
    transactionType,
    order,
    expiryYear,
    expiryMonth,
    expiryDate,
  }= paramsInput;
  if (typeof amount !== 'string' && (!Number.isInteger(amount) || amount < 0)) {
    throw new ValidationError('Invalid amount', amount, 'amount');
  }
  if (!merchantCode) {
    throw new ValidationError('The merchant code is mandatory', merchantCode, 'merchantCode');
  }
  if (!transactionType) {
    throw new ValidationError('The transaction type is mandatory', transactionType, 'transactionType');
  }
  if (!order) {
    throw new ValidationError('No order reference provided.', order, 'order');
  }

  if (!expiryDate
    && expiryMonth && expiryYear) {
    if (expiryMonth.length !== 2) {
      throw new ValidationError('Invalid expiryMonth', expiryMonth, 'expiryMonth');
    }
    if (paramsInput.expiryYear.length !== 2) {
      throw new ValidationError('Invalid expiryYear', expiryYear, 'expiryYear');
    }
    paramsInput.expiryDate = `${expiryMonth}${expiryYear}`;
  }

  // Defaults
  if (!paramsInput.terminal) paramsInput.terminal = '1';
  if (!paramsInput.currency) paramsInput.currency = 'EUR';

  const paramsObj = {};
  for (const key in paramsInput) {
    if (key === 'expiryMonth' || key === 'expiryYear' || key === 'raw') continue;
    const formatter = paramFormatters[key];
    if (!formatter) {
      throw new ValidationError('Unknown parameter', undefined, key);
    }
    formatter(paramsObj, paramsInput[key]);
  }

  // Last, so raw doesn't get overwritten
  if ('raw' in paramsInput && paramsInput.raw) {
    Object.assign(paramsObj, paramsInput.raw);
  }

  return paramsObj;
};
