/**
 * Helper function to completely reset the Cast SDK state when having issues.
 * This is particularly useful for iOS 18.5 where the Cast SDK might get into a bad state.
 *
 * @returns Promise that resolves when the reset is complete
 */
export declare function resetCastSDK(): Promise<void>;
export default resetCastSDK;
