import { useField } from "formik";
import { Form, Input, Label } from "semantic-ui-react";

interface Props{
    placeholder: string;
    name: string;
    label?: string;
    type?: string;
}

export default function MyRequiredTextInput(props: Props){
    const [field, meta] = useField(props.name);

    return(
      <Form.Field error={meta.touched && !!meta.error}>
        <label>
            {props.label}
        </label>
        <Input {...field} {...props}
          label={{ icon: 'asterisk' }}
          labelPosition='left corner'
        />
        {meta.touched && meta.error ? (
            <Label basic color='red'>
                {meta.error}
            </Label>
        ) : null} 
      </Form.Field>
    )
}