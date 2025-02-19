import {AccessToken} from './access-token.model';

import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';

export interface LoginInterface {
	/**
	 * @param model Model that is used by login service
	 */
	login(model: AuthModelInterface): Promise<AccessToken>;
}
