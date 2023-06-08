import React, { useEffect, useRef } from 'react';
import { useField, useFormikContext } from "formik";
import { Form, Label, Dropdown } from "semantic-ui-react";
import autosize from 'autosize';

interface Props{
  placeholder: string;
  name: string;
  rows: number;
  label?: string;
  options: string[];
}

export default function MyTextAreaWithDropdown(props: Props){
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props.name);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      autosize(textAreaRef.current);
    }

    return () => {
      if (textAreaRef.current) {
        autosize.destroy(textAreaRef.current);
      }
    };
  }, []);

  const handleSelect = (event: React.SyntheticEvent<HTMLElement>, {value}: any) => {
    setFieldValue(props.name, value);
  };

  return(
    <Form.Field error={meta.touched && !!meta.error}>
      <label>
          {props.label}
      </label>
      <Dropdown
        placeholder='Select...'
        fluid
        selection
        options={props.options.map(option => ({ key: option, value: option, text: option }))}
        onChange={handleSelect}
      />
      <textarea
        {...field}
        {...props}
        ref={textAreaRef}
        className="ui input"
        style={{ minHeight: 'auto', resize: 'none' }}
      />
      {meta.touched && meta.error ? (
        <Label basic color="red">
          {meta.error}
        </Label>
      ) : null}
    </Form.Field>
  )
}
