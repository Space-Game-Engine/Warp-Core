/**
 * Interface used by model that can be integrated into authorization service
 */
export interface AuthModelInterface {
	/**
	 * Get Id from implemented model
	 */
	getAuthId(): any;
}
