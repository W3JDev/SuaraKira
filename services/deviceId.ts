/**
 * Device ID Service
 *
 * Generates and manages a unique device identifier for tracking transaction sources.
 * Uses browser fingerprinting and localStorage for persistent device identification.
 *
 * Purpose: Part of "no-excuse" audit trail - tracks which device created each transaction.
 */

const DEVICE_ID_KEY = 'suarakira_device_id';
const DEVICE_INFO_KEY = 'suarakira_device_info';

interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  platform: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  createdAt: string;
  lastUsed: string;
}

/**
 * Generate a browser fingerprint hash
 * Combines multiple browser properties to create a semi-unique identifier
 */
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasFingerprint = '';

  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('SuaraKira', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('SuaraKira', 4, 17);
    canvasFingerprint = canvas.toDataURL();
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
    canvasFingerprint.substring(0, 100), // First 100 chars of canvas fingerprint
  ];

  // Simple hash function
  const fingerprint = components.join('|');
  return simpleHash(fingerprint);
}

/**
 * Simple hash function to convert fingerprint to shorter ID
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get or create device ID
 * Returns a persistent device identifier stored in localStorage
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Check if device ID already exists
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (deviceId) {
      // Update last used timestamp
      updateLastUsed();
      return deviceId;
    }

    // Generate new device ID
    const fingerprint = generateFingerprint();
    const timestamp = Date.now().toString(36);
    deviceId = `SK_${fingerprint}_${timestamp}`;

    // Store device ID
    localStorage.setItem(DEVICE_ID_KEY, deviceId);

    // Store device info for debugging
    const deviceInfo: DeviceInfo = {
      deviceId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));

    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    // Fallback: generate a random ID
    return `SK_FALLBACK_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Update last used timestamp
 */
function updateLastUsed(): void {
  try {
    const infoStr = localStorage.getItem(DEVICE_INFO_KEY);
    if (infoStr) {
      const info: DeviceInfo = JSON.parse(infoStr);
      info.lastUsed = new Date().toISOString();
      localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(info));
    }
  } catch (error) {
    console.error('Error updating device last used:', error);
  }
}

/**
 * Get full device information
 */
export function getDeviceInfo(): DeviceInfo | null {
  try {
    const infoStr = localStorage.getItem(DEVICE_INFO_KEY);
    if (infoStr) {
      return JSON.parse(infoStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
}

/**
 * Reset device ID (for testing or privacy)
 */
export function resetDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(DEVICE_INFO_KEY);
}

/**
 * Get app version from package.json or environment
 */
export function getAppVersion(): string {
  // In production, this should come from build process
  // For now, return a version string
  return import.meta.env.VITE_APP_VERSION || '2.0.0';
}

/**
 * Get device type based on screen size and user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(userAgent)) {
    return 'mobile';
  }

  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get device metadata for audit logging
 */
export async function getDeviceMetadata() {
  const deviceId = await getDeviceId();
  const deviceInfo = getDeviceInfo();

  return {
    deviceId,
    deviceType: getDeviceType(),
    appVersion: getAppVersion(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isOnline: isOnline(),
    timestamp: new Date().toISOString(),
    // Optional: include device info if available
    ...(deviceInfo && {
      deviceCreatedAt: deviceInfo.createdAt,
      timezone: deviceInfo.timezone,
    }),
  };
}
