import {AccessLevel} from '../../shared/schema/constants/Auth';

export default <T extends {user?: {level: AccessLevel}}>(req: T) => {
  return req.user != null && req.user.level === AccessLevel.ADMINISTRATOR;
};
