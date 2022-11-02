import { useField } from "formik";
import { Form } from "semantic-ui-react";

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
      </Form.Field>
    )
}