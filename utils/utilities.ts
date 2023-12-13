export default {
  generateNumericOTP: () => {
    const lengthToken = 6;
    const numbersRule: { name: string; value: string; checked: boolean } = {
      name: 'Numbers',
      value: '0123456789',
      checked: true,
    };
    const charactersVal: string = numbersRule.checked ? numbersRule.value : '';

    let result = '';
    for (let i = 0; i < lengthToken; i++) {
      result += charactersVal.charAt(Math.floor(Math.random() * charactersVal.length));
    }
    return result;
  },
};
