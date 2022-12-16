import { useField } from 'formik';
import { Form, Label } from 'semantic-ui-react';

interface Props{
    name: string;
    label?: string;
    disabled?: boolean
}

export default function MySemanticCheckBox(props: Props){
    const [field, meta, helpers] = useField(props.name!);

    return(
        <>
        <Form.Checkbox
         label = {props.label}
         checked={field.value}
         disabled={props.disabled}
         onChange={() => helpers.setValue(!field.value)}
        />
        { meta.error ? (
            <Label basic color='red' style={{marginTop: '50px', marginLeft: '-85px'}}>
                {meta.error}
            </Label>
        ) : null} 
        </>
    )
}