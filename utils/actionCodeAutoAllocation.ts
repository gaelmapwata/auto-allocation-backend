const actionCodeAutoAllocation = {
  getActionCodeAutoAllocation: (sKeyresult:string) => {
    let errorMsg = '';

    switch (sKeyresult) {
      case 'DP02050001000':
        errorMsg = 'AMBIGUOUS';
        break;
      case 'DP02050001002':
        errorMsg = 'FAILED';
        break;
      case 'DP02050001003':
        errorMsg = 'Something went wrong';
        break;
      case 'DP02050001007':
        errorMsg = 'Transaction with given external id, channel already exists';
        break;
      case 'DP02050001015':
        errorMsg = 'Validation Error';
        break;
      case 'DP02050001016':
        errorMsg = 'Invalid nickname. Please try again';
        break;
      case 'DP02050001017':
        errorMsg = 'Invalid msisdn. Please try again';
        break;
      case 'DP02050001001':
        errorMsg = 'SUCCESS';
        break;
      default:
        errorMsg = 'no response from AutoAllocation Service';
        break;
    }

    return { errorMsg };
  },
};

export default actionCodeAutoAllocation;
