import { useField } from "formik";
import { Form, Label } from "semantic-ui-react";

interface Props{
    name: string;
    label?: string;
    disabled?: boolean
}

export default function MyCheckBox(props: Props){
    const [field, meta] = useField(props.name);

    return(
      <Form.Field>
        <label>
            {props.label}
        </label>
        <input {...field}  type="checkbox" checked={field.value} disabled={props.disabled}/>
        {meta.touched && meta.error ? (
                <Label basic color='red'>{meta.error}</Label>
            ) : null}
      </Form.Field>
    )
}