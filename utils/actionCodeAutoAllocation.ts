const actionCodeAutoAllocation = {
  getActionCodeAutoAllocation: (sKeyresult:string) => {
    let success = false;
    let error = '';

    switch (sKeyresult) {
      case 'DP02050001000':
        success = false;
        error = 'AMBIGUOUS';
        break;
      case 'DP02050001002':
        success = false;
        error = 'FAILED';
        break;
      case 'DP02050001003':
        success = false;
        error = 'Something went wrong';
        break;
      case 'DP02050001007':
        success = false;
        error = 'Transaction with given external id, channel already exists';
        break;
      case 'DP02050001015':
        success = false;
        error = 'Validation Error';
        break;
      case 'DP02050001016':
        success = false;
        error = 'Invalid nickname. Please try again';
        break;
      case 'DP02050001017':
        success = false;
        error = 'Invalid msisdn. Please try again';
        break;
      case 'DP02050001001':
        success = true;
        error = 'SUCCESS';
        break;
      default:
        success = false;
        error = 'no response from AutoAllocation Service';
        break;
    }

    return { success, error };
  },
};

export default actionCodeAutoAllocation;
