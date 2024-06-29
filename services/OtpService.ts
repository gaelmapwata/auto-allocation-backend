import add from 'date-fns/add';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import Otp from '../models/Otp';
import { bcryptHashPassword } from '../utils/bcrypt.util';
import utilities from '../utils/utilities';

const OTP_MINUTES_VALIDITY = 5; // 5 minutes

export default {
  async generateOtp(): Promise<{ otp: string, hashedOTP: string }> {
    const otp = utilities.generateNumericOTP();
    const hashedOTP = await bcryptHashPassword(otp);
    return { otp, hashedOTP };
  },
  async createOtpForUser(email: string): Promise<{ otp: string, hashedOTP: string }> {
    const { otp, hashedOTP } = await this.generateOtp();

    await Otp.create({
      email,
      otp: hashedOTP,
      expirationDate: add(new Date(), { minutes: OTP_MINUTES_VALIDITY }).toISOString().split('.')[0],
    });

    return { otp, hashedOTP };
  },
  /**
   * Check if the hashed otp in DB of a user correspond to the `clearOtp` passed in param
   * @returns return the otp model if the param `"clearOtp"` is correct,
   *  return `undefined` if is wrong
   */
  async checkOtpFromUser(email: string, clearOtp: string): Promise<Otp | undefined> {
    const otps = await Otp.findAll({
      where: {
        email,
        expirationDate: {
          [Op.gte]: new Date(),
        },
      },
    });

    return otps.find((dbOtp) => bcrypt.compareSync(clearOtp, dbOtp.otp));
  },
};
