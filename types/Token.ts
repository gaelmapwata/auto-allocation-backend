export enum TokenTypeE {
  PASSWORD_TOKEN = 'PASSWORD_TOKEN',
  MAIN_TOKEN = 'MAIN_TOKEN'
}

export interface TokenDecodedI {
  id: number,
  type: TokenTypeE
}
