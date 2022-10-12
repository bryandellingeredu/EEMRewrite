import { useField } from 'formik';
import { Form, Label } from 'semantic-ui-react';

interface Props{
    name: string;
    label?: string;
}

export default function MySemanticCheckBox(props: Props){
    const [field, meta, helpers] = useField(props.name!);

    return(
        <>
        <Form.Checkbox
         label = {props.label}
         checked={field.value}
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