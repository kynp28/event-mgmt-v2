import { Redis } from 'ioredis';

// Singleton Redis client for the application
let redisClient: Redis;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null
    });
    
    redisClient.on('error', (err) => {
      console.error('[Redis Error]', err);
    });
  }
  return redisClient;
}

export function boothLockKey(boothId: number): string {
  return `lock:booth:${boothId}`;
}
