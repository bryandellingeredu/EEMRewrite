import { useField } from "formik";
import { Form, Label } from "semantic-ui-react";

interface Props{
    name: string;
    label?: string;
}

export default function MyCheckBox(props: Props){
    const [field, meta] = useField(props.name);

    return(
      <Form.Field>
        <label>
            {props.label}
        </label>
        <input {...field}  type="checkbox" checked={field.value}/>
      </Form.Field>
    )
}