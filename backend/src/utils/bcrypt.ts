import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate random password
 */
export const generateRandomPassword = (length: number = 12): string => {
    // Exclude ambiguous characters like l, 1, O, 0, and symbols that can get mangled in HTML
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

