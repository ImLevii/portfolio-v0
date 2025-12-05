import { v4 as uuidv4 } from 'uuid';

export function generateLicenseKey(): string {
    // Generate a UUID
    const uuid = uuidv4().replace(/-/g, '').toUpperCase();

    // Format as XXXX-XXXX-XXXX-XXXX (16 chars)
    const part1 = uuid.substring(0, 4);
    const part2 = uuid.substring(4, 8);
    const part3 = uuid.substring(8, 12);
    const part4 = uuid.substring(12, 16);

    return `${part1}-${part2}-${part3}-${part4}`;
}
