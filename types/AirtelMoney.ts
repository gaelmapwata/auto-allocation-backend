export interface CheckKYCResponseI {
  data: {
    is_barred: boolean,
    grade: string,
    last_name: string,
    registration: {
        status: string
    },
    msisdn: string,
    first_name: string,
    is_pin_set: boolean
  },
  status: {
    message: string,
    success: boolean
  }
}

export interface AutoAllocationResponseI {
  data: {
    additional_info: {
      mq_txn_id: string
    },
    transaction: {
      reference_id: string,
      airtel_money_id: string,
      id: string,
      status: string,
    }
  },
  status: {
    response_code: string,
    code: string,
    success: boolean,
    message: string
  }
}

export interface AirtelLoginResponseI {
  data: {
    access_token: string
  }
}
