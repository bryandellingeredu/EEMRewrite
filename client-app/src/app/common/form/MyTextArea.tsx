import { useField } from "formik";
import { Form, Label } from "semantic-ui-react";
import autosize from 'autosize';
import { useEffect, useRef } from 'react';

interface Props{
    placeholder: string;
    name: string;
    rows: number;
    label?: string;
}

export default function MyTextArea(props: Props){
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
  

    return(
      <Form.Field error={meta.touched && !!meta.error}>
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