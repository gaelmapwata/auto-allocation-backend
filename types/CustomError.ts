export default class AppError extends Error {
  statusCode;

  constructor(msg: string, statusCode: number) {
    super(msg);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
