export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaErrorResponse {
  response?: {
    data?: {
      errorCode?: string;
      errorMessage?: string;
    };
  };
}

export interface MpesaAuthResponse {
  access_token: string;
}

export interface MpesaCallbackItem {
  Name: string;
  Value: string | number;
}

export interface MpesaCallbackMetadata {
  Item: MpesaCallbackItem[];
}

export interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: MpesaCallbackMetadata;
}

export interface MpesaCallbackBody {
  Body: {
    stkCallback: MpesaStkCallback;
  };
}

export interface PaymentResult {
  amount: number;
  receiptNumber: string;
  phoneNumber: string;
}

export interface PaymentMessage {
  status: 'success' | 'failed';
  result?: PaymentResult;
  error?: string;
}