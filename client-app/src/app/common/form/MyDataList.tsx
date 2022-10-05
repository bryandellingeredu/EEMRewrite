import { useField } from "formik";
import { Form, Input, Label } from "semantic-ui-react";

interface Props{
    placeholder: string;
    name: string;
    label?: string;
    options: string[];
    dataListId: string;
}

export default function MyDataList(props: Props){
    const [field, meta] = useField(props.name);

    return(
      <Form.Field error={meta.touched && !!meta.error}>
        <label>
            {props.label}
        </label>
        <Input {...field}
         placeholder={props.placeholder}
         name={props.name}
        list={props.dataListId} />
        <datalist id={props.dataListId}>
        {props.options.map(option => (
               <option value={option}>{option}</option>
                ))}  
        </datalist>
        {meta.touched && meta.error ? (
            <Label basic color='red'>
                {meta.error}
            </Label>
        ) : null} 
      </Form.Field>
    )
}