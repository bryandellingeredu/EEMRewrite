import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import { useField} from 'formik';
import { Form, Label } from "semantic-ui-react";


interface Option{
    label: string
    value: string
    isDisabled: boolean
  }

interface Props  {
  placeholder: string;
  name: string;
  options: Option[]
  label?: string;
}

export default function MyMultiSelectInput(props: Props) {
  const [field, meta, helpers] = useField(props.name); 
  
  const animatedComponents = makeAnimated();


  const onChange = (selectedOptions: any) => {
    const values = selectedOptions.map((item: Option) => item.value);
    return values;
  }

 

    const getValue = () => {
      if (props.options) {
      props.options.filter(option => field.value.indexOf(option.value) >= 0)
      } else {
        return [];
      }
    };

    return (
      <Form.Field error={meta.touched && !!meta.error}>
      <label>{props.label}</label>
      <Select
      name={field.name}
      value={getValue()}
      onChange={(e) => helpers.setValue(onChange(e))}
      onBlur={() => helpers.setTouched(true)}
      placeholder={props.placeholder}
      options={props.options}
      closeMenuOnSelect={false}
      components={animatedComponents}
      isMulti
    />
         {meta.touched && meta.error ? (
                <Label basic color='red'>{meta.error}</Label>
          ) : null}
    </Form.Field>
    )
 }