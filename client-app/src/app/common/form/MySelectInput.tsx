import { useState } from 'react';
import { useField } from 'formik';
import { Form, Label, Select } from 'semantic-ui-react';

interface Props {
  placeholder: string;
  name: string;
  options: any;
  label?: string;
}

export default function MySelectInput(props: Props) {
  const [field, meta, helpers] = useField(props.name);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: any, { searchQuery }: any) => {
    setSearchTerm(searchQuery);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
    setSearchTerm('');  // clear the search term
  };

  const filteredOptions = props.options.filter((option: any) =>
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Form.Field error={meta.touched && !!meta.error}>
      <label>{props.label}</label>
      <Select
        clearable
        search
        options={filteredOptions}
        value={field.value || null}
        onChange={(e, d) => helpers.setValue(d.value)}
        onBlur={handleBlur}  // use the new handleBlur
        onSearchChange={handleSearchChange}
        placeholder={props.placeholder}
      />
      {meta.touched && meta.error ? (
        <Label basic color='red'>{meta.error}</Label>
      ) : null}
    </Form.Field>
  );
}