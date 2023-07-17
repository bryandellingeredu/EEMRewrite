import { useField } from 'formik';
import { Form, Label } from 'semantic-ui-react';

interface Props{
    name: string;
    value: string;
    label: string;
}

export default function MySemanticRadioButton(props: Props){
    const [field, meta, helpers] = useField(props.name!);

    return(
        <>
        <Form.Radio
          label={props.label}
          value={props.value}
          name = {props.name}
          checked={field.value === props.value}
          onChange={(e) => helpers.setValue(e.currentTarget.querySelector('input')?.value)}
        />
        { meta.touched && meta.error ? (
            <Label basic color='red' style={{marginTop: '50px', marginLeft: '-85px'}}>
                {meta.error}
            </Label>
        ) : null} 
        </>
    )
}