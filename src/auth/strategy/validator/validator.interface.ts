import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';

/**
 * Classes using that interface are able to validate user that is trying to login
 */
export interface ValidatorInterface {
	/**
	 * Check if user is able to be logged in.
	 *
	 * @param userId UserId used to login into application
	 * @param habitatId habitatId connected to authorized model
	 */
	validate(
		userId: number,
		habitatId: number,
	): Promise<AuthModelInterface | null>;
}
