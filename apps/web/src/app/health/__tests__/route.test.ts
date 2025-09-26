import { describe, it, expect } from 'vitest';
import { GET, HEAD } from '../route';

describe('Health Check Route', () => {
  describe('GET /health', () => {
    it('should return OK status with correct headers', async () => {
      const response = await GET();

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('OK');
    });

    it('should have correct content type header', async () => {
      const response = await GET();

      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    });

    it('should have no-store cache control', async () => {
      const response = await GET();

      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should return plain text response', async () => {
      const response = await GET();
      const text = await response.text();

      expect(text).toBe('OK');
      expect(typeof text).toBe('string');
    });

    it('should always return 200 status', async () => {
      // Call multiple times to ensure consistent behavior
      const responses = await Promise.all([GET(), GET(), GET()]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('HEAD /health', () => {
    it('should return OK status without body', async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it('should have no-store cache control', async () => {
      const response = await HEAD();

      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should not have content type header for HEAD request', async () => {
      const response = await HEAD();

      expect(response.headers.get('Content-Type')).toBeNull();
    });

    it('should return consistent status codes', async () => {
      // Call multiple times to ensure consistent behavior
      const responses = await Promise.all([HEAD(), HEAD(), HEAD()]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeNull();
      });
    });
  });

  describe('Health check functionality', () => {
    it('should respond quickly', async () => {
      const startTime = Date.now();
      await GET();
      const endTime = Date.now();

      // Should respond within 100ms (very generous for a simple health check)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not throw errors', async () => {
      await expect(GET()).resolves.not.toThrow();
      await expect(HEAD()).resolves.not.toThrow();
    });

    it('should be stateless', async () => {
      // Multiple calls should not affect each other
      const response1 = await GET();
      const response2 = await GET();
      const response3 = await GET();

      const text1 = await response1.text();
      const text2 = await response2.text();
      const text3 = await response3.text();

      expect(response1.status).toBe(response2.status);
      expect(response2.status).toBe(response3.status);
      expect(text1).toBe(text2);
      expect(text2).toBe(text3);
    });
  });

  describe('Response format', () => {
    it('should return valid HTTP response for GET', async () => {
      const response = await GET();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    });

    it('should return valid HTTP response for HEAD', async () => {
      const response = await HEAD();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    });

    it('should have proper response structure', async () => {
      const response = await GET();

      expect(response.headers).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.statusText).toBeDefined();
      expect(typeof response.status).toBe('number');
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => GET());
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle rapid successive calls', async () => {
      const responses = [];
      for (let i = 0; i < 5; i++) {
        responses.push(await GET());
      }

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work as a basic health check endpoint', async () => {
      // Simulate a load balancer or monitoring system checking health
      const response = await GET();
      
      // Should return 200 OK for healthy status
      expect(response.status).toBe(200);
      
      // Should return simple OK message
      const body = await response.text();
      expect(body).toBe('OK');
      
      // Should not cache the response
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('should support HEAD requests for efficient health checks', async () => {
      // HEAD requests are often used by load balancers for efficiency
      const response = await HEAD();
      
      // Should return 200 OK
      expect(response.status).toBe(200);
      
      // Should not include body (HEAD request)
      expect(response.body).toBeNull();
      
      // Should not cache the response
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
  });
});
