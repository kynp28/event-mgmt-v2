import { Worker, Queue, Job } from 'bullmq';
import { prisma } from '../config/prisma';
import { getRedisClient, boothLockKey } from '../common/utils/redis';

// Note: Websocket broadcast left as a placeholder 
function broadcastBoothStatusChange(data: any) {
  console.log('[WS Broadcast]', data);
}

export async function releaseAndTryPromote(boothId: number, _reason: string) {
  const redis = getRedisClient();

  const promoted = await prisma.$transaction(async (tx) => {
    // Release the booth
    const releaseRes = await tx.$executeRaw`
      UPDATE booths
      SET lock_state = 'none', 
          locked_by_user_id = NULL,
          locked_at = NULL,
          locked_until = NULL,
          version = version + 1
      WHERE booth_id = ${boothId} 
        AND lock_state != 'none'
    `;

    if (releaseRes === 0) return false;

    // Check waitlist
    const waitlist = await tx.$queryRaw<any[]>`
      SELECT waitlist_id, vendor_id, event_id 
      FROM waitlist
      WHERE booth_id = ${boothId} AND status = 'waiting' AND (offer_deadline IS NULL OR offer_deadline < NOW())
      ORDER BY queue_position ASC
      LIMIT 1
      FOR UPDATE
    `;

    if (waitlist.length > 0) {
      const nextPerson = waitlist[0];
      
      // Mark as waitlist_reserved
      await tx.$executeRaw`
        UPDATE booths
        SET lock_state = 'waitlist_reserved',
            locked_by_user_id = ${nextPerson.vendor_id},
            locked_at = NOW(),
            locked_until = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
            version = version + 1
        WHERE booth_id = ${boothId}
      `;

      // Update waitlist entry
      await tx.waitlist.update({
        where: { waitlistId: nextPerson.waitlist_id },
        data: {
          offeredAt: new Date(),
          offerDeadline: new Date(Date.now() + 5 * 60 * 1000)
        }
      });
      return true;
    }

    return false;
  });

  // Redis lock cleanup
  await redis.del(boothLockKey(boothId)).catch(() => {});
  
  if (promoted !== false) {
    broadcastBoothStatusChange({
      boothId,
      status: promoted ? 'reserved' : 'available'
    });
  }
}

export async function runCleanupCycle() {
  let expiredBookings = 0;
  let expiredOffers = 0;

  // 1. Expired Bookings (only if no payment uploaded or payment was rejected and grace period expired)
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'pending',
      paymentDeadline: { lt: new Date() },
      OR: [
        { payment: null },
        { payment: { status: 'rejected' } }
      ]
    },
    select: { bookingId: true, boothId: true, vendorId: true }
  });

  for (const b of bookings) {
    try {
      const updated = await prisma.booking.updateMany({
        where: { bookingId: b.bookingId, status: 'pending', paymentDeadline: { lt: new Date() } },
        data: { status: 'cancelled', cancelReason: 'payment_timeout' }
      });
      if (updated.count > 0) {
        await releaseAndTryPromote(b.boothId, 'payment_timeout');
        expiredBookings++;
      }
    } catch (e) {
      console.error('[Cleanup] Booking expiry failed', b.bookingId, e);
    }
  }

  // 2. Expired Waitlist Offers
  const offers = await prisma.waitlist.findMany({
    where: {
      status: 'waiting',
      offerDeadline: { lt: new Date() }
    },
    select: { waitlistId: true, boothId: true }
  });

  for (const o of offers) {
    try {
      const updated = await prisma.waitlist.updateMany({
        where: { waitlistId: o.waitlistId, status: 'waiting', offerDeadline: { lt: new Date() } },
        data: { status: 'cancelled', cancelReason: 'offer_timeout' }
      });
      if (updated.count > 0) {
        await releaseAndTryPromote(o.boothId, 'waitlist_offer_timeout');
        expiredOffers++;
      }
    } catch (e) {
      console.error('[Cleanup] Offer expiry failed', o.waitlistId, e);
    }
  }

  if (expiredBookings > 0 || expiredOffers > 0) {
    console.log(`[Cleanup] Expired Bookings: ${expiredBookings}, Expired Offers: ${expiredOffers}`);
  }

  // 3. Delete old appeals (older than 30 days)
  await runAppealCleanup();
}

import fs from 'fs';
import path from 'path';

export async function runAppealCleanup() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldAppeals = await prisma.accountAppeal.findMany({
    where: {
      status: { in: ['approved', 'rejected'] },
      updatedAt: { lt: thirtyDaysAgo }
    },
    select: { appealId: true, evidenceUrl: true }
  });

  let deletedCount = 0;
  for (const appeal of oldAppeals) {
    try {
      // 1. Delete file if exists
      if (appeal.evidenceUrl) {
        // evidenceUrl is like '/uploads/appeals/filename.png'
        const filePath = path.join(process.cwd(), 'public', appeal.evidenceUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // 2. Delete record
      await prisma.accountAppeal.delete({
        where: { appealId: appeal.appealId }
      });
      deletedCount++;
    } catch (e) {
      console.error('[Cleanup] Appeal cleanup failed', appeal.appealId, e);
    }
  }

  if (deletedCount > 0) {
    console.log(`[Cleanup] Deleted ${deletedCount} old appeals`);
  }
}

// BullMQ setup
export const cleanupQueue = new Queue('booth-cleanup', { connection: getRedisClient() });

export const cleanupWorker = new Worker('booth-cleanup', async (_job: Job) => {
  await runCleanupCycle();
}, { connection: getRedisClient() });

cleanupWorker.on('failed', (job, err) => {
  console.error(`[Cleanup Worker] Job failed: ${job?.id}`, err);
});

// Add repeatable job to run every 1 minute
// Add repeatable job to run every 1 minute
(cleanupQueue.add as any)('cleanup-cycle', {}, {
  repeat: {
    pattern: '* * * * *'
  }
}).then(() => {
  console.log('[Cleanup Worker] Scheduled repeatable cleanup job');
});
