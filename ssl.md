# SSLCommerz API Documentation Plan

> **Source:** [SSLCommerz Developer Docs v4](https://developer.sslcommerz.com/doc/v4/) | [Main Portal](https://developer.sslcommerz.com/)  
> **Version:** 4.00 | **Updated:** May 12th, 2019 (with 2025 additions for refund_trans_id)  
> **Last verified:** Re-fetched docs Mar 2025 – gaps filled (Easy Checkout, IPN/Validation extra fields, Network IPs, Quick Bank Pay errors)

---

## 1. Environment Configuration

| Environment | Base URL                           | Use Case                         |
| ----------- | ---------------------------------- | -------------------------------- |
| **Sandbox** | `https://sandbox.sslcommerz.com`   | Test transactions, no real money |
| **Live**    | `https://securepay.sslcommerz.com` | Production, real transactions    |

### Test Credentials (Sandbox)

- **VISA:** 4111111111111111 | CVV: 111 | Exp: 12/26
- **Mastercard:** 5111111111111111 | CVV: 111 | Exp: 12/26
- **Amex:** 371111111111111 | CVV: 111 | Exp: 12/26
- **Mobile OTP:** 111111 or 123456

### TLS Requirement

- Only TLS 1.2 or higher accepted
- Test: `curl "https://sandbox.sslcommerz.com/public/tls/" -v`

---

## 2. API Endpoints Overview

| #   | Endpoint                                         | Method | Purpose                                             |
| --- | ------------------------------------------------ | ------ | --------------------------------------------------- |
| 1   | `gwprocess/v4/api.php`                           | POST   | Create Session / Initiate Payment                   |
| 2   | `validator/api/validationserverAPI.php`          | GET    | Order Validation (validate IPN)                     |
| 3   | `validator/api/merchantTransIDvalidationAPI.php` | GET    | Refund Initiate / Refund Status / Transaction Query |
| 4   | `gwprocess/v4/invoice.php`                       | POST   | Create Invoice                                      |
| 5   | `validator/api/v4/`                              | POST   | Invoice Payment Status / Invoice Cancellation       |
| 6   | Merchant-hosted APIs                             | POST   | Google Pay Config / Initiate / Token Process        |
| 7   | Quick Bank Pay APIs                              | POST   | JWT Auth / Bill Query / Payment Confirm / Status    |

---

## 3. Endpoint Details

---

### 3.1 Create Session (Initiate Payment)

**Purpose:** Generate session for payment; redirect customer to `GatewayPageURL`.

| Property    | Value                                                   |
| ----------- | ------------------------------------------------------- |
| **Path**    | `gwprocess/v4/api.php`                                  |
| **Method**  | POST                                                    |
| **Sandbox** | `https://sandbox.sslcommerz.com/gwprocess/v4/api.php`   |
| **Live**    | `https://securepay.sslcommerz.com/gwprocess/v4/api.php` |

#### Request Parameters

| Param                    | Data Type      | Required    | Description                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store_id`               | string (30)    | ✅          | Store ID                                                                                                                                                                                                                                                                                                                                     |
| `store_passwd`           | string (30)    | ✅          | Store password                                                                                                                                                                                                                                                                                                                               |
| `total_amount`           | decimal (10,2) | ✅          | Amount (10.00–500000.00 BDT)                                                                                                                                                                                                                                                                                                                 |
| `currency`               | string (3)     | ✅          | BDT, USD, EUR, SGD, INR, MYR, etc.                                                                                                                                                                                                                                                                                                           |
| `tran_id`                | string (30)    | ✅          | Unique transaction ID                                                                                                                                                                                                                                                                                                                        |
| `success_url`            | string (255)   | ✅          | Success callback URL                                                                                                                                                                                                                                                                                                                         |
| `fail_url`               | string (255)   | ✅          | Fail callback URL                                                                                                                                                                                                                                                                                                                            |
| `cancel_url`             | string (255)   | ✅          | Cancel callback URL                                                                                                                                                                                                                                                                                                                          |
| `ipn_url`                | string (255)   | ⚠️          | IPN URL (recommended)                                                                                                                                                                                                                                                                                                                        |
| `product_category`       | string (50)    | ✅          | Product category                                                                                                                                                                                                                                                                                                                             |
| `product_name`           | string (255)   | ✅          | Product name(s), comma-separated                                                                                                                                                                                                                                                                                                             |
| `product_profile`        | string (100)   | ✅          | `telecom-vertical`, `travel-vertical`, `airline-tickets`, `non-physical-goods`, `physical-goods`, `general`                                                                                                                                                                                                                                  |
| `cus_name`               | string (50)    | ✅          | Customer name                                                                                                                                                                                                                                                                                                                                |
| `cus_email`              | string (50)    | ✅          | Customer email                                                                                                                                                                                                                                                                                                                               |
| `cus_add1`               | string (50)    | ✅          | Address line 1                                                                                                                                                                                                                                                                                                                               |
| `cus_add2`               | string (50)    |             | Address line 2                                                                                                                                                                                                                                                                                                                               |
| `cus_city`               | string (50)    | ✅          | City                                                                                                                                                                                                                                                                                                                                         |
| `cus_state`              | string (50)    |             | State                                                                                                                                                                                                                                                                                                                                        |
| `cus_postcode`           | string (30)    | ✅          | Postcode                                                                                                                                                                                                                                                                                                                                     |
| `cus_country`            | string (50)    | ✅          | Country                                                                                                                                                                                                                                                                                                                                      |
| `cus_phone`              | string (20)    | ✅          | Phone                                                                                                                                                                                                                                                                                                                                        |
| `cus_fax`                | string (20)    |             | Fax                                                                                                                                                                                                                                                                                                                                          |
| `multi_card_name`        | string (30)    |             | Gateway list control. Individual: brac_visa, dbbl_visa, city_visa, ebl_visa, sbl_visa, brac_master, dbbl_master, city_master, ebl_master, sbl_master, city_amex, qcash, dbbl_nexus, bankasia, abbank, ibbl, mtbl, bkash, dbblmobilebanking, city, upay, tapnpay. Groups: internetbank, mobilebank, othercard, visacard, mastercard, amexcard |
| `allowed_bin`            | string (255)   |             | Allowed BINs, comma-separated                                                                                                                                                                                                                                                                                                                |
| `emi_option`             | integer (1)    |             | 1/0 – EMI enabled                                                                                                                                                                                                                                                                                                                            |
| `emi_max_inst_option`    | integer (2)    |             | Max instalments (e.g. 3,6,9)                                                                                                                                                                                                                                                                                                                 |
| `emi_selected_inst`      | integer (2)    |             | Pre-selected instalment                                                                                                                                                                                                                                                                                                                      |
| `emi_allow_only`         | integer (1)    |             | 1 = EMI only                                                                                                                                                                                                                                                                                                                                 |
| `shipping_method`        | string (50)    | ✅          | YES / NO / Courier / SSLCOMMERZ_LOGISTIC                                                                                                                                                                                                                                                                                                     |
| `num_of_item`            | integer (1)    | ✅          | Number of items (required for SSLCOMMERZ_LOGISTIC)                                                                                                                                                                                                                                                                                           |
| `weight_of_items`        | decimal (10,2) | Conditional | Weight in kg (required for SSLCOMMERZ_LOGISTIC)                                                                                                                                                                                                                                                                                              |
| `ship_name`              | string (50)    | Conditional | Shipping name (required if shipping_method=YES)                                                                                                                                                                                                                                                                                              |
| `ship_add1`              | string (50)    | Conditional | Shipping address 1 (required if shipping_method=YES)                                                                                                                                                                                                                                                                                         |
| `ship_add2`              | string (50)    |             | Shipping address 2                                                                                                                                                                                                                                                                                                                           |
| `ship_area`              | string (50)    | Conditional | Shipping area (required if shipping_method=YES)                                                                                                                                                                                                                                                                                              |
| `ship_city`              | string (50)    | Conditional | Shipping city (required if shipping_method=YES)                                                                                                                                                                                                                                                                                              |
| `ship_sub_city`          | string (50)    | Conditional | Shipping sub-city (required if shipping_method=YES)                                                                                                                                                                                                                                                                                          |
| `ship_state`             | string (50)    |             | Shipping state                                                                                                                                                                                                                                                                                                                               |
| `ship_postcode`          | string (50)    | Conditional | Shipping postcode (required if shipping_method=YES)                                                                                                                                                                                                                                                                                          |
| `ship_country`           | string (50)    | Conditional | Shipping country (required if shipping_method=YES)                                                                                                                                                                                                                                                                                           |
| `logistic_pickup_id`     | string (50)    | Conditional | Pickup ID (required for SSLCOMMERZ_LOGISTIC)                                                                                                                                                                                                                                                                                                 |
| `logistic_delivery_type` | string (50)    | Conditional | Delivery type (required for SSLCOMMERZ_LOGISTIC)                                                                                                                                                                                                                                                                                             |
| `cart`                   | json           |             | `[{"sku":"","product":"","quantity":"","amount":"","unit_price":""},...]`                                                                                                                                                                                                                                                                    |
| `product_amount`         | decimal (10,2) |             | Product price                                                                                                                                                                                                                                                                                                                                |
| `vat`                    | decimal (10,2) |             | VAT                                                                                                                                                                                                                                                                                                                                          |
| `discount_amount`        | decimal (10,2) |             | Discount                                                                                                                                                                                                                                                                                                                                     |
| `convenience_fee`        | decimal (10,2) |             | Convenience fee                                                                                                                                                                                                                                                                                                                              |
| `value_a`                | string (255)   |             | Custom metadata                                                                                                                                                                                                                                                                                                                              |
| `value_b`                | string (255)   |             | Custom metadata                                                                                                                                                                                                                                                                                                                              |
| `value_c`                | string (255)   |             | Custom metadata                                                                                                                                                                                                                                                                                                                              |
| `value_d`                | string (255)   |             | Custom metadata                                                                                                                                                                                                                                                                                                                              |
| `hours_till_departure`   | string (30)    | Conditional | Required if product_profile=airline-tickets                                                                                                                                                                                                                                                                                                  |
| `flight_type`            | string (30)    | Conditional | Required if product_profile=airline-tickets                                                                                                                                                                                                                                                                                                  |
| `pnr`                    | string (50)    | Conditional | Required if product_profile=airline-tickets                                                                                                                                                                                                                                                                                                  |
| `journey_from_to`        | string (255)   | Conditional | Required if product_profile=airline-tickets                                                                                                                                                                                                                                                                                                  |
| `third_party_booking`    | string (20)    | Conditional | Required if product_profile=airline-tickets                                                                                                                                                                                                                                                                                                  |
| `hotel_name`             | string (255)   | Conditional | Required if product_profile=travel-vertical                                                                                                                                                                                                                                                                                                  |
| `length_of_stay`         | string (30)    | Conditional | Required if product_profile=travel-vertical                                                                                                                                                                                                                                                                                                  |
| `check_in_time`          | string (30)    | Conditional | Required if product_profile=travel-vertical                                                                                                                                                                                                                                                                                                  |
| `hotel_city`             | string (50)    | Conditional | Required if product_profile=travel-vertical                                                                                                                                                                                                                                                                                                  |
| `product_type`           | string (30)    | Conditional | Required if product_profile=telecom-vertical                                                                                                                                                                                                                                                                                                 |
| `topup_number`           | string (150)   | Conditional | Required if product_profile=telecom-vertical                                                                                                                                                                                                                                                                                                 |
| `country_topup`          | string (30)    | Conditional | Required if product_profile=telecom-vertical                                                                                                                                                                                                                                                                                                 |

#### Response Parameters

| Param                      | Data Type    | Description              |
| -------------------------- | ------------ | ------------------------ |
| `status`                   | string (10)  | SUCCESS / FAILED         |
| `failedreason`             | string (255) | Failure reason           |
| `sessionkey`               | string (50)  | Session key              |
| `gw`                       | object       | Gateway list by category |
| `GatewayPageURL`           | string (255) | Redirect URL for payment |
| `redirectGatewayURL`       | string       | Direct gateway URL       |
| `redirectGatewayURLFailed` | string       | Failed redirect URL      |
| `directPaymentURLBank`     | string       | Bank payment URL         |
| `directPaymentURLCard`     | string       | Card payment URL         |
| `directPaymentURL`         | string       | Direct payment URL       |
| `storeBanner`              | string (255) | Store banner URL         |
| `storeLogo`                | string (255) | Store logo URL           |
| `desc`                     | array        | Gateway descriptions     |
| `is_direct_pay_enable`     | string       | 1/0                      |

#### Easy Checkout (Pop-up / Embed)

| Property          | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Sandbox embed** | `https://sandbox.sslcommerz.com/embed.min.js`       |
| **Live embed**    | `https://seamless-epay.sslcommerz.com/embed.min.js` |

**Pop-up button attributes:** `id="sslczPayBtn"`, `token`, `postdata`, `order`, `endpoint` (URL where backend initiates payment to SSLCommerz).

**Cart format (simplified):** `[{"product":"","amount":""},...]` (product + amount only for Easy Checkout).

---

### 3.2 IPN (Instant Payment Notification)

**Purpose:** SSLCommerz POSTs to merchant IPN URL. Merchant must validate via Order Validation API.

| Property      | Value                        |
| ------------- | ---------------------------- |
| **Direction** | SSLCommerz → Merchant        |
| **Method**    | POST                         |
| **URL**       | Configured in Merchant Panel |

#### IPN POST Parameters (Received)

| Param                      | Data Type      | Description                                        |
| -------------------------- | -------------- | -------------------------------------------------- |
| `status`                   | string (20)    | VALID / FAILED / CANCELLED / EXPIRED / UNATTEMPTED |
| `tran_date`                | datetime       | Payment completion date                            |
| `tran_id`                  | string (30)    | Transaction ID                                     |
| `val_id`                   | string (50)    | Validation ID                                      |
| `amount`                   | decimal (10,2) | Amount                                             |
| `store_amount`             | decimal (10,2) | Net amount after charges                           |
| `card_type`                | string (50)    | Gateway name                                       |
| `card_no`                  | string (80)    | Masked card / reference                            |
| `currency`                 | string (3)     | Currency                                           |
| `bank_tran_id`             | string (80)    | Bank transaction ID                                |
| `card_issuer`              | string (100)   | Issuer bank                                        |
| `card_brand`               | string (30)    | VISA, MASTER, AMEX, IB, MOBILE BANKING             |
| `card_issuer_country`      | string (50)    | Issuer country                                     |
| `card_issuer_country_code` | string (2)     | Country code                                       |
| `currency_type`            | string (3)     | Original currency                                  |
| `currency_amount`          | decimal (10,2) | Original amount                                    |
| `value_a`                  | string (255)   | Custom value                                       |
| `value_b`                  | string (255)   | Custom value                                       |
| `value_c`                  | string (255)   | Custom value                                       |
| `value_d`                  | string (255)   | Custom value                                       |
| `store_id`                 | string (30)    | Store ID                                           |
| `currency_rate`            | string         | Currency conversion rate                           |
| `base_fair`                | string         | Base fair amount                                   |
| `verify_sign`              | string (255)   | Validation key                                     |
| `verify_key`               | string         | Validation key                                     |
| `risk_level`               | integer (1)    | 0 = safe, 1 = risky                                |
| `risk_title`               | string (50)    | Risk description                                   |

---

### 3.3 Order Validation API

**Purpose:** Validate IPN / transaction using `val_id`.

| Property    | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| **Path**    | `validator/api/validationserverAPI.php`                                  |
| **Method**  | GET                                                                      |
| **Sandbox** | `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php`   |
| **Live**    | `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php` |

#### Request Parameters

| Param          | Data Type   | Required | Description                |
| -------------- | ----------- | -------- | -------------------------- |
| `val_id`       | string (50) | ✅       | Validation ID from IPN     |
| `store_id`     | string (30) | ✅       | Store ID                   |
| `store_passwd` | string (30) | ✅       | Store password             |
| `format`       | string (10) |          | json / xml (default: json) |
| `v`            | integer (1) |          | Reserved                   |

#### Response Parameters

| Param                      | Data Type      | Description                             |
| -------------------------- | -------------- | --------------------------------------- |
| `status`                   | string (20)    | VALID / VALIDATED / INVALID_TRANSACTION |
| `tran_date`                | datetime       | Transaction date                        |
| `tran_id`                  | string (30)    | Transaction ID                          |
| `val_id`                   | string (50)    | Validation ID                           |
| `amount`                   | decimal (10,2) | Amount                                  |
| `store_amount`             | decimal (10,2) | Net amount                              |
| `card_type`                | string (50)    | Gateway                                 |
| `card_no`                  | string (80)    | Card/reference                          |
| `currency`                 | string (3)     | Currency                                |
| `bank_tran_id`             | string (80)    | Bank transaction ID                     |
| `card_issuer`              | string (50)    | Issuer                                  |
| `card_brand`               | string (30)    | Card brand                              |
| `card_issuer_country`      | string (50)    | Country                                 |
| `card_issuer_country_code` | string (2)     | Country code                            |
| `currency_type`            | string (3)     | Original currency                       |
| `currency_amount`          | decimal (10,2) | Original amount                         |
| `emi_instalment`           | integer (2)    | EMI tenure                              |
| `emi_amount`               | decimal (10,2) | EMI amount                              |
| `discount_amount`          | decimal (10,2) | Discount                                |
| `discount_percentage`      | decimal (10,2) | Discount %                              |
| `discount_remarks`         | string (255)   | Discount notes                          |
| `value_a`–`value_d`        | string (255)   | Custom values                           |
| `risk_level`               | integer (1)    | 0/1                                     |
| `risk_title`               | string (50)    | Risk description                        |
| `currency_rate`            | string         | Currency conversion rate                |
| `base_fair`                | string         | Base fair amount                        |
| `emi_description`          | string         | EMI description                         |
| `emi_issuer`               | string         | EMI issuer                              |
| `account_details`          | string         | Account details                         |
| `gw_version`               | string         | Gateway version                         |
| `APIConnect`               | string         | DONE / etc.                             |
| `validated_on`             | datetime       | Validation time                         |

**Security check points:** Validate status (VALID/FAILED/CANCELLED); check currency type; validate amount and tran_id against your DB; if `risk_level=1` and status=VALID, hold service and verify customer.

---

### 3.4 Refund API

#### 3.4.1 Initiate Refund

| Property    | Value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| **Path**    | `validator/api/merchantTransIDvalidationAPI.php`                                  |
| **Method**  | GET                                                                               |
| **Sandbox** | `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php`   |
| **Live**    | `https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php` |

**Request Parameters**

| Param             | Data Type      | Required | Description                                        |
| ----------------- | -------------- | -------- | -------------------------------------------------- |
| `bank_tran_id`    | string (80)    | ✅       | Bank transaction ID                                |
| `refund_trans_id` | string (30)    | ✅       | Unique refund transaction ID (new from 24/02/2025) |
| `store_id`        | string (30)    | ✅       | Store ID                                           |
| `store_passwd`    | string (30)    | ✅       | Store password                                     |
| `refund_amount`   | decimal (10,2) | ✅       | Refund amount                                      |
| `refund_remarks`  | string (255)   | ✅       | Refund reason                                      |
| `refe_id`         | string (50)    |          | Reference ID                                       |
| `format`          | string (10)    |          | json / xml                                         |

**Response Parameters**

| Param           | Data Type    | Description                                |
| --------------- | ------------ | ------------------------------------------ |
| `APIConnect`    | string (30)  | DONE / INACTIVE / FAILED / INVALID_REQUEST |
| `bank_tran_id`  | string (80)  | Bank transaction ID                        |
| `trans_id`      | string (30)  | Transaction ID                             |
| `refund_ref_id` | string (50)  | Refund reference ID                        |
| `status`        | string (30)  | success / failed / processing              |
| `errorReason`   | string (255) | Error message                              |

**Security:** Your Public IP must be registered at SSLCOMMERZ Live System for Refund API.

#### 3.4.2 Query Refund Status

| Property   | Value                                            |
| ---------- | ------------------------------------------------ |
| **Path**   | `validator/api/merchantTransIDvalidationAPI.php` |
| **Method** | GET                                              |

**Request Parameters**

| Param           | Data Type   | Required | Description         |
| --------------- | ----------- | -------- | ------------------- |
| `refund_ref_id` | string (50) | ✅       | Refund reference ID |
| `store_id`      | string (30) | ✅       | Store ID            |
| `store_passwd`  | string (30) | ✅       | Store password      |

**Response Parameters**

| Param           | Data Type    | Description                       |
| --------------- | ------------ | --------------------------------- |
| `APIConnect`    | string (30)  | Connection status                 |
| `bank_tran_id`  | string (80)  | Bank transaction ID               |
| `tran_id`       | string (30)  | Transaction ID                    |
| `refund_ref_id` | string (50)  | Refund reference ID               |
| `initiated_on`  | datetime     | Initiation time                   |
| `refunded_on`   | datetime     | Completion time                   |
| `status`        | string (30)  | refunded / processing / cancelled |
| `errorReason`   | string (255) | Error message                     |

---

### 3.5 Transaction Query API

#### 3.5.1 By Session ID

| Property   | Value                                            |
| ---------- | ------------------------------------------------ |
| **Path**   | `validator/api/merchantTransIDvalidationAPI.php` |
| **Method** | GET                                              |

**Request Parameters**

| Param          | Data Type   | Required | Description                |
| -------------- | ----------- | -------- | -------------------------- |
| `sessionkey`   | string (50) | ✅       | Session key                |
| `store_id`     | string (30) | ✅       | Store ID                   |
| `store_passwd` | string (30) | ✅       | Store password             |
| `format`       | string (10) |          | json / xml (default: json) |

**Response Parameters**

| Param                      | Data Type      | Description                          |
| -------------------------- | -------------- | ------------------------------------ |
| `APIConnect`               | string (30)    | Connection status                    |
| `status`                   | string (20)    | VALID / VALIDATED / PENDING / FAILED |
| `sessionkey`               | string (50)    | Session key                          |
| `tran_date`                | datetime       | Transaction date                     |
| `tran_id`                  | string (30)    | Transaction ID                       |
| `val_id`                   | string (50)    | Validation ID                        |
| `amount`                   | decimal (10,2) | Amount                               |
| `store_amount`             | decimal (10,2) | Net amount                           |
| `card_type`                | string (50)    | Gateway                              |
| `card_no`                  | string (80)    | Card/reference                       |
| `currency`                 | string (3)     | Currency                             |
| `bank_tran_id`             | string (80)    | Bank transaction ID                  |
| `card_issuer`              | string (50)    | Issuer                               |
| `card_brand`               | string (30)    | Card brand                           |
| `card_issuer_country`      | string (50)    | Country                              |
| `card_issuer_country_code` | string (2)     | Country code                         |
| `currency_type`            | string (3)     | Original currency                    |
| `currency_amount`          | decimal (10,2) | Original amount                      |
| `emi_instalment`           | integer (2)    | EMI tenure                           |
| `emi_amount`               | decimal (10,2) | EMI amount                           |
| `discount_percentage`      | decimal (10,2) | Discount %                           |
| `discount_remarks`         | string (255)   | Discount notes                       |
| `value_a`–`value_d`        | string (255)   | Custom values                        |
| `risk_level`               | integer (1)    | 0/1                                  |
| `risk_title`               | string (50)    | Risk description                     |
| `currency_rate`            | string         | Currency conversion rate             |
| `base_fair`                | string         | Base fair amount                     |
| `validated_on`             | datetime       | Validation time                      |
| `gw_version`               | string         | Gateway version                      |

#### 3.5.2 By Transaction ID

| Property   | Value                                            |
| ---------- | ------------------------------------------------ |
| **Path**   | `validator/api/merchantTransIDvalidationAPI.php` |
| **Method** | GET                                              |

**Request Parameters**

| Param          | Data Type   | Required | Description                |
| -------------- | ----------- | -------- | -------------------------- |
| `tran_id`      | string (50) | ✅       | Transaction ID             |
| `store_id`     | string (30) | ✅       | Store ID                   |
| `store_passwd` | string (30) | ✅       | Store password             |
| `format`       | string (10) |          | json / xml (default: json) |

**Response Parameters**

| Param                        | Data Type    | Description                     |
| ---------------------------- | ------------ | ------------------------------- |
| `APIConnect`                 | string (30)  | Connection status               |
| `no_of_trans_found`          | integer (2)  | Number of transactions          |
| `element`                    | array        | Transaction details (see below) |
| `element.[].bank_gw`         | string       | Bank gateway name               |
| `element.[].gw_version`      | string       | Gateway version                 |
| `element.[].emi_description` | string       | EMI description                 |
| `element.[].emi_issuer`      | string       | EMI issuer                      |
| `element.[].error`           | string (255) | Failure reason if any           |

---

### 3.6 Invoice API

#### 3.6.1 Create Invoice

| Property    | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| **Path**    | `gwprocess/v4/invoice.php`                                  |
| **Method**  | POST                                                        |
| **Sandbox** | `https://sandbox.sslcommerz.com/gwprocess/v4/invoice.php`   |
| **Live**    | `https://securepay.sslcommerz.com/gwprocess/v4/invoice.php` |

**Request Parameters**

| Param                  | Data Type      | Required | Description                                   |
| ---------------------- | -------------- | -------- | --------------------------------------------- |
| `store_id`             | string (30)    | ✅       | Store ID                                      |
| `store_passwd`         | string (30)    | ✅       | Store password                                |
| `refer`                | string (30)    | ✅       | Reference from panel (sandbox: 5B1F9DE4D82B6) |
| `total_amount`         | decimal (10,2) | ✅       | Amount                                        |
| `currency`             | string (3)     | ✅       | Currency                                      |
| `tran_id`              | string (30)    | ✅       | Transaction ID                                |
| `acct_no`              | string (50)    | ✅       | Invoice/reference ID                          |
| `product_category`     | string (50)    | ✅       | Product category                              |
| `cus_name`             | string (50)    | ✅       | Customer name                                 |
| `cus_email`            | string (50)    | ✅       | Customer email                                |
| `cus_add1`             | string (50)    | ✅       | Address                                       |
| `cus_add2`             | string (50)    |          | Address 2                                     |
| `cus_city`             | string (50)    | ✅       | City                                          |
| `cus_state`            | string (50)    |          | State                                         |
| `cus_postcode`         | string (30)    | ✅       | Postcode                                      |
| `cus_country`          | string (50)    | ✅       | Country                                       |
| `cus_phone`            | string (20)    | ✅       | Phone                                         |
| `cus_fax`              | string (20)    |          | Fax                                           |
| `shipping_method`      | string (50)    | ✅       | YES / NO / Courier                            |
| `num_of_item`          | integer (1)    | ✅       | Number of items                               |
| `ship_name`            | string (50)    |          | Shipping name                                 |
| `ship_add1`            | string (50)    |          | Shipping address                              |
| `ship_add2`            | string (50)    |          | Shipping address 2                            |
| `ship_city`            | string (50)    |          | Shipping city                                 |
| `ship_state`           | string (50)    |          | Shipping state                                |
| `ship_postcode`        | string (50)    |          | Shipping postcode                             |
| `ship_country`         | string (50)    |          | Shipping country                              |
| `product_name`         | string (255)   | ✅       | Product name                                  |
| `product_category`     | string (100)   | ✅       | Product category                              |
| `product_profile`      | string (100)   |          | Product profile                               |
| `cart`                 | json           |          | Cart items                                    |
| `product_amount`       | decimal (10,2) |          | Product amount                                |
| `vat`                  | decimal (10,2) |          | VAT                                           |
| `discount_amount`      | decimal (10,2) |          | Discount                                      |
| `convenience_fee`      | decimal (10,2) |          | Convenience fee                               |
| `is_bangla_qr_enabled` | string (3)     |          | YES / NO                                      |
| `is_sent_email`        | string (3)     |          | yes / no                                      |
| `is_sent_sms`          | string (3)     |          | yes / no                                      |
| `ipn_url`              | string (255)   |          | IPN URL                                       |
| `emi_option`           | integer (1)    |          | EMI 1/0                                       |
| `emi_max_inst_option`  | integer (2)    |          | Max instalments                               |
| `emi_selected_inst`    | integer (2)    |          | Selected instalment                           |
| `emi_allow_only`       | integer (1)    |          | EMI only 1/0                                  |
| `value_a`–`value_d`    | string (255)   |          | Custom values                                 |

**Response Parameters**

| Param                  | Data Type    | Description                   |
| ---------------------- | ------------ | ----------------------------- |
| `status`               | string (10)  | success / failed              |
| `error_reason`         | string (255) | Error message                 |
| `invoice_refer`        | string (50)  | Refer used                    |
| `pay_url`              | string (256) | Payment link                  |
| `qr_image_url`         | string       | QR image URL                  |
| `qr_image_pay_url`     | string (255) | QR image pay URL              |
| `invoice_id`           | string (50)  | Invoice ID                    |
| `email_sending_status` | string (20)  | YES / NO / FAILED / NOT_READY |
| `sms_sending_status`   | string (20)  | YES / NO / FAILED / NOT_READY |
| `bangla_qr_code`       | string (500) | Bangla QR content             |

#### 3.6.2 Invoice Payment Status

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| **Path**    | `validator/api/v4/`                                  |
| **Method**  | POST                                                 |
| **Sandbox** | `https://sandbox.sslcommerz.com/validator/api/v4/`   |
| **Live**    | `https://securepay.sslcommerz.com/validator/api/v4/` |

**Request Parameters**

| Param          | Data Type   | Required | Description            |
| -------------- | ----------- | -------- | ---------------------- |
| `store_id`     | string (30) | ✅       | Store ID               |
| `store_passwd` | string (30) | ✅       | Store password         |
| `refer`        | string (30) | ✅       | Reference              |
| `invoice_id`   | string (50) | ✅       | Invoice ID             |
| `action`       | string (30) | ✅       | `invoicePaymentStatus` |

**Response Parameters**

| Param            | Data Type    | Description                          |
| ---------------- | ------------ | ------------------------------------ |
| `APIConnect`     | string (30)  | Connection status                    |
| `status`         | string (20)  | success / failed                     |
| `failedreason`   | string (256) | Error message                        |
| `refer`          | string (30)  | Reference                            |
| `invoice_id`     | string (50)  | Invoice ID                           |
| `payment_status` | string (20)  | VALID / PENDING / FAILED / VALIDATED |
| `transaction`    | array        | Transaction details                  |

#### 3.6.3 Invoice Cancellation

| Property   | Value               |
| ---------- | ------------------- |
| **Path**   | `validator/api/v4/` |
| **Method** | POST                |

**Request Parameters**

| Param          | Data Type   | Required | Description           |
| -------------- | ----------- | -------- | --------------------- |
| `store_id`     | string (30) | ✅       | Store ID              |
| `store_passwd` | string (30) | ✅       | Store password        |
| `refer`        | string (30) | ✅       | Reference             |
| `invoice_id`   | string (50) | ✅       | Invoice ID            |
| `action`       | string (30) | ✅       | `invoiceCancellation` |

**Response Parameters**

| Param            | Data Type    | Description       |
| ---------------- | ------------ | ----------------- |
| `APIConnect`     | string (30)  | Connection status |
| `status`         | string (20)  | success / failed  |
| `failedreason`   | string (256) | Error message     |
| `refer`          | string (30)  | Reference         |
| `invoice_id`     | string (50)  | Invoice ID        |
| `payment_status` | string (20)  | CANCELLED / VALID |

---

### 3.7 Google Pay API (Merchant Hosted Payment)

**Base:** `POST https://<env>.com/api/v1/merchant-hosted-payment` (exact base URL from SSLCommerz)

#### 3.7.1 Google Pay Config

| Property   | Value                             |
| ---------- | --------------------------------- |
| **Path**   | `/api/v1/merchant-hosted-payment` |
| **Method** | POST                              |

**Request Parameters**

| Param          | Data Type   | Required | Description       |
| -------------- | ----------- | -------- | ----------------- |
| `action`       | string      | ✅       | `googlepayConfig` |
| `store_id`     | string (30) | ✅       | Store ID          |
| `store_passwd` | string (30) | ✅       | Store password    |

**Response Parameters**

| Param             | Data Type | Description                                                                                                                                |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `APIConnect`      | string    | SUCCESS / INVALID_REQUEST                                                                                                                  |
| `status_code`     | number    | HTTP code                                                                                                                                  |
| `status_sub_code` | number    | Sub HTTP code                                                                                                                              |
| `failed_reason`   | object    | Failure details                                                                                                                            |
| `data`            | object    | `apiVersion`, `apiVersionMinor`, `gatewayMerchantId`, `gateway`, `merchantId`, `merchantName`, `allowedAuthMethods`, `allowedCardNetworks` |

#### 3.7.2 Initiate Transaction (Google Pay)

| Property   | Value                             |
| ---------- | --------------------------------- |
| **Path**   | `/api/v1/merchant-hosted-payment` |
| **Method** | POST                              |

**Request Parameters**

| Param                  | Data Type              | Required    | Description                                    |
| ---------------------- | ---------------------- | ----------- | ---------------------------------------------- |
| `action`               | string                 | ✅          | `initiateTransaction`                          |
| `store_id`             | string (30)            | ✅          | Store ID                                       |
| `store_passwd`         | string (30)            | ✅          | Store password                                 |
| `user_refer`           | string (256) encrypted | Conditional | Required unless `enable_cus_googlepay=1`       |
| `total_amount`         | decimal (10,2)         | ✅          | Amount                                         |
| `currency`             | string (3)             | ✅          | Currency                                       |
| `tran_id`              | string (30)            | ✅          | Transaction ID                                 |
| `success_url`          | string (255)           | ✅          | Success URL                                    |
| `fail_url`             | string (255)           | ✅          | Fail URL                                       |
| `cancel_url`           | string (255)           | ✅          | Cancel URL                                     |
| `ipn_url`              | string (255)           |             | IPN URL                                        |
| `cus_name`             | string (50)            | ✅          | Customer name                                  |
| `cus_email`            | string (50)            | ✅          | Customer email                                 |
| `cus_add1`             | string (50)            | ✅          | Address                                        |
| `cus_add2`             | string (50)            |             | Address 2                                      |
| `cus_city`             | string (50)            | ✅          | City                                           |
| `cus_postcode`         | string (30)            | ✅          | Postcode                                       |
| `cus_country`          | string (50)            | ✅          | Country                                        |
| `cus_phone`            | string (50)            | ✅          | Phone                                          |
| `cus_state`            | string (20)            |             | State                                          |
| `cus_fax`              | string (20)            |             | Fax                                            |
| `shipping_method`      | string (50)            | ✅          | YES / NO / Courier                             |
| `num_of_item`          | integer (1)            |             | Number of items                                |
| `ship_name`            | string (50)            |             | Shipping name                                  |
| `ship_add1`            | string (50)            |             | Shipping address                               |
| `ship_add2`            | string (50)            |             | Shipping address 2                             |
| `ship_city`            | string (50)            |             | Shipping city                                  |
| `ship_state`           | string (50)            |             | Shipping state                                 |
| `ship_postcode`        | string (50)            |             | Shipping postcode                              |
| `ship_country`         | string (50)            |             | Shipping country                               |
| `product_name`         | string (255)           | ✅          | Product name                                   |
| `product_category`     | string (100)           | ✅          | Product category                               |
| `product_profile`      | string (100)           | ✅          | Product profile                                |
| `product_type`         | string (30)            |             | Prepaid/Postpaid (telecom)                     |
| `topup_number`         | string (150)           |             | Mobile number(s) (telecom)                     |
| `country_topup`        | string (30)            |             | Country (telecom)                              |
| `cart`                 | json                   |             | Cart items                                     |
| `product_amount`       | decimal (10,2)         |             | Product amount                                 |
| `vat`                  | decimal (10,2)         |             | VAT                                            |
| `discount_amount`      | decimal (10,2)         |             | Discount                                       |
| `convenience_fee`      | decimal (10,2)         |             | Convenience fee                                |
| `value_a`–`value_d`    | string (255)           |             | Custom values                                  |
| `disallowed_bin`       | string                 |             | Disallowed BINs                                |
| `disallowed_bin_msg`   | string                 |             | Message for disallowed BIN                     |
| `allowed_bin`          | string (255)           |             | Allowed BINs                                   |
| `allowed_bin_msg`      | string                 |             | Message for allowed BIN                        |
| `enable_cus_googlepay` | boolean                |             | 1 = show Google Pay, makes user_refer optional |

**Response Parameters**

| Param         | Data Type | Description                                                                                                     |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `APIConnect`  | string    | Connection status                                                                                               |
| `status_code` | number    | HTTP code                                                                                                       |
| `data`        | object    | `sessionkey`, `redirectGatewayURL`, `googlepay` (totalPrice, currencyCode, countryCode, session_key, actionurl) |

#### 3.7.3 Process Google Pay Token

| Property   | Value                           |
| ---------- | ------------------------------- |
| **Path**   | From `data.googlepay.actionurl` |
| **Method** | POST                            |

**Request Parameters**

| Param               | Data Type | Required | Description                        |
| ------------------- | --------- | -------- | ---------------------------------- |
| `session_key`       | string    | ✅       | Session key from initiate response |
| `en_signature_data` | string    | ✅       | Base64-encoded Google Pay payload  |

**Response Parameters**

| Param     | Data Type | Description                                            |
| --------- | --------- | ------------------------------------------------------ |
| `status`  | string    | SUCCESS / FAIL                                         |
| `message` | string    | Message                                                |
| `data`    | object    | `type` (otp/regular), `data` (form HTML), `return_url` |

---

### 3.8 Quick Bank Pay API

**Auth:** API-KEY header or Bearer token  
**Content-Type:** application/json

| Property | Value                                  |
| -------- | -------------------------------------- |
| **Base** | Separate API (exact URL from provider) |

#### 3.8.1 JWT Token Generation

| Property   | Value                     |
| ---------- | ------------------------- |
| **Path**   | `POST /api/v1/auth/token` |
| **Method** | POST                      |

**Request Body**

| Field      | Type   | Required | Description           |
| ---------- | ------ | -------- | --------------------- |
| `username` | string | ✅       | Merchant API username |
| `password` | string | ✅       | Password              |

**Response**

| Field             | Type   | Description  |
| ----------------- | ------ | ------------ |
| `status`          | string | success      |
| `message`         | string | Bill Found   |
| `data.token`      | string | JWT token    |
| `data.expires_in` | string | Expiry (ISO) |

#### 3.8.2 Bill Query

| Property   | Value                     |
| ---------- | ------------------------- |
| **Path**   | `POST /api/v1/bill/query` |
| **Method** | POST                      |

**Request Body (Common)**

| Field          | Type                | Required | Description                                |
| -------------- | ------------------- | -------- | ------------------------------------------ |
| `service_type` | string              |          | education / isp / insurance                |
| `amount`       | number              |          | Amount (optional for query)                |
| `reference_id` | string              | ✅       | Payee/bill identifier                      |
| `mobile_no`    | string              |          | Required for education & isp (01XXXXXXXXX) |
| `dob`          | string (YYYY-MM-DD) |          | Date of birth                              |
| `bill_month`   | string (YYYY-MM)    |          | Billing month                              |

**Response Body (Common)**

| Field            | Type   | Required | Description           |
| ---------------- | ------ | -------- | --------------------- |
| `name`           | string |          | Customer name         |
| `amount_due`     | number | ✅       | Amount to collect     |
| `reference_id`   | string | ✅       | Reference ID          |
| `transaction_id` | string | ✅       | Unique ID for payment |
| `due_date`       | string |          | Due date              |
| `package`        | string |          | ISP package           |
| `billing_cycle`  | string |          | Billing cycle         |

#### 3.8.3 Payment Confirmation

| Property   | Value                               |
| ---------- | ----------------------------------- |
| **Path**   | `POST /api/v1/bill/payment/confirm` |
| **Method** | POST                                |

**Request Body**

| Field                 | Type   | Required | Description         |
| --------------------- | ------ | -------- | ------------------- |
| `transaction_id`      | string | ✅       | From bill query     |
| `payment_approval_id` | string | ✅       | Payment approval ID |
| `reference_id`        | string | ✅       | Reference ID        |
| `amount`              | number | ✅       | Amount              |

**Response**

| Field                 | Type   | Description          |
| --------------------- | ------ | -------------------- |
| `status`              | string | success              |
| `message`             | string | Payment Confirmed    |
| `confirmation_id`     | string | Confirmation ID      |
| `transaction_id`      | string | Transaction ID       |
| `payment_approval_id` | string | Approval ID          |
| `data`                | object | service_type, amount |

#### 3.8.4 Payment Confirmation Status

| Property   | Value                              |
| ---------- | ---------------------------------- |
| **Path**   | `POST /api/v1/bill/payment/status` |
| **Method** | POST                               |

**Request Body**

| Field            | Type   | Required | Description    |
| ---------------- | ------ | -------- | -------------- |
| `transaction_id` | string | ✅       | Transaction ID |
| `reference_id`   | string | ✅       | Reference ID   |

**Response**

| Field                 | Type   | Description          |
| --------------------- | ------ | -------------------- |
| `status`              | string | success              |
| `message`             | string | Payment Success      |
| `confirmation_id`     | string | Confirmation ID      |
| `transaction_id`      | string | Transaction ID       |
| `payment_approval_id` | string | Approval ID          |
| `details`             | object | service_type, amount |

**Error response:** `{ "status": "failed", "error_code": "BILL_NOT_FOUND", "message": "..." }`  
**Status codes:** 200, 400, 404, 500

---

## 4. Product Profile Values

| Value                | Use Case                |
| -------------------- | ----------------------- |
| `telecom-vertical`   | Mobile recharge, top-up |
| `travel-vertical`    | Hotels, travel          |
| `airline-tickets`    | Flight tickets          |
| `non-physical-goods` | Digital goods           |
| `physical-goods`     | Physical products       |
| `general`            | General                 |

---

## 5. Transaction Status Values

| Status        | Meaning                             |
| ------------- | ----------------------------------- |
| `VALID`       | Successful transaction              |
| `VALIDATED`   | Valid, but validated more than once |
| `FAILED`      | Transaction failed                  |
| `CANCELLED`   | Cancelled by customer               |
| `EXPIRED`     | Payment timeout                     |
| `UNATTEMPTED` | No payment channel chosen           |
| `PENDING`     | Awaiting completion                 |

---

## 6. Package Design Notes (for TypeScript)

1. **Config object:** `storeId`, `storePassword`, `isLive` (or `mode: 'sandbox' | 'live'`)
2. **Base URL resolver:** Use `isLive` to pick sandbox vs live base URL
3. **Endpoints:** Map each API to a typed function (e.g. `initiateSession`, `validateOrder`, `refund`, etc.)
4. **Request/Response types:** Define interfaces for each endpoint
5. **IPN:** Provide a typed parser/validator for IPN payloads
6. **Validation:** Use `val_id` + Order Validation API before updating DB

---

## 7. Network / Firewall

- **Sandbox:** sandbox.sslcommerz.com (TCP 443)
- **Live:** securepay.sslcommerz.com (TCP 443)
- **IPN:** Merchant listener must be reachable from the internet (ports 80/443)
- **Whitelist:** SSLCommerz IPs may need to be whitelisted

### SSLCommerz IPs (from docs)

| Environment | Outbound (your server → SSLCommerz)        | Inbound (SSLCommerz → your IPN)               |
| ----------- | ------------------------------------------ | --------------------------------------------- |
| **Sandbox** | TCP 443 to 103.26.139.148, 103.132.153.148 | TCP 80/443 from 103.26.139.81, 103.132.153.81 |
| **Live**    | TCP 443 to 103.26.139.87                   | TCP 80/443 from 103.26.139.87                 |

---

## 8. Quick Bank Pay – Error & Status Codes

**Error response format:**

```json
{
  "status": "failed",
  "error_code": "BILL_NOT_FOUND",
  "message": "No bill available for provided information"
}
```

**HTTP status codes:** 200 (Success), 400 (Invalid Request), 404 (Bill Not Found), 500 (Internal Server Error)

**Notes:** Log request/response; use idempotency keys on payment confirmation; validate phone (E.164) and dates client-side.
