import {FC, useRef, useState} from 'react';

import {FormElementAddon, FormRow, FormRowGroup, Textbox} from '../../../ui';
import AddMini from '../../icons/AddMini';
import RemoveMini from '../../icons/RemoveMini';

export const getTextArray = (formData: Record<string, string | undefined>, id: string) => {
  return Object.keys(formData).reduce((accumulator: Array<string>, formItemKey: string) => {
    if (formItemKey.startsWith(id)) {
      const text = formData[formItemKey];
      if (text != null) {
        accumulator.push(text);
      }
    }
    return accumulator;
  }, []);
};

type Textboxes = Array<{id: number; value: string}>;

interface TextboxRepeaterProps {
  defaultValues?: Textboxes;
  id: number | string;
  label?: string;
  placeholder?: string;
}

const TextboxRepeater: FC<TextboxRepeaterProps> = ({defaultValues, id, label, placeholder}: TextboxRepeaterProps) => {
  const idCounter = useRef<number>(0);
  const [textboxes, setTextboxes] = useState<Textboxes>(defaultValues ?? [{id: 0, value: ''}]);

  return (
    <FormRowGroup>
      {textboxes.map((textbox, index) => {
        let removeButton = null;

        if (index > 0) {
          removeButton = (
            <FormElementAddon
              onClick={() => {
                const newTextboxes = textboxes.slice();
                newTextboxes.splice(index, 1);
                setTextboxes(newTextboxes);
              }}>
              <RemoveMini size="mini" />
            </FormElementAddon>
          );
        }

        return (
          <FormRow key={textbox.id}>
            <Textbox
              addonPlacement="after"
              id={`${id}-${textbox.id}`}
              defaultValue={textbox.value}
              label={index === 0 && label}
              placeholder={placeholder}
              wrapperClassName="textbox-repeater">
              <FormElementAddon
                onClick={() => {
                  idCounter.current += 1;

                  const newTextboxes = textboxes.slice();
                  newTextboxes.splice(index + 1, 0, {
                    id: idCounter.current,
                    value: '',
                  });
                  setTextboxes(newTextboxes);
                }}>
                <AddMini size="mini" />
              </FormElementAddon>
              {removeButton}
            </Textbox>
          </FormRow>
        );
      })}
    </FormRowGroup>
  );
};

TextboxRepeater.defaultProps = {
  defaultValues: undefined,
  label: undefined,
  placeholder: undefined,
};

export default TextboxRepeater;
