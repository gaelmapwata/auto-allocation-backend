export interface IMailPayload {
  mailFrom?: string,
  template: string,
  mailTo?: string | string[],
  locals?: { [key: string]: string}
}
