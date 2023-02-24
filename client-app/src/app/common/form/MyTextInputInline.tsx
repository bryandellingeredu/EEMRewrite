import { useField } from "formik";
import { Form,  Label } from "semantic-ui-react";

interface Props{
    placeholder: string;
    name: string;
    label?: string;
    type?: string;
}

export default function MyTextInputInline(props: Props){
    const [field, meta] = useField(props.name);

    return (
        <Form.Field error={meta.touched && !!meta.error} inline>
          <label>
            {props.label}
          </label>
          <input {...field} {...props} style={{ width: "80%" }}  />
          {meta.touched && meta.error ? (
            <Label basic color="red">
              {meta.error}
            </Label>
          ) : null}
        </Form.Field>
      );
}