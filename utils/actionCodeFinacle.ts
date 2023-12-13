const ActionCodeFinacleUtilities = {
  getActionCodeFinacle: (sKeyresult:string) => {
    let isvalidate = false;
    let error = '';

    switch (sKeyresult) {
      case '114':
        isvalidate = false;
        error = 'Invalid account number';
        break;
      case '115':
        isvalidate = false;
        error = 'Requested function not supported';
        break;
      case '116':
        isvalidate = false;
        error = 'Insufficient funds';
        break;
      case '119':
        isvalidate = false;
        error = 'Transaction not permitted to card holder';
        break;
      case '121':
        isvalidate = false;
        error = 'Withdrawal amount limit exceeded';
        break;
      case '180':
        isvalidate = false;
        error = 'Transfer Limit Exceeded';
        break;
      case '182':
        isvalidate = false;
        error = 'Not all Cheques could be stopped';
        break;
      case '183':
        isvalidate = false;
        error = 'Cheque not issued to this account';
        break;
      case '800':
        isvalidate = false;
        error = 'Network message was accepted';
        break;
      case '902':
        isvalidate = false;
        error = 'Invalid transaction/ function code';
        break;
      case '904':
        isvalidate = false;
        error = 'Format Error (Any format related errors etc)';
        break;
      case '906':
        isvalidate = false;
        error = 'Cut-over in progress (When DC is generating PBF, it will give this result code)';
        break;
      case '907':
        isvalidate = false;
        error = 'CBA Inoperative (Confirm status before retrying/repeating the transaction)';
        break;
      case '909':
        isvalidate = false;
        error = 'System malfunction (Sent by CBA)';
        break;
      case '911':
        isvalidate = false;
        error = 'Service timed out; status is unknow (Confirm status before retrying/repeating the transaction)';
        break;
      case '913':
        isvalidate = false;
        error = 'Duplicate transaction Id';
        break;
      case '133':
        isvalidate = false;
        error = 'Format error(Sent by Web Service)';
        break;
      case '134':
        isvalidate = false;
        error = 'Data retreival error';
        break;
      case '135':
        isvalidate = false;
        error = 'Country Code is missing';
        break;
      case '136':
        isvalidate = false;
        error = 'invalid data type';
        break;
      case '137':
        isvalidate = false;
        error = 'Configuration error! Unable to retrieve bank details';
        break;
      case '138':
        isvalidate = false;
        error = 'Configuration error! Unable to retrieve SOL details';
        break;
      case '139':
        isvalidate = false;
        error = 'Unknown error. Check the service logs';
        break;
      case '140':
        isvalidate = false;
        error = 'Security violation';
        break;
      case '141':
        isvalidate = false;
        error = 'Security violation';
        break;
      case '111':
        isvalidate = false;
        error = 'Invalid Scheme Type';
        break;
      case '163':
        isvalidate = false;
        error = 'Invalid Cheque Status';
        break;
      case '181':
        isvalidate = false;
        error = 'Cheques are in different books';
        break;
      case '184':
        isvalidate = false;
        error = 'Account closed';
        break;
      case '185':
        isvalidate = false;
        error = 'Invalid ccurrency';
        break;
      case '186':
        isvalidate = false;
        error = 'Block does not exist';
        break;
      case '187':
        isvalidate = false;
        error = 'Cheque stopped';
        break;
      case '188':
        isvalidate = false;
        error = 'Invalid Rate Currency Combination';
        break;
      case '189':
        isvalidate = false;
        error = 'Cheque Book Already Issued';
        break;
      case '190':
        isvalidate = false;
        error = 'DD Already Paid';
        break;
      case '142':
        isvalidate = false;
        error = 'Invalid fee amount/account';
        break;
      case '143':
        isvalidate = false;
        error = 'Invalid stan';
        break;
      case '145':
        isvalidate = false;
        error = 'Invalid processing code';
        break;
      case '000':
        isvalidate = true;
        error = 'Financial transaction has been approved';
        break;
      default:
        isvalidate = false;
        error = 'no response from ESB';
        break;
    }

    return { isvalidate, error };
  },
};

export default ActionCodeFinacleUtilities;
