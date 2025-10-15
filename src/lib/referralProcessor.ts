import User from '@/models/User';
import Referral from '@/models/Referral';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function processReferralReward(formId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the form and user
    const form = await Form.findById(formId).session(session);
    if (!form) {
      throw new Error('Form not found');
    }

    const referredUser = await User.findById(form.user_id).session(session);
    if (!referredUser || !referredUser.referred_by) {
      // No referral to process
      await session.commitTransaction();
      return { success: true, message: 'No referral to process' };
    }

    // Find the referrer
    const referrer = await User.findOne({ referral_code: referredUser.referred_by }).session(session);
    if (!referrer) {
      throw new Error('Referrer not found');
    }

    // Check if referrer has reached the 10K ETB limit
    if ((referrer.referral_earnings || 0) >= 10000) {
      await session.commitTransaction();
      return { success: true, message: 'Referrer has reached earnings limit' };
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referrer_id: referrer._id,
      referred_user_id: referredUser._id,
      form_id: formId
    }).session(session);

    if (existingReferral) {
      if (existingReferral.reward_status === 'pending') {
        // Update existing referral to paid
        existingReferral.reward_status = 'paid';
        existingReferral.reward_date = new Date();
        await existingReferral.save({ session });

        // Update referrer earnings
        const newEarnings = Math.min(10000, (referrer.referral_earnings || 0) + 50);
        referrer.referral_earnings = newEarnings;
        await referrer.save({ session });
      }
    } else {
      // Create new referral record
      const rewardAmount = Math.min(50, 10000 - (referrer.referral_earnings || 0));
      
      if (rewardAmount > 0) {
        const newReferral = new Referral({
          referrer_id: referrer._id,
          referred_user_id: referredUser._id,
          form_id: formId,
          reward_amount: rewardAmount,
          reward_status: 'paid',
          reward_date: new Date()
        });
        await newReferral.save({ session });

        // Update referrer stats
        referrer.referral_earnings = (referrer.referral_earnings || 0) + rewardAmount;
        referrer.total_referrals = (referrer.total_referrals || 0) + 1;
        await referrer.save({ session });
      }
    }

    await session.commitTransaction();
    return { success: true, message: 'Referral reward processed successfully' };
  } catch (error) {
    await session.abortTransaction();
    console.error('Referral processing error:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

export async function createPendingReferral(referrerCode: string, referredUserId: string, formId: string) {
  try {
    // Find the referrer
    const referrer = await User.findOne({ referral_code: referrerCode });
    if (!referrer) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Check if referrer has reached the limit
    if ((referrer.referral_earnings || 0) >= 10000) {
      return { success: false, message: 'Referrer has reached earnings limit' };
    }

    // Create pending referral
    const referral = new Referral({
      referrer_id: referrer._id,
      referred_user_id: referredUserId,
      form_id: formId,
      reward_amount: 50,
      reward_status: 'pending'
    });
    await referral.save();

    return { success: true, message: 'Pending referral created' };
  } catch (error) {
    console.error('Create pending referral error:', error);
    return { success: false, message: 'Failed to create referral' };
  }
}
