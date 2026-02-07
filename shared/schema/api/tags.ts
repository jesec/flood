import {z} from 'zod';

import {noComma} from '../../util/regEx';

const TAG_NO_COMMA_MESSAGE = {
  message: 'Tag must not contain comma',
};

export const tagSchema = z.string().regex(noComma, TAG_NO_COMMA_MESSAGE);
export const tagsSchema = z.array(tagSchema);
