import { afterAll, describe, expect, test } from 'vitest'
import { ensureArray, ensureSingle, getUrlFromBase, stringToBoolean, secondsToTime, getHashParameter, splitFlavor, timeToSeconds  } from '../src/index'


describe('utils', () => {
  describe('ensureArray', () => {
    test('should return the same array when input is already an array', () => {
      expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3]);
      expect(ensureArray([])).toEqual([]);
      expect(ensureArray(['test'])).toEqual(['test']);
    });

    test('should wrap single values into an array', () => {
      expect(ensureArray(1)).toEqual([1]);
      expect(ensureArray('test')).toEqual(['test']);
      expect(ensureArray(true)).toEqual([true]);
      expect(ensureArray({})).toEqual([{}]);
    });

    test('should return empty array for null or undefined values', () => {
      expect(ensureArray(null)).toEqual([]);
      expect(ensureArray(undefined)).toEqual([]);
    });

    test('should handle zero and false values correctly', () => {
      expect(ensureArray(0)).toEqual([0]);
      expect(ensureArray(false)).toEqual([false]);
      expect(ensureArray('')).toEqual(['']);
    });
  });

  describe('ensureSingle', () => {
    test('should return first element when input is an array', () => {
      expect(ensureSingle([1, 2, 3])).toEqual(1);
      expect(ensureSingle(['first', 'second'])).toEqual('first');
      expect(ensureSingle([true, false])).toEqual(true);
    });

    test('should return the value itself when input is not an array', () => {
      expect(ensureSingle(1)).toEqual(1);
      expect(ensureSingle('test')).toEqual('test');
      expect(ensureSingle(true)).toEqual(true);
    });

    test('should return null or undefined for null/undefined values', () => {
      expect(ensureSingle(null)).toEqual(null);
      expect(ensureSingle(undefined)).toEqual(undefined);
    });

    test('should return undefined for empty arrays', () => {
      expect(ensureSingle([])).toEqual(undefined);
    });

    test('should handle zero and false values correctly', () => {
      expect(ensureSingle(0)).toEqual(0);
      expect(ensureSingle(false)).toEqual(false);
      expect(ensureSingle('')).toEqual('');
    });
  });

  describe('getUrlFromBase', () => {
    test('should correctly combine base URL and path with proper slashes', () => {
      expect(getUrlFromBase('http://example.com', '/path/to/resource')).toEqual('http://example.com/path/to/resource');
      expect(getUrlFromBase('http://example.com/', '/path/to/resource')).toEqual('http://example.com/path/to/resource');
      expect(getUrlFromBase('http://example.com', 'path/to/resource')).toEqual('http://example.com/path/to/resource');
      expect(getUrlFromBase('http://example.com/', 'path/to/resource')).toEqual('http://example.com/path/to/resource');
    });

    test('should handle empty paths correctly', () => {
      expect(getUrlFromBase('http://example.com/', '')).toEqual('http://example.com');
      expect(getUrlFromBase('http://example.com', '')).toEqual('http://example.com');
    });

    test('should handle empty base URLs correctly', () => {
      expect(getUrlFromBase('/', '')).toEqual('/');
      expect(getUrlFromBase('', '/path/to/resource')).toEqual('/path/to/resource');
      expect(getUrlFromBase('', 'path/to/resource')).toEqual('path/to/resource');
    });

    test('should handle complex URLs with query parameters and fragments', () => {
      expect(getUrlFromBase('https://api.example.com/v1', '/users?active=true')).toEqual('https://api.example.com/v1/users?active=true');
      expect(getUrlFromBase('https://example.com', 'search?q=test#results')).toEqual('https://example.com/search?q=test#results');
    });

    test('should handle URLs with ports and subdomains', () => {
      expect(getUrlFromBase('http://api.subdomain.example.com:8080', '/endpoint')).toEqual('http://api.subdomain.example.com:8080/endpoint');
      expect(getUrlFromBase('https://localhost:3000/', 'api/data')).toEqual('https://localhost:3000/api/data');
    });

    
    test('should handle multiple consecutive slashes', () => {
      expect(getUrlFromBase('http://example.com//', '//path//to//resource')).toEqual('http://example.com/path//to//resource');
    });
  });

  describe('stringToBoolean', () => {
    test('should return true for truthy string values', () => {
      expect(stringToBoolean('true')).toBe(true);
      expect(stringToBoolean('tRuE')).toBe(true);
      expect(stringToBoolean('YES')).toBe(true);
      expect(stringToBoolean('1')).toBe(true);
      expect(stringToBoolean('TRUE')).toBe(true);
      expect(stringToBoolean('Yes')).toBe(true);
    });

    test('should return false for falsy string values', () => {
      expect(stringToBoolean('false')).toBe(false);
      expect(stringToBoolean('faLse')).toBe(false);
      expect(stringToBoolean('nO')).toBe(false);
      expect(stringToBoolean('0')).toBe(false);
      expect(stringToBoolean('FALSE')).toBe(false);
      expect(stringToBoolean('No')).toBe(false);
    });

    test('should return false for null and undefined values', () => {
      expect(stringToBoolean(null)).toBe(false);
      expect(stringToBoolean(undefined)).toBe(false);
    });

    test('should return false for unrecognized string values', () => {
      expect(stringToBoolean('no-value')).toBe(false);
      expect(stringToBoolean('maybe')).toBe(false);
      expect(stringToBoolean('2')).toBe(false);
      expect(stringToBoolean('')).toBe(false);
      expect(stringToBoolean('random')).toBe(false);
    });

    test('should handle strings with extra whitespace', () => {
      expect(stringToBoolean('  true  ')).toBe(true);
      expect(stringToBoolean('\tfalse\n')).toBe(false);
      expect(stringToBoolean(' YES ')).toBe(true);
      expect(stringToBoolean('  no  ')).toBe(false);
    });
  });

  describe('timeToSeconds', () => {
    test('should convert time strings to total seconds', () => {
      expect(timeToSeconds('00:00')).toBe(0);
      expect(timeToSeconds('00:01')).toBe(1);
      expect(timeToSeconds('01:00')).toBe(60);
      expect(timeToSeconds('01:01')).toBe(61);
      expect(timeToSeconds('02:30')).toBe(150);
      expect(timeToSeconds('01:00:00')).toBe(3600);
      expect(timeToSeconds('01:01:01')).toBe(3661);
      expect(timeToSeconds('03:47:41')).toBe(13661);
      expect(timeToSeconds('12')).toBe(12);
    });
    
    test('should handle leading zeros correctly', () => {
      expect(timeToSeconds('000:00')).toBe(0);
      expect(timeToSeconds('000:01')).toBe(1);
      expect(timeToSeconds('00:001')).toBe(1);
      expect(timeToSeconds('0001:00')).toBe(60);
    });

    test('should throw error for invalid time formats', () => {
      expect(() => timeToSeconds('invalid')).toThrowError('Invalid time format');
      expect(() => timeToSeconds('12:34:56:78')).toThrowError('Invalid time format');
      expect(() => timeToSeconds('::')).toThrowError('Invalid time format');
      expect(() => timeToSeconds('12:34:xx')).toThrowError('Invalid time format');
    });
  });


  describe('secondsToTime', () => {
    test('should format seconds only (less than 1 minute)', () => {
      expect(secondsToTime(0)).toBe('00:00');
      expect(secondsToTime(1)).toBe('00:01');
      expect(secondsToTime(59)).toBe('00:59');
      expect(secondsToTime(30)).toBe('00:30');
    });

    test('should format minutes and seconds (less than 1 hour)', () => {
      expect(secondsToTime(60)).toBe('01:00');
      expect(secondsToTime(61)).toBe('01:01');
      expect(secondsToTime(120)).toBe('02:00');
      expect(secondsToTime(150)).toBe('02:30');
      expect(secondsToTime(3599)).toBe('59:59');
    });

    test('should format hours, minutes and seconds (1 hour or more)', () => {
      expect(secondsToTime(3600)).toBe('01:00:00');
      expect(secondsToTime(3661)).toBe('01:01:01');
      expect(secondsToTime(13661)).toBe('03:47:41');
      expect(secondsToTime(7200)).toBe('02:00:00');
      expect(secondsToTime(86400)).toBe('24:00:00');
    });

    test('should handle decimal seconds by flooring the value', () => {
      expect(secondsToTime(1.9)).toBe('00:01');
      expect(secondsToTime(59.99)).toBe('00:59');
      expect(secondsToTime(3661.5)).toBe('01:01:01');
    });

    test('should handle large time values', () => {
      expect(secondsToTime(90061)).toBe('25:01:01'); // More than 24 hours
      expect(secondsToTime(359999)).toBe('99:59:59'); // 99+ hours
    });

    test('should handle edge case of zero time', () => {
      expect(secondsToTime(0)).toBe('00:00');
    });
  });

  describe('splitFlavor', () => {
    test('should correctly split valid MIME type flavors', () => {
      expect(splitFlavor('video/mp4')).toEqual(['video', 'mp4']);
      expect(splitFlavor('audio/mp3')).toEqual(['audio', 'mp3']);
      expect(splitFlavor('text/plain')).toEqual(['text', 'plain']);
      expect(splitFlavor('application/json')).toEqual(['application', 'json']);
      expect(splitFlavor('image/jpeg')).toEqual(['image', 'jpeg']);
    });

    test('should handle complex MIME types with subtypes', () => {
      expect(splitFlavor('application/vnd.ms-excel')).toEqual(['application', 'vnd.ms-excel']);
      expect(splitFlavor('text/html')).toEqual(['text', 'html']);
      expect(splitFlavor('video/x-msvideo')).toEqual(['video', 'x-msvideo']);
    });

    test('should throw error for invalid flavor formats', () => {
      expect(() => splitFlavor('invalid_flavor_type')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('invalid/flavor/type')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('onlytype')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('/missing-type')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('missing-subtype/')).toThrowError('Invalid flavor');
    });

    test('should handle edge cases with empty parts', () => {
      expect(() => splitFlavor('/')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('video/')).toThrowError('Invalid flavor');
      expect(() => splitFlavor('/mp4')).toThrowError('Invalid flavor');
    });
  });

  describe('getHashParameter (requires DOM environment)', () => {
    test('should return null when parameter does not exist in hash', () => {
      // Mock window.location.hash
      Object.defineProperty(window, 'location', {
        value: { hash: '#other=value' },
        writable: true
      });

      expect(getHashParameter('nonexistent')).toBeNull();
    });

    test('should extract parameter value from hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#param=testvalue' },
        writable: true
      });

      expect(getHashParameter('param')).toBe('testvalue');
    });

    test('should handle multiple parameters in hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#first=value1&second=value2&third=value3' },
        writable: true
      });

      expect(getHashParameter('first')).toBe('value1');
      expect(getHashParameter('second')).toBe('value2');
      expect(getHashParameter('third')).toBe('value3');
      expect(getHashParameter('fourth')).toBeNull();
    });

    test('should handle URL encoded values in hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#message=hello%20world&space=with%20spaces' },
        writable: true
      });

      expect(getHashParameter('message')).toBe('hello world');
      expect(getHashParameter('space')).toBe('with spaces');
    });

    test('should handle empty hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '' },
        writable: true
      });

      expect(getHashParameter('any')).toBeNull();
    });

    test('should handle hash with only # symbol', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#' },
        writable: true
      });

      expect(getHashParameter('any')).toBeNull();
    });
  });
});